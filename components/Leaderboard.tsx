
import React from 'react';
import { Trophy, Medal, Crown, Zap, TrendingUp, Shield } from 'lucide-react';
import { leaderboardData } from '../data/gamification';

interface LeaderboardProps {
  currentUserName?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentUserName }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      
      {/* Competitive Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/10 border border-yellow-500/30 rounded-2xl p-6 flex items-center space-x-4">
              <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-400">
                  <Trophy size={28} />
              </div>
              <div>
                  <div className="text-xs text-yellow-500/80 font-bold uppercase tracking-wider">Current Leader</div>
                  <div className="text-xl font-bold text-white">{leaderboardData[0].name}</div>
                  <div className="text-xs text-slate-400">15,400 pts</div>
              </div>
          </div>
          <div className="bg-neuro-surface border border-white/5 rounded-2xl p-6 flex items-center space-x-4">
              <div className="p-3 bg-neuro-primary/20 rounded-full text-neuro-primary">
                  <TrendingUp size={28} />
              </div>
              <div>
                  <div className="text-xs text-neuro-primary/80 font-bold uppercase tracking-wider">Your Rank</div>
                  <div className="text-xl font-bold text-white">#4</div>
                  <div className="text-xs text-emerald-400 flex items-center"><span className="mr-1">▲</span> Top 15%</div>
              </div>
          </div>
          <div className="bg-neuro-surface border border-white/5 rounded-2xl p-6 flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-full text-purple-400">
                  <Shield size={28} />
              </div>
              <div>
                  <div className="text-xs text-purple-500/80 font-bold uppercase tracking-wider">League</div>
                  <div className="text-xl font-bold text-white">Diamond</div>
                  <div className="text-xs text-slate-400">Ends in 2d 14h</div>
              </div>
          </div>
      </div>

      <div className="bg-neuro-surface/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-4 p-6 bg-black/20 border-b border-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <div className="col-span-2 md:col-span-1 text-center">Rank</div>
            <div className="col-span-6 md:col-span-5">User</div>
            <div className="col-span-4 md:col-span-2 text-right md:text-left">Specialty</div>
            <div className="hidden md:block col-span-2 text-center">Badges</div>
            <div className="hidden md:block col-span-2 text-right">Points</div>
        </div>

        {/* Rows */}
        <div className="relative divide-y divide-white/5">
            {leaderboardData.map((user, index) => {
                const rank = index + 1;
                const isCurrentUser = user.name === currentUserName;
                
                let RankDisplay = <span className="text-slate-500 font-mono text-lg">#{rank}</span>;
                let rowBg = "hover:bg-white/5 transition-colors";
                let glowEffect = "";

                if (rank === 1) {
                    RankDisplay = <Crown className="text-yellow-400 fill-yellow-400/20 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" size={28} />;
                    rowBg = "bg-gradient-to-r from-yellow-500/10 to-transparent";
                } else if (rank === 2) {
                    RankDisplay = <Medal className="text-slate-300 drop-shadow-[0_0_5px_rgba(203,213,225,0.5)]" size={24} />;
                } else if (rank === 3) {
                    RankDisplay = <Medal className="text-amber-700" size={24} />;
                }

                if (isCurrentUser) {
                    rowBg = "bg-neuro-primary/10 border-l-4 border-l-neuro-primary";
                    glowEffect = "shadow-[0_0_30px_rgba(59,130,246,0.15)] z-10 relative scale-[1.01] my-1 rounded-lg border-y border-neuro-primary/20";
                }

                return (
                    <div 
                        key={user.id} 
                        style={{ animationDelay: `${index * 75}ms` }}
                        className={`grid grid-cols-12 gap-4 p-5 items-center animate-fade-in-up opacity-0 ${rowBg} ${glowEffect}`}
                    >
                        <div className="col-span-2 md:col-span-1 flex justify-center font-bold">
                            {RankDisplay}
                        </div>
                        
                        <div className="col-span-6 md:col-span-5 flex items-center space-x-4">
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-white/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity ${rank === 1 ? 'opacity-50 bg-yellow-500/30' : ''}`}></div>
                                <img 
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed}`} 
                                    alt={user.name}
                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 relative z-10 bg-slate-800 ${isCurrentUser ? 'border-neuro-primary' : 'border-slate-700'}`}
                                />
                                {rank <= 3 && (
                                    <div className="absolute -top-1 -right-1 z-20">
                                        <div className="relative flex h-3 w-3">
                                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${rank===1?'bg-yellow-400':'bg-slate-400'}`}></span>
                                          <span className={`relative inline-flex rounded-full h-3 w-3 ${rank===1?'bg-yellow-500':'bg-slate-500'}`}></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className={`font-bold text-sm md:text-base flex items-center ${isCurrentUser ? 'text-neuro-primary' : 'text-slate-200'}`}>
                                    {user.name} 
                                    {isCurrentUser && <span className="ml-2 text-[10px] font-extrabold bg-neuro-primary text-white px-1.5 py-0.5 rounded uppercase tracking-wide">You</span>}
                                </h3>
                                <div className="md:hidden text-xs text-neuro-primary font-mono">{user.points} pts</div>
                            </div>
                        </div>

                        <div className="col-span-4 md:col-span-2 text-right md:text-left flex items-center justify-end md:justify-start">
                             <span className={`text-[10px] md:text-xs font-semibold px-2 py-1 rounded border ${isCurrentUser ? 'bg-neuro-primary/20 border-neuro-primary/30 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                {user.specialty}
                             </span>
                        </div>

                        <div className="hidden md:flex col-span-2 items-center justify-center space-x-1 text-slate-400">
                             <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                             <span className="font-mono text-sm">{user.badges}</span>
                        </div>

                        <div className={`hidden md:block col-span-2 text-right font-mono font-bold text-lg ${isCurrentUser ? 'text-neuro-primary' : 'text-slate-300'}`}>
                            {user.points.toLocaleString()}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
