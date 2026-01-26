import React, { useState, useEffect, useRef } from 'react';
import { Exercise } from '../types';
import Button from './Button';
import { generateSpeech, generateText, generateImage, explainVisualContent } from '../services/geminiService';
import { X, RotateCcw, Send, Sparkles, Eye, Mic, MessageSquare, ChevronRight, ChevronLeft, Lock } from 'lucide-react';

interface ExerciseSessionProps {
  exercise: Exercise;
  initialSlideIndex?: number;
  onComplete: () => void;
  onExit: (lastIndex: number) => void;
}

type InteractionMode = 'idle' | 'holding' | 'navigating' | 'dragging';

const ExerciseSession: React.FC<ExerciseSessionProps> = ({ exercise, initialSlideIndex = 0, onComplete, onExit }) => {
  // --- State ---
  const [hasStarted, setHasStarted] = useState(false); 
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canAdvance, setCanAdvance] = useState(false);
  
  // Avatar & Interaction State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [avatarPosition, setAvatarPosition] = useState({ x: window.innerWidth / 2 - 48, y: window.innerHeight - 200 }); // Centered initially
  
  // Gesture State (UI)
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('idle');
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const [swipeOffset, setSwipeOffset] = useState(0); // For visualizing the pull
  
  // Refs for Gesture Logic (Logic)
  const modeRef = useRef<InteractionMode>('idle');
  const startPointerRef = useRef({ x: 0, y: 0 });
  const currentPointerRef = useRef({ x: 0, y: 0 }); // Track current position for re-centering
  const avatarRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Media State
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  
  // Track active TTS request to prevent race conditions
  const activeRequestRef = useRef<string | null>(null);

  const currentSlide = exercise.script[currentSlideIndex];
  const progress = ((currentSlideIndex + 1) / exercise.script.length) * 100;
  const currentSlideImage = generatedImages[currentSlide.id];

  // --- Audio Context Initialization ---
  const initializeAudio = async () => {
    // Robustly ensure context exists and is not closed
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    }
    if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
    }
    setHasStarted(true);
  };

  // --- Slide Logic ---
  useEffect(() => {
    if (!hasStarted) return;

    let isMounted = true;
    setCanAdvance(false);
    setIsLoadingImage(false); 
    
    // Play TTS
    playTTS(currentSlide.text);
    
    // Image Generation
    if (!generatedImages[currentSlide.id] && currentSlide.visualPrompt) {
        const imgTimer = setTimeout(() => {
            if(isMounted) {
                setIsLoadingImage(true);
                generateImage(currentSlide.visualPrompt!).then((img) => {
                    if (isMounted) {
                        if (img) setGeneratedImages(prev => ({ ...prev, [currentSlide.id]: img }));
                        setIsLoadingImage(false);
                    }
                });
            }
        }, 500);
        return () => clearTimeout(imgTimer);
    }

    // Enable advance shortly after slide load
    const advanceTimer = setTimeout(() => {
      if (isMounted) setCanAdvance(true);
    }, 500); 

    return () => {
        isMounted = false;
        clearTimeout(advanceTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlideIndex, hasStarted]);

  // --- TTS Logic ---
  const playTTS = async (text: string) => {
    // Generate a unique ID for this request
    const requestId = Date.now().toString();
    activeRequestRef.current = requestId;

    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) { /* ignore */ }
    }
    
    setIsLoadingAudio(true);
    setIsPlaying(true); 

    // Pass the existing audio context to prevent creating new ones rapidly
    const buffer = await generateSpeech(text, 'Fenrir', audioContextRef.current || undefined);
    
    // Check if a newer request has started since we began
    if (activeRequestRef.current !== requestId) {
        return; 
    }

    setIsLoadingAudio(false);

    if (buffer && audioContextRef.current && audioContextRef.current.state !== 'closed') {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
          // Only update state if this is still the active source
          if (activeRequestRef.current === requestId) {
            setIsPlaying(false);
          }
      };
      
      sourceNodeRef.current = source;
      source.start();
    } else {
        setIsPlaying(false);
    }
  };

  // --- Robust Gesture Logic ---

  const setMode = (mode: InteractionMode) => {
      modeRef.current = mode;
      setInteractionMode(mode);
  };

  const startHoldTimer = () => {
      const startTime = Date.now();
      setHoldProgress(0);
      setMode('holding');

      const updateProgress = () => {
          // If logic has switched away from holding (e.g. dragging started), stop.
          if (modeRef.current !== 'holding') return;

          const elapsed = Date.now() - startTime;
          // 1 second hold
          const p = Math.min((elapsed / 1000) * 100, 100);
          setHoldProgress(p);

          if (p < 100) {
              animationFrameRef.current = requestAnimationFrame(updateProgress);
          } else {
              // Timer Complete: Enter Navigation Mode
              // CRITICAL FIX: Re-center the start pointer to current position
              // This ensures the swipe delta starts from 0 exactly when navigation unlocks
              startPointerRef.current = currentPointerRef.current;
              
              setMode('navigating');
              if (navigator.vibrate) navigator.vibrate([30, 50, 30]); // Distinct haptic pulse
          }
      };
      animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const cancelHoldTimer = () => {
      if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
      }
      setHoldProgress(0);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
      if (!avatarRef.current) return;
      e.preventDefault();
      
      startPointerRef.current = { x: e.clientX, y: e.clientY };
      currentPointerRef.current = { x: e.clientX, y: e.clientY };
      startHoldTimer();
      
      avatarRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      e.preventDefault();
      currentPointerRef.current = { x: e.clientX, y: e.clientY };
      
      const currentMode = modeRef.current;
      const deltaX = e.clientX - startPointerRef.current.x;
      const deltaY = e.clientY - startPointerRef.current.y;
      
      // If idle, do nothing
      if (currentMode === 'idle') return;

      if (currentMode === 'holding') {
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          // Increased tolerance to 20px to prevent accidental drag triggers
          if (distance > 20) {
              cancelHoldTimer();
              setMode('dragging');
          }
      }

      if (modeRef.current === 'dragging') {
          // Move the avatar
          const size = 96; 
          const newX = e.clientX - size / 2;
          const newY = e.clientY - size / 2;
          
          // Boundary checks
          const clampedX = Math.max(0, Math.min(window.innerWidth - size, newX));
          const clampedY = Math.max(0, Math.min(window.innerHeight - size, newY));
          
          setAvatarPosition({ x: clampedX, y: clampedY });
      }

      if (modeRef.current === 'navigating') {
          // In Navigation Mode, X-movement determines swipe
          // Update UI state for offset visualization
          setSwipeOffset(deltaX);
      }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      e.preventDefault();
      cancelHoldTimer();

      const currentMode = modeRef.current;
      
      // Calculate final delta directly from refs to ensure accuracy
      const finalDeltaX = e.clientX - startPointerRef.current.x;

      if (currentMode === 'navigating') {
          const threshold = 30; // Reduced threshold for better responsiveness
          
          // Removed `canAdvance` check here because the 1s hold is sufficient gating
          if (finalDeltaX > threshold) {
             handleNext();
          } else if (finalDeltaX < -threshold && currentSlideIndex > 0) {
             handleBack();
          }
      }

      // Reset everything
      setMode('idle');
      setSwipeOffset(0);
      
      if (avatarRef.current) {
          avatarRef.current.releasePointerCapture(e.pointerId);
      }
  };

  const handleAvatarDoubleTap = () => {
      // Double tap only works if we aren't in the middle of a nav gesture
      if (modeRef.current !== 'navigating') {
        setIsChatOpen(!isChatOpen);
      }
  };

  // --- Navigation Actions ---
  const handleNext = () => {
    if (currentSlideIndex < exercise.script.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      if (navigator.vibrate) navigator.vibrate(50);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
      if (currentSlideIndex > 0) {
          setCurrentSlideIndex(prev => prev - 1);
          if (navigator.vibrate) navigator.vibrate(50);
      }
  };

  const handleAskGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    // Stop current speech before answering
    if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch (e) { /* ignore */ }
    }

    setIsLoadingAudio(true);
    const systemPrompt = `You are Cerebro. The user is in an exercise titled "${exercise.title}". The current instruction is: "${currentSlide.text}". Answer their question with high energy and brevity.`;
    
    const response = await generateText(userQuery, systemPrompt);
    setUserQuery('');
    playTTS(response);
  };

  // --- Render ---

  if (!hasStarted) {
      return (
          <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-neuro-primary to-neuro-accent animate-pulse mb-8 shadow-[0_0_50px_rgba(59,130,246,0.5)] flex items-center justify-center">
                  <Sparkles className="text-white w-12 h-12" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Initialize Neural Link</h1>
              <p className="text-slate-400 mb-8 max-w-md">
                  Establish a connection with Cerebro for real-time auditory guidance.
              </p>
              {initialSlideIndex > 0 && (
                   <p className="text-neuro-primary mb-4 text-sm font-bold uppercase tracking-widest">
                       Resuming from Slide {initialSlideIndex + 1}
                   </p>
              )}
              <Button 
                onClick={initializeAudio} 
                size="lg" 
                className="bg-white text-slate-900 hover:bg-slate-200 font-bold text-xl px-12 py-6 rounded-full shadow-2xl shadow-white/20 scale-100 hover:scale-105 transition-transform"
                icon={<Mic className="mr-2" />}
              >
                  {initialSlideIndex > 0 ? "Resume Uplink" : "Connect & Begin"}
              </Button>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col font-sans text-slate-100 overflow-hidden select-none touch-none">
       {/* Background Layer */}
       <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 ease-in-out blur-2xl scale-110 opacity-20 pointer-events-none"
        style={{ 
            backgroundImage: currentSlideImage ? `url(${currentSlideImage})` : 'none',
            backgroundColor: '#0f172a'
        }}
       ></div>
       
       {/* Header */}
       <div className="relative z-[100] px-6 py-4 flex justify-between items-center bg-gradient-to-b from-slate-900/90 to-transparent">
         <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${isPlaying ? 'bg-neuro-accent animate-pulse' : 'bg-slate-500'}`}></div>
            <span className="font-semibold tracking-wide text-sm uppercase text-slate-300">{exercise.title}</span>
         </div>
         <button onClick={() => onExit(currentSlideIndex)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors backdrop-blur-md">
            <X size={20} />
         </button>
       </div>

       {/* Main Content Area */}
       <div className="relative z-10 flex-grow flex flex-col items-center justify-center p-4 w-full h-full max-w-4xl mx-auto pb-safe pointer-events-none">
            
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-12 shadow-2xl w-full flex flex-col max-h-[85vh] transition-all duration-500 relative overflow-hidden pointer-events-auto">
                
                {/* Scrollable Content Wrapper */}
                <div className="flex-grow overflow-y-auto custom-scrollbar flex flex-col pb-8">
                    {/* Text Content */}
                    <div className="mb-4 md:mb-8 relative z-20">
                        <h2 className="text-xl md:text-3xl font-light leading-relaxed text-center text-white drop-shadow-md animate-fade-in-up">
                            "{currentSlide.text}"
                        </h2>
                    </div>

                    {/* Visual Content */}
                    <div className="flex-grow relative rounded-2xl overflow-hidden bg-slate-800/50 border border-white/5 flex items-center justify-center group min-h-[200px] md:min-h-[300px] shadow-inner mb-4">
                        {currentSlideImage ? (
                            <img 
                                src={currentSlideImage} 
                                alt="Visualization" 
                                className="w-full h-full object-cover animate-fade-in"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-600">
                                {isLoadingImage ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 border-4 border-neuro-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <span className="text-xs tracking-widest animate-pulse">VISUALIZING...</span>
                                    </div>
                                ) : (
                                    <Sparkles size={48} className="opacity-20" />
                                )}
                            </div>
                        )}
                        
                        {/* Visual Overlay Controls */}
                        {currentSlideImage && (
                            <div className="absolute bottom-4 right-4 z-30">
                                <button 
                                    onClick={() => { playTTS(`Analyzing visual data...`); explainVisualContent(currentSlideImage, currentSlide.text).then(txt => playTTS(txt)); }}
                                    className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-all hover:scale-110 pointer-events-auto"
                                    title="Explain this image"
                                >
                                    <Eye size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center space-x-1.5 pt-4 border-t border-white/5">
                    {exercise.script.map((_, idx) => (
                        <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlideIndex ? 'w-8 bg-neuro-primary shadow-[0_0_10px_#3b82f6]' : 'w-2 bg-slate-700'}`}
                        ></div>
                    ))}
                </div>
            </div>
       </div>

       {/* --- Floating Avatar (Cerebro) with Gesture Logic --- */}
       <div
          ref={avatarRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleAvatarDoubleTap}
          style={{ 
              transform: `translate(${avatarPosition.x + (interactionMode === 'navigating' ? swipeOffset * 0.5 : 0)}px, ${avatarPosition.y}px)`,
          }}
          className={`absolute z-[200] cursor-grab active:cursor-grabbing touch-none transition-transform duration-75 ease-out`}
       >
          {/* Gesture Guidance Arrows (Only visible in Nav Mode) */}
          {interactionMode === 'navigating' && (
              <>
                 <div className={`absolute right-full mr-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 transition-opacity duration-300 ${swipeOffset < -25 ? 'opacity-100' : 'opacity-30'}`}>
                     <span className="text-xs font-bold uppercase text-slate-300">Back</span>
                     <div className="p-2 bg-slate-800 rounded-full border border-white/10"><ChevronLeft className="text-white" /></div>
                 </div>
                 <div className={`absolute left-full ml-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 transition-opacity duration-300 ${swipeOffset > 25 ? 'opacity-100' : 'opacity-30'}`}>
                     <div className={`p-2 rounded-full border border-white/10 ${'bg-neuro-primary'}`}>
                         <ChevronRight className="text-white" />
                     </div>
                     <span className="text-xs font-bold uppercase text-slate-300">{currentSlideIndex === exercise.script.length - 1 ? 'Finish' : 'Next'}</span>
                 </div>
              </>
          )}

          {/* Hold Progress Ring */}
          <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] pointer-events-none rotate-[-90deg]">
              <circle
                cx="50%" cy="50%" r="48"
                fill="none"
                stroke={holdProgress === 100 ? '#10b981' : '#3b82f6'}
                strokeWidth="4"
                strokeDasharray="301.6" // 2 * pi * 48
                strokeDashoffset={301.6 - (301.6 * holdProgress) / 100}
                className="transition-all duration-75"
                strokeLinecap="round"
                opacity={holdProgress > 0 ? 1 : 0}
              />
          </svg>

          {/* Avatar Container */}
          <div className={`relative w-24 h-24 rounded-full transition-all duration-300
                ${interactionMode === 'navigating' ? 'shadow-[0_0_80px_rgba(16,185,129,0.6)] scale-110 border-2 border-emerald-400' : 'shadow-[0_0_30px_rgba(59,130,246,0.4)]'}
          `}>
              
              {/* Cerebro Visuals */}
              <div className="absolute inset-0 rounded-full overflow-hidden bg-slate-900/80 backdrop-blur-sm border border-white/10 pointer-events-none">
                  <div className={`absolute inset-0 bg-gradient-to-tr ${interactionMode === 'navigating' ? 'from-emerald-500 to-teal-400' : 'from-neuro-primary to-blue-300'} opacity-60 blur-xl rounded-full animate-pulse-slow`}></div>
                  <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-gradient-to-t from-transparent via-blue-500/30 to-transparent rounded-full animate-spin [animation-duration:8s] blur-md"></div>
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-md transition-all duration-200 ${isPlaying ? 'opacity-90 scale-150' : 'opacity-40 scale-100'}`}></div>
              </div>

              {/* Status Ring */}
              <div className={`absolute -inset-1 rounded-full border border-blue-400/30 ${isPlaying ? 'animate-ping opacity-20' : 'opacity-0'} pointer-events-none`}></div>
          </div>

          {/* Chat Popover */}
          {isChatOpen && (
               <div 
                className="absolute bottom-28 left-1/2 -translate-x-1/2 w-72 bg-slate-800/95 backdrop-blur-xl border border-neuro-primary/40 rounded-2xl shadow-2xl p-4 animate-fade-in-up origin-bottom z-[2000] cursor-auto"
                onPointerDown={(e) => e.stopPropagation()} 
               >
                    <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-neuro-primary uppercase flex items-center">
                            <MessageSquare size={12} className="mr-1"/> Neural Link
                        </span>
                        <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white">
                            <X size={14} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={() => { setIsChatOpen(false); playTTS(currentSlide.text); }}
                            className="w-full flex items-center justify-center space-x-2 bg-slate-700/50 hover:bg-slate-700 py-2 rounded-lg text-xs font-medium text-slate-200 transition-colors"
                        >
                            <RotateCcw size={12} /> <span>Replay Instruction</span>
                        </button>
                        
                        <form onSubmit={handleAskGuide} className="relative mt-2">
                            <input
                                type="text"
                                value={userQuery}
                                onChange={(e) => setUserQuery(e.target.value)}
                                placeholder="Ask Cerebro..."
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2.5 pl-3 pr-9 text-sm text-white focus:outline-none focus:border-neuro-primary placeholder-slate-500"
                                autoFocus
                            />
                            <button 
                                type="submit" 
                                disabled={!userQuery.trim() || isLoadingAudio}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-neuro-primary rounded-lg text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
                            >
                                <Send size={12} />
                            </button>
                        </form>
                    </div>
               </div>
          )}
       </div>

       {/* Gesture Hint Footer */}
       <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none opacity-60 animate-pulse">
            <p className="text-[10px] uppercase tracking-widest text-slate-400">
                Hold Cerebro (1s) + Slide Right to Proceed
            </p>
       </div>

       {/* Progress Line */}
       <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800 z-40">
            <div 
                className="h-full bg-gradient-to-r from-neuro-primary via-purple-500 to-neuro-accent transition-all duration-700 ease-out shadow-[0_0_15px_currentColor]"
                style={{ width: `${progress}%` }}
            ></div>
       </div>
    </div>
  );
};

export default ExerciseSession;