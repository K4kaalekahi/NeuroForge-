import React from 'react';
import { Lock, Crown, Calendar, Users, ArrowRight, Trophy, Zap, Star } from 'lucide-react';
import { competitions } from '../data/gamification';
import Button from './Button';

interface CompetitionsProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

const Competitions: React.FC<CompetitionsProps> = ({ isPremium, onUpgrade }) => {
  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-12">
      
      {/* Hero Section */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/10 p-8 md:p-16 text-center shadow-2xl">
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full px-5 py-2 text-amber-400 text-sm font-bold tracking-wide mb-8 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Crown size={16} /> <span>ELITE ACCESS ZONE</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                Prove Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500">Cognitive Mastery</span>
            </h1>
            
            <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl font-light leading-relaxed">
                Join global "Craft-a-thon" challenges, collaborative innovation labs, and abstract thought contests. 
                Win publication, prestige, and exclusive badges.
            </p>
            
            {!isPremium && (
                <Button onClick={onUpgrade} className="relative group bg-white text-slate-900 hover:bg-slate-200 border-0 shadow-xl shadow-white/10 px-12 py-4 text-lg font-bold overflow-hidden rounded-full">
                    <span className="relative z-10 flex items-center">Unlock Premium <Zap size={18} className="ml-2 fill-slate-900"/></span>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </Button>
            )}
        </div>
        
        {/* Abstract Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-rose-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      </div>

      {/* Competitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {competitions.map((comp) => {
            const isLocked = comp.isPremium && !isPremium;

            // Button Logic
            let buttonText = "Join Challenge";
            let buttonIcon = <ArrowRight size={16}/>;
            
            if (comp.isPremium) {
                if (isPremium) {
                    buttonText = "Enter Arena";
                    buttonIcon = <Crown size={16} />;
                } else {
                    buttonText = "Unlock Access";
                    buttonIcon = <Lock size={16} />;
                }
            }

            return (
                <div key={comp.id} className={`group relative rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col ${isLocked ? 'border-white/5 bg-slate-900/40 grayscale-[0.5] hover:grayscale-0' : 'border-white/10 bg-slate-800/30 hover:bg-slate-800/50 hover:border-white/20 hover:shadow-2xl hover:shadow-neuro-primary/10 hover:-translate-y-1'}`}>
                    
                    {/* Header Gradient */}
                    <div className={`h-2 bg-gradient-to-r ${comp.imageGradient}`}></div>

                    <div className="p-8 flex-grow flex flex-col relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border ${
                                comp.isPremium ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' : 'border-neuro-primary/30 text-neuro-primary bg-neuro-primary/10'
                            }`}>
                                {comp.category}
                            </span>
                            {isLocked && <Lock size={20} className="text-slate-500" />}
                        </div>

                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                            {comp.title}
                        </h3>
                        
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            {comp.description}
                        </p>

                        <div className="mt-auto space-y-6">
                             {/* Prize Box */}
                             <div className="bg-slate-950/50 rounded-2xl p-4 border border-white/5 flex items-center space-x-4 backdrop-blur-sm">
                                <div className={`p-3 rounded-xl shrink-0 ${
                                    comp.isPremium 
                                        ? 'bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-orange-500/20' 
                                        : 'bg-slate-800 text-slate-300'
                                }`}>
                                    <Trophy size={20} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Grand Prize</div>
                                    <div className="text-white font-medium text-sm">{comp.prize}</div>
                                </div>
                             </div>

                             {/* Metadata */}
                             <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-2">
                                <div className="flex items-center space-x-4">
                                    <span className="flex items-center"><Calendar size={14} className="mr-1.5 text-slate-400"/> {comp.deadline}</span>
                                    <span className="flex items-center"><Users size={14} className="mr-1.5 text-slate-400"/> {comp.participants}</span>
                                </div>
                                {comp.isPremium && <span className="text-amber-500 flex items-center"><Star size={12} className="mr-1 fill-amber-500"/> Premium</span>}
                             </div>

                             <Button 
                                variant={isLocked ? "secondary" : "primary"} 
                                className={`w-full py-4 text-base font-bold rounded-xl transition-all duration-300 ${isLocked ? 'opacity-80' : 'bg-gradient-to-r from-neuro-primary to-blue-600 hover:shadow-lg hover:shadow-blue-500/25 border-0'}`}
                                onClick={isLocked ? onUpgrade : () => alert(`Registered for ${comp.title}!`)}
                                icon={buttonIcon}
                            >
                                {buttonText}
                            </Button>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default Competitions;