import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from './Button';

interface AssessmentProps {
  onComplete: (style: string) => void;
}

type QuestionType = 'single' | 'sliding_selection';

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: { label: string; value: string; letter: string }[];
  sectionId: number;
}

interface Section {
    id: number;
    title: string;
    description: string;
    questions: Question[];
}

const SECTIONS: Section[] = [
  {
    id: 1,
    title: "Learning Profile",
    description: "Discover your cognitive intake style.",
    questions: [
      {
        id: "q1",
        sectionId: 1,
        type: "single",
        text: "How do you like to learn new things?",
        options: [
          { label: "Watching videos or looking at diagrams", value: "Visual", letter: "A" },
          { label: "Listening to explanations or discussions", value: "Auditory", letter: "B" },
          { label: "Doing hands-on activities or physically engaging", value: "Kinesthetic", letter: "C" }
        ]
      },
      {
        id: "q2",
        sectionId: 1,
        type: "single",
        text: "Which best describes you? I find it easiest to remember things when...",
        options: [
          { label: "Seeing it written down or visualized", value: "Visual", letter: "A" },
          { label: "Hearing it spoken or repeated aloud", value: "Auditory", letter: "B" },
          { label: "Writing it down or acting it out", value: "Kinesthetic", letter: "C" }
        ]
      },
      {
        id: "q3",
        sectionId: 1,
        type: "single",
        text: "When learning a new skill, what’s your go-to method?",
        options: [
          { label: "Reading or watching demos", value: "Visual", letter: "A" },
          { label: "Listening to instructions or stories", value: "Auditory", letter: "B" },
          { label: "Practicing by doing or moving", value: "Kinesthetic", letter: "C" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Cognitive Strengths & Weaknesses",
    description: "Self-evaluate your mental performance.",
    questions: [
      {
        id: "q4",
        sectionId: 2,
        type: "sliding_selection",
        text: "How confident are you in your short-term memory (like remembering phone numbers or lists)?",
      },
      {
        id: "q5",
        sectionId: 2,
        type: "sliding_selection",
        text: "How easily can you stay focused on one task without getting distracted?",
      }
    ]
  }
];

const Assessment: React.FC<AssessmentProps> = ({ onComplete }) => {
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  const currentSection = SECTIONS[currentSectionIdx];
  const currentQuestion = currentSection.questions[currentQuestionIdx];
  
  // Calculate Progress
  const totalQuestions = SECTIONS.reduce((acc, sec) => acc + sec.questions.length, 0);
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleAnswer = (value: any) => {
    // Save Answer
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    // Advance Logic
    if (currentQuestionIdx < currentSection.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else if (currentSectionIdx < SECTIONS.length - 1) {
      setCurrentSectionIdx(prev => prev + 1);
      setCurrentQuestionIdx(0);
    } else {
      finishAssessment(newAnswers);
    }
  };

  const finishAssessment = (finalAnswers: Record<string, any>) => {
    // Determine style based on Q1, Q2, Q3
    const styles: Record<string, number> = { Visual: 0, Auditory: 0, Kinesthetic: 0 };
    
    ['q1', 'q2', 'q3'].forEach(qid => {
      const val = finalAnswers[qid];
      if (styles[val] !== undefined) styles[val]++;
    });

    const dominantStyle = Object.keys(styles).reduce((a, b) => styles[a] > styles[b] ? a : b);
    onComplete(dominantStyle);
  };

  // --- Render Helpers ---

  const renderSingleChoice = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
      {currentQuestion.options?.map((opt, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => handleAnswer(opt.value)}
          className="h-full flex flex-col items-center justify-center p-6 rounded-2xl border border-white/10 bg-slate-800/40 hover:bg-slate-700/80 hover:border-neuro-primary hover:scale-105 transition-all duration-300 group shadow-lg text-center"
        >
          <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-sm font-bold text-slate-400 group-hover:bg-neuro-primary group-hover:text-white group-hover:border-neuro-primary transition-colors mb-4">
               {opt.letter}
          </div>
          <span className="text-slate-200 text-base font-medium leading-tight">{opt.label}</span>
        </button>
      ))}
    </div>
  );

  const renderSlidingSelection = () => {
      const currentValue = answers[currentQuestion.id];

      return (
        <div className="space-y-8 pt-6 w-full max-w-xl mx-auto">
            {/* Scale Legend */}
            <div className="flex justify-between items-end text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold border-b border-white/5 pb-2 mb-6">
                <span className="max-w-[100px] text-left">1 = No / Doesn't describe me</span>
                <span className="text-center">3 = Value / Neutral</span>
                <span className="max-w-[100px] text-right">5 = 100% I align</span>
            </div>

            {/* Slider / Range Input UI */}
            <div className="relative pt-6 pb-2">
                <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    step="1"
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neuro-primary"
                    onChange={(e) => handleAnswer(parseInt(e.target.value))}
                    value={currentValue || 3}
                />
                <div className="flex justify-between mt-4">
                    {[1, 2, 3, 4, 5].map((val) => (
                        <button 
                            key={val}
                            onClick={() => handleAnswer(val)}
                            className={`flex flex-col items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                                currentValue === val 
                                ? 'bg-neuro-primary text-white scale-125 shadow-lg shadow-neuro-primary/50 font-bold' 
                                : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                            }`}
                        >
                            {val}
                        </button>
                    ))}
                </div>
            </div>

            <div className="text-center mt-8">
                <Button onClick={() => handleAnswer(currentValue || 3)} className="px-12">
                    Confirm Selection
                </Button>
            </div>
        </div>
      )
  };

  return (
    <div className="max-w-4xl mx-auto w-full relative z-[200]">
      <div className="bg-neuro-surface/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-12 shadow-2xl relative overflow-hidden min-h-[550px] flex flex-col">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1.5 bg-slate-900 w-full z-10">
            <div 
                className="h-full bg-gradient-to-r from-neuro-primary to-neuro-accent transition-all duration-700 ease-out shadow-[0_0_10px_currentColor]" 
                style={{ width: `${progress}%` }}
            ></div>
        </div>

        {/* Section Header */}
        <div className="mb-6 mt-2 text-center">
            <h2 className="text-xs font-bold text-neuro-primary uppercase tracking-widest mb-2">
                {currentSection.title}
            </h2>
            <h1 className="text-3xl font-bold text-white mb-2">
                {currentSection.description}
            </h1>
        </div>

        {/* Question Area */}
        <div className="flex-grow flex flex-col justify-center animate-fade-in">
            <h3 className="text-xl md:text-2xl font-light text-slate-100 mb-8 leading-relaxed text-center">
                {currentQuestion.text}
            </h3>

            {currentQuestion.type === 'single' && renderSingleChoice()}
            {currentQuestion.type === 'sliding_selection' && renderSlidingSelection()}
        </div>
        
        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-xs text-slate-500 font-mono">
             <span>SEC {currentSectionIdx + 1}/{SECTIONS.length}</span>
             <span>Q {currentQuestionIdx + 1}/{currentSection.questions.length}</span>
        </div>
      </div>
    </div>
  );
};

export default Assessment;