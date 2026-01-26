import React, { useState, useEffect } from 'react';
import { Exercise, Slide, CognitiveDomain, DifficultyTier } from '../types';
import { exercises as initialExercises } from '../data/exercises';
import { generateText, generateImage, refineImagePrompt, generateAutoDescription } from '../services/geminiService';
import Button from './Button';
import { Save, Plus, Trash2, Edit3, FileText, Image as ImageIcon, AlertCircle, RefreshCw, Sparkles, ArrowUp, ArrowDown, GripVertical, Loader2, Wand2, Trophy } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'script'>('details');
  const [refiningSlideId, setRefiningSlideId] = useState<string | null>(null);
  const [refiningPromptId, setRefiningPromptId] = useState<string | null>(null); // For slide prompts
  const [refiningThumbnailId, setRefiningThumbnailId] = useState<string | null>(null); // For thumbnail prompt
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);
  
  // Preview States
  const [previewImages, setPreviewImages] = useState<Record<string, string>>({});
  const [loadingPreviews, setLoadingPreviews] = useState<Record<string, boolean>>({});

  // Load from LocalStorage or Fallback to Static Data
  useEffect(() => {
    const savedData = localStorage.getItem('neuro_exercises');
    if (savedData) {
      setExercises(JSON.parse(savedData));
    } else {
      setExercises(initialExercises);
    }
  }, []);

  const selectedExercise = exercises.find(e => e.id === selectedId);

  const handleSave = () => {
    localStorage.setItem('neuro_exercises', JSON.stringify(exercises));
    setIsDirty(false);
    alert("Configuration saved to local environment.");
  };

  const handleReset = () => {
    if (window.confirm("This will revert all changes to the original static data. Are you sure?")) {
        setExercises(initialExercises);
        localStorage.removeItem('neuro_exercises');
        setSelectedId(null);
    }
  };

  const updateExerciseField = (field: keyof Exercise, value: any) => {
    if (!selectedId) return;
    const updated = exercises.map(e => e.id === selectedId ? { ...e, [field]: value } : e);
    setExercises(updated);
    setIsDirty(true);
  };

  const updateSlide = (slideId: string, field: keyof Slide, value: any) => {
    if (!selectedId || !selectedExercise) return;
    const newScript = selectedExercise.script.map(s => 
        s.id === slideId ? { ...s, [field]: value } : s
    );
    updateExerciseField('script', newScript);
  };

  const addSlide = () => {
    if (!selectedId || !selectedExercise) return;
    const newSlide: Slide = {
        id: `s-${Date.now()}`,
        text: 'New instruction line...',
        isInteractive: false
    };
    updateExerciseField('script', [...selectedExercise.script, newSlide]);
  };

  const removeSlide = (slideId: string) => {
    if (!selectedId || !selectedExercise) return;
    const newScript = selectedExercise.script.filter(s => s.id !== slideId);
    updateExerciseField('script', newScript);
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if (!selectedId || !selectedExercise) return;
    const newScript = [...selectedExercise.script];
    
    if (direction === 'up' && index > 0) {
        [newScript[index], newScript[index - 1]] = [newScript[index - 1], newScript[index]];
    } else if (direction === 'down' && index < newScript.length - 1) {
        [newScript[index], newScript[index + 1]] = [newScript[index + 1], newScript[index]];
    }
    
    updateExerciseField('script', newScript);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSlideIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSlideIndex === null || draggedSlideIndex === index) return;
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedSlideIndex === null || !selectedExercise) return;
    
    const newScript = [...selectedExercise.script];
    const [movedItem] = newScript.splice(draggedSlideIndex, 1);
    newScript.splice(dropIndex, 0, movedItem);
    
    updateExerciseField('script', newScript);
    setDraggedSlideIndex(null);
    setIsDirty(true);
  };

  const refineScriptWithAI = async (slide: Slide) => {
    if (!slide.text) return;
    setRefiningSlideId(slide.id);
    
    const systemPrompt = `You are an expert script editor for 'Cerebro', a refined, British, eccentric AI cognitive instructor. Rewrite the input text to match this persona. Keep it concise, encouraging, and intellectually stimulating.`;
    const refinedText = await generateText(slide.text, systemPrompt);
    
    updateSlide(slide.id, 'text', refinedText);
    setRefiningSlideId(null);
  };

  const handleRefineVisualPrompt = async (slide: Slide) => {
      // Allow if either visualPrompt OR text exists
      if (!slide.visualPrompt && !slide.text) return;
      
      setRefiningPromptId(slide.id);
      
      // Use existing prompt or fallback to script text
      const input = slide.visualPrompt || slide.text;
      const refined = await refineImagePrompt(input, 'slide');
      
      updateSlide(slide.id, 'visualPrompt', refined);
      setRefiningPromptId(null);
  };

  const handleRefineThumbnailPrompt = async () => {
      if (!selectedExercise?.thumbnailVisualPrompt) return;
      if (!selectedId) return;
      
      setRefiningThumbnailId(selectedId);
      const refined = await refineImagePrompt(selectedExercise.thumbnailVisualPrompt, 'thumbnail');
      updateExerciseField('thumbnailVisualPrompt', refined);
      setRefiningThumbnailId(null);
  };

  const handleAutoDescription = async () => {
      if (!selectedExercise) return;
      setGeneratingDesc(true);
      const scriptSample = selectedExercise.script.map(s => s.text).join(" ").substring(0, 500);
      const desc = await generateAutoDescription(selectedExercise.title, scriptSample);
      updateExerciseField('description', desc);
      setGeneratingDesc(false);
  };

  const generatePreview = async (slideId: string, prompt: string) => {
    if (!prompt) return;
    setLoadingPreviews(prev => ({ ...prev, [slideId]: true }));
    try {
        const url = await generateImage(prompt);
        if (url) {
            setPreviewImages(prev => ({ ...prev, [slideId]: url }));
        }
    } catch (e) {
        console.error("Preview generation failed", e);
    } finally {
        setLoadingPreviews(prev => ({ ...prev, [slideId]: false }));
    }
  };

  const createNewExercise = () => {
    const newEx: Exercise = {
        id: `ex-${Date.now()}`,
        title: 'Untitled Protocol',
        domain: CognitiveDomain.LOGICAL,
        tier: DifficultyTier.TIER_1,
        duration: 5,
        description: 'Description pending...',
        benefits: [],
        script: [
            { id: 's1', text: 'Welcome, Architect.', isInteractive: false }
        ]
    };
    setExercises([...exercises, newEx]);
    setSelectedId(newEx.id);
    setIsDirty(true);
  };

  return (
    <div className="min-h-[80vh] grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
      
      {/* Sidebar List */}
      <div className="lg:col-span-3 bg-neuro-surface border border-white/5 rounded-2xl p-4 flex flex-col h-full max-h-[85vh]">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white flex items-center">
                <FileText size={18} className="mr-2 text-neuro-primary"/> Protocols
            </h2>
            <button onClick={createNewExercise} className="p-2 bg-neuro-primary rounded-lg text-white hover:bg-blue-600 transition-colors" title="Create New Protocol">
                <Plus size={16} />
            </button>
        </div>
        
        <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {exercises.map(ex => (
                <button
                    key={ex.id}
                    onClick={() => setSelectedId(ex.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group ${
                        selectedId === ex.id 
                        ? 'bg-slate-800 border-neuro-primary shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                        : 'bg-transparent border-transparent hover:bg-slate-800/50'
                    }`}
                >
                    <div className="font-semibold text-sm text-slate-200 group-hover:text-white truncate">{ex.title}</div>
                    <div className="text-xs text-slate-500 flex justify-between mt-1">
                        <span>{ex.domain}</span>
                        <span>{ex.script.length} Slides</span>
                    </div>
                </button>
            ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
            <Button onClick={handleSave} disabled={!isDirty} className={`w-full ${isDirty ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 opacity-50'}`}>
                <Save size={16} className="mr-2" /> {isDirty ? 'Publish Changes' : 'Up to Date'}
            </Button>
            <button onClick={handleReset} className="w-full py-2 text-xs text-slate-500 hover:text-red-400 flex items-center justify-center">
                <RefreshCw size={12} className="mr-1"/> Reset to Defaults
            </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="lg:col-span-9 bg-slate-900/50 border border-white/5 rounded-2xl p-6 lg:p-8 relative overflow-hidden flex flex-col h-full max-h-[85vh]">
        {selectedExercise ? (
            <>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <input 
                            type="text" 
                            value={selectedExercise.title}
                            onChange={(e) => updateExerciseField('title', e.target.value)}
                            className="bg-transparent text-2xl lg:text-3xl font-bold text-white focus:outline-none focus:border-b-2 focus:border-neuro-primary w-full max-w-lg placeholder-slate-600"
                            placeholder="Exercise Title"
                        />
                        <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">ID: {selectedExercise.id}</span>
                            {isDirty && <span className="text-xs text-amber-500 flex items-center"><AlertCircle size={12} className="mr-1"/> Unsaved Changes</span>}
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex bg-slate-800 rounded-lg p-1">
                        <button 
                            onClick={() => setActiveTab('details')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'details' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            Metadata
                        </button>
                        <button 
                            onClick={() => setActiveTab('script')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'script' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            Script & Avatar
                        </button>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar">
                    {activeTab === 'details' && (
                        <div className="space-y-6 max-w-2xl animate-in fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cognitive Domain</label>
                                    <select 
                                        value={selectedExercise.domain}
                                        onChange={(e) => updateExerciseField('domain', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-neuro-primary focus:outline-none"
                                    >
                                        {Object.values(CognitiveDomain).map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Difficulty Tier</label>
                                    <select 
                                        value={selectedExercise.tier}
                                        onChange={(e) => updateExerciseField('tier', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-neuro-primary focus:outline-none"
                                    >
                                        {Object.values(DifficultyTier).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase">Description</label>
                                    <button 
                                        onClick={handleAutoDescription} 
                                        disabled={generatingDesc}
                                        className="text-[10px] text-neuro-primary hover:text-white flex items-center bg-slate-800 px-2 py-1 rounded border border-slate-700 hover:border-neuro-primary transition-colors"
                                    >
                                        {generatingDesc ? <Loader2 size={10} className="animate-spin mr-1"/> : <Wand2 size={10} className="mr-1"/>}
                                        Auto-Generate
                                    </button>
                                </div>
                                <textarea 
                                    value={selectedExercise.description}
                                    onChange={(e) => updateExerciseField('description', e.target.value)}
                                    rows={3}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-neuro-primary focus:outline-none"
                                />
                            </div>

                            {/* New: Publication Prize */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Publication Prize (Admin Only)</label>
                                <div className="flex items-center">
                                    <div className="bg-slate-800 px-3 py-3 rounded-l-xl border-y border-l border-slate-700 text-amber-500">
                                        <Trophy size={16} />
                                    </div>
                                    <input 
                                        type="text"
                                        value={selectedExercise.publicationPrize || ''}
                                        onChange={(e) => updateExerciseField('publicationPrize', e.target.value)}
                                        className="flex-grow bg-slate-800 border border-slate-700 rounded-r-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-neuro-primary focus:outline-none"
                                        placeholder="E.g., Featured in 'Cognitive Daily'"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1 ml-1">*Only visible for exercises marked as Competitions.</p>
                            </div>

                             {/* New: Thumbnail Prompt */}
                             <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase">Thumbnail Visual Prompt</label>
                                    <button 
                                        onClick={handleRefineThumbnailPrompt} 
                                        disabled={refiningThumbnailId === selectedExercise.id || !selectedExercise.thumbnailVisualPrompt}
                                        className="text-[10px] text-emerald-500 hover:text-white flex items-center bg-slate-800 px-2 py-1 rounded border border-slate-700 hover:border-emerald-500 transition-colors disabled:opacity-50"
                                    >
                                        {refiningThumbnailId === selectedExercise.id ? <Loader2 size={10} className="animate-spin mr-1"/> : <Sparkles size={10} className="mr-1"/>}
                                        Refine for Poster
                                    </button>
                                </div>
                                <textarea 
                                    value={selectedExercise.thumbnailVisualPrompt || ''}
                                    onChange={(e) => updateExerciseField('thumbnailVisualPrompt', e.target.value)}
                                    rows={2}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    placeholder="Describe the cover image for this exercise..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duration (Minutes)</label>
                                <input 
                                    type="number"
                                    value={selectedExercise.duration}
                                    onChange={(e) => updateExerciseField('duration', parseInt(e.target.value))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-neuro-primary focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'script' && (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm text-slate-400">
                                    Configure the sequence of avatar narration and visual generation. Drag to reorder.
                                </p>
                                <Button size="sm" variant="secondary" onClick={addSlide} icon={<Plus size={14}/>}>
                                    Add Slide
                                </Button>
                            </div>

                            {selectedExercise.script.map((slide, index) => (
                                <div 
                                    key={slide.id} 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={(e) => handleDrop(e, index)}
                                    className={`bg-slate-800/30 border border-white/5 rounded-xl p-4 pl-10 relative group hover:bg-slate-800/60 transition-colors ${draggedSlideIndex === index ? 'opacity-40 border-dashed border-neuro-primary' : ''}`}
                                >
                                    
                                    {/* Drag Handle */}
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move text-slate-600 hover:text-slate-300 p-2">
                                        <GripVertical size={20} />
                                    </div>

                                    {/* Slide Toolbar */}
                                    <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 rounded-lg p-1 border border-white/10 z-10">
                                        <div className="flex flex-col space-y-1 border-r border-white/10 pr-2 mr-2">
                                            <button 
                                                onClick={() => moveSlide(index, 'up')} 
                                                disabled={index === 0}
                                                className="text-slate-400 hover:text-white disabled:opacity-30"
                                            >
                                                <ArrowUp size={14} />
                                            </button>
                                            <button 
                                                onClick={() => moveSlide(index, 'down')} 
                                                disabled={index === selectedExercise.script.length - 1}
                                                className="text-slate-400 hover:text-white disabled:opacity-30"
                                            >
                                                <ArrowDown size={14} />
                                            </button>
                                        </div>
                                        <button onClick={() => removeSlide(slide.id)} className="text-slate-400 hover:text-red-400 p-1">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        <div className="md:col-span-8 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="flex items-center text-xs font-bold text-neuro-primary uppercase">
                                                    <MessageTextIcon size={12} className="mr-1.5"/> Avatar Script (TTS)
                                                </label>
                                                <button 
                                                    onClick={() => refineScriptWithAI(slide)}
                                                    disabled={refiningSlideId === slide.id}
                                                    className="flex items-center text-[10px] text-neuro-primary hover:text-blue-300 disabled:opacity-50"
                                                >
                                                    {refiningSlideId === slide.id ? (
                                                        <RefreshCw size={12} className="mr-1 animate-spin"/>
                                                    ) : (
                                                        <Sparkles size={12} className="mr-1"/>
                                                    )}
                                                    {refiningSlideId === slide.id ? "Refining..." : "Refine with AI"}
                                                </button>
                                            </div>
                                            <textarea 
                                                value={slide.text}
                                                onChange={(e) => updateSlide(slide.id, 'text', e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:border-neuro-primary focus:ring-0 resize-none h-24"
                                                placeholder="What should Cerebro say?"
                                            />
                                        </div>
                                        
                                        <div className="md:col-span-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="flex items-center text-xs font-bold text-emerald-500 uppercase">
                                                    <ImageIcon size={12} className="mr-1.5"/> Visual Prompt
                                                </label>
                                                <button 
                                                    onClick={() => handleRefineVisualPrompt(slide)}
                                                    disabled={refiningPromptId === slide.id || (!slide.visualPrompt && !slide.text)}
                                                    title={slide.visualPrompt ? "Optimize Visual Prompt" : "Generate Visual Prompt from Script"}
                                                    className={`disabled:opacity-30 ${!slide.visualPrompt ? 'text-neuro-primary hover:text-white' : 'text-emerald-500 hover:text-emerald-300'}`}
                                                >
                                                    {refiningPromptId === slide.id ? <Loader2 size={12} className="animate-spin"/> : (slide.visualPrompt ? <Sparkles size={12}/> : <Wand2 size={12}/>)}
                                                </button>
                                            </div>
                                            <div className="flex space-x-2 h-24">
                                                <textarea 
                                                    value={slide.visualPrompt || ''}
                                                    onChange={(e) => updateSlide(slide.id, 'visualPrompt', e.target.value)}
                                                    className="flex-grow bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 focus:border-emerald-500 focus:ring-0 resize-none font-mono h-full"
                                                    placeholder="Describe the image..."
                                                />
                                                <div className="w-24 h-full bg-slate-900 rounded-lg border border-slate-700 flex-shrink-0 relative overflow-hidden group">
                                                    {previewImages[slide.id] ? (
                                                        <img src={previewImages[slide.id]} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-500 text-center p-1">
                                                            <ImageIcon size={16} className="mb-1 opacity-50" />
                                                            No Preview
                                                        </div>
                                                    )}
                                                    
                                                    {/* Preview Button Overlay */}
                                                    <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${loadingPreviews[slide.id] ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                        <button 
                                                            onClick={() => generatePreview(slide.id, slide.visualPrompt || '')}
                                                            disabled={loadingPreviews[slide.id] || !slide.visualPrompt}
                                                            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-50"
                                                            title="Generate Preview"
                                                        >
                                                            {loadingPreviews[slide.id] ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 flex items-center">
                                        <input 
                                            type="checkbox" 
                                            id={`interactive-${slide.id}`}
                                            checked={slide.isInteractive}
                                            onChange={(e) => updateSlide(slide.id, 'isInteractive', e.target.checked)}
                                            className="rounded border-slate-600 bg-slate-900 text-neuro-primary focus:ring-neuro-primary mr-2"
                                        />
                                        <label htmlFor={`interactive-${slide.id}`} className="text-xs text-slate-400 select-none cursor-pointer">
                                            Requires User Interaction (Pause Auto-advance)
                                        </label>
                                    </div>
                                </div>
                            ))}

                            <div 
                                onClick={addSlide}
                                className="border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 hover:border-slate-500 hover:bg-slate-800/30 cursor-pointer transition-all"
                            >
                                <Plus size={24} className="mb-2" />
                                <span className="text-sm font-medium">Append New Slide</span>
                            </div>
                        </div>
                    )}
                </div>
            </>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Edit3 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">Select a Protocol</h3>
                <p className="max-w-xs text-center">Choose an exercise from the list to edit its script, or create a new one.</p>
            </div>
        )}
      </div>
    </div>
  );
};

// Helper Icon
const MessageTextIcon = ({ size, className }: {size:number, className?:string}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

export default AdminPanel;