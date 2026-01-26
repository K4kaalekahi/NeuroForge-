import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Assessment from './components/Assessment';
import ExerciseSession from './components/ExerciseSession';
import Leaderboard from './components/Leaderboard';
import Competitions from './components/Competitions';
import AdminPanel from './components/AdminPanel';
import Button from './components/Button';
import { exercises as staticExercises } from './data/exercises';
import { badges as badgeData } from './data/gamification';
import { UserProfile, Exercise, Badge, DifficultyTier } from './types';
import { Play, Star, Clock, Trophy, Zap, Crown, Flame, Lock, BrainCircuit, Award, RotateCw, ArrowRight } from 'lucide-react';

// --- Protected Route Wrapper ---
const ProtectedRoute: React.FC<{ children: React.ReactNode; profile: UserProfile | null }> = ({ children, profile }) => {
  const location = useLocation();
  if (!profile) {
    // Redirect to home (Assessment) if no profile exists
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

// --- Dashboard Component ---
const Dashboard: React.FC<{ 
    profile: UserProfile, 
    onSelectExercise: (id: string) => void, 
    onResumeExercise: () => void,
    exercises: Exercise[] 
}> = ({ profile, onSelectExercise, onResumeExercise, exercises }) => {
  const userBadges = badgeData.filter(b => profile.badges.includes(b.id));
  
  // Categorize exercises
  const masteryExercises = exercises.filter(ex => ex.tier === DifficultyTier.TIER_4);
  const coreExercises = exercises.filter(ex => ex.tier !== DifficultyTier.TIER_4);
  
  // Find incomplete exercise
  const inProgressExercise = profile.currentProgress 
    ? exercises.find(e => e.id === profile.currentProgress?.exerciseId) 
    : null;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-12">
      
      {/* Welcome Hero & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Welcome Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-neuro-surface to-slate-900 border border-white/5 p-8 shadow-2xl flex flex-col justify-between min-h-[240px]">
            <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                        Hello, <span className="text-neuro-primary">{profile.name}</span>.
                    </h1>
                    {profile.isPremium && <Crown className="text-amber-400 fill-amber-400/20" size={28} />}
                </div>
                <p className="text-slate-400 max-w-lg leading-relaxed">
                    Your {profile.learningStyle} learning path is optimized. 
                    Ready to forge new neural pathways today?
                </p>
            </div>
            
            <div className="relative z-10 mt-8 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 bg-neuro-primary/10 px-4 py-2.5 rounded-xl border border-neuro-primary/20">
                    <Zap size={18} className="text-neuro-primary" />
                    <span className="font-bold text-white">{profile.points.toLocaleString()}</span>
                    <span className="text-xs text-neuro-primary/70 uppercase font-semibold tracking-wider">Points</span>
                </div>
                <div className="flex items-center space-x-2 bg-orange-500/10 px-4 py-2.5 rounded-xl border border-orange-500/20">
                    <Flame size={18} className="text-orange-500" />
                    <span className="font-bold text-white">{profile.streak}</span>
                    <span className="text-xs text-orange-500/70 uppercase font-semibold tracking-wider">Day Streak</span>
                </div>
            </div>

            <div className="absolute right-0 top-0 w-64 h-64 bg-neuro-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        </div>

        {/* Badges / Status Card */}
        <div className="bg-neuro-surface rounded-3xl border border-white/5 p-6 shadow-xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-200 flex items-center">
                    <Trophy size={18} className="mr-2 text-yellow-500"/> Achievements
                </h3>
                <span className="text-xs text-slate-500 font-medium bg-slate-800 px-2 py-1 rounded-md">{userBadges.length} Earned</span>
            </div>
            
            <div className="flex-grow">
                {userBadges.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                         {userBadges.map(badge => (
                             <div key={badge.id} className="aspect-square rounded-xl bg-slate-800 flex items-center justify-center border border-white/5 group relative cursor-help">
                                 {/* Tooltip */}
                                 <div className="absolute bottom-full mb-2 hidden group-hover:block w-32 bg-slate-900 text-xs p-2 rounded-lg border border-white/10 z-50 text-center shadow-xl">
                                     <div className="font-bold text-slate-200 mb-1">{badge.name}</div>
                                     <div className="text-slate-400">{badge.description}</div>
                                 </div>
                                 <div className={`${badge.color}`}>
                                    <Star size={20} />
                                 </div>
                             </div>
                         ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm text-center border-2 border-dashed border-slate-700 rounded-xl p-4">
                        <p>Complete exercises to earn your first badge!</p>
                    </div>
                )}
            </div>
            
            {!profile.isPremium && (
                 <div className="mt-4 pt-4 border-t border-white/5">
                     <p className="text-xs text-amber-500 mb-2">Upgrade to compete in Craft-a-thon</p>
                 </div>
            )}
        </div>
      </div>

      {/* Continue Session CTA */}
      {inProgressExercise && profile.currentProgress && (
          <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900/40 border border-indigo-500/30 rounded-2xl p-6 flex items-center justify-between shadow-lg backdrop-blur-md relative overflow-hidden group">
              <div className="relative z-10 flex items-center space-x-4">
                  <div className="p-3 bg-indigo-500/20 rounded-full text-indigo-400">
                      <RotateCw className="animate-spin-slow" size={24} />
                  </div>
                  <div>
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Resume Session</div>
                      <h3 className="text-lg font-bold text-white">{inProgressExercise.title}</h3>
                      <div className="text-xs text-slate-400">
                          Slide {profile.currentProgress.slideIndex + 1} of {inProgressExercise.script.length}
                      </div>
                  </div>
              </div>
              <Button onClick={onResumeExercise} className="relative z-10 bg-indigo-600 hover:bg-indigo-500 border-0 shadow-lg shadow-indigo-500/20">
                  Continue <ArrowRight size={16} className="ml-2" />
              </Button>
              
              {/* Bg Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent skew-x-12 group-hover:skew-x-0 transition-transform duration-700"></div>
          </div>
      )}

      {/* Expert Mastery Section */}
      {masteryExercises.length > 0 && (
        <div className="relative">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                    <BrainCircuit size={20} className="mr-2 text-amber-400" /> 
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">Mastery Series (Tier 4)</span>
                </h2>
                {!profile.isPremium && (
                    <span className="text-xs text-slate-500 flex items-center bg-slate-800/50 px-3 py-1 rounded-full border border-white/5">
                        <Lock size={12} className="mr-1.5"/> Premium Access
                    </span>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {masteryExercises.map((ex) => (
                    <div key={ex.id} className="group relative bg-gradient-to-b from-slate-800 to-slate-900 border border-amber-500/20 hover:border-amber-500/50 rounded-2xl p-1 transition-all duration-300 shadow-lg hover:shadow-amber-500/10">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="relative h-full bg-neuro-surface rounded-xl p-6 flex flex-col overflow-hidden">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 blur-2xl rounded-full -mr-10 -mt-10"></div>

                            <div className="flex justify-between items-start mb-4">
                                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-amber-500/30 text-amber-400 bg-amber-500/10`}>
                                    EXPERT
                                </span>
                                <BrainIcon domain={ex.domain} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">{ex.title}</h3>
                            <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed">{ex.description}</p>
                            
                            {/* Publication Prize Display */}
                            {ex.publicationPrize && (
                                <div className="mb-6 bg-slate-900/50 border border-amber-500/10 rounded-lg p-3 flex items-start space-x-3">
                                    <Award size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-amber-500 tracking-wide mb-0.5">Top Prize</div>
                                        <div className="text-xs text-slate-300 leading-tight">{ex.publicationPrize}</div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto flex items-center justify-between">
                                <div className="flex items-center text-xs text-slate-500">
                                    <Clock size={14} className="mr-1" /> {ex.duration} min
                                </div>
                                <Button 
                                    size="sm" 
                                    variant={profile.isPremium ? "accent" : "secondary"} 
                                    onClick={() => profile.isPremium ? onSelectExercise(ex.id) : alert("Upgrade to access Mastery Series!")}
                                    className={profile.isPremium ? "bg-amber-600 hover:bg-amber-500 border-0" : "opacity-75"}
                                >
                                    {profile.isPremium ? "Begin" : <Lock size={14} />}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Core Exercises */}
      <div>
        <h2 className="text-xl font-semibold mb-6 text-slate-200 flex items-center">
            <Play size={20} className="mr-2 text-neuro-accent" /> Recommended for You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreExercises.map((ex) => (
            <div key={ex.id} className="group bg-neuro-surface hover:bg-slate-800 border border-white/5 hover:border-neuro-primary/50 rounded-2xl p-6 transition-all duration-300 shadow-lg hover:shadow-neuro-primary/10 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainIcon domain={ex.domain} />
              </div>
              
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-opacity-20 ${getDomainColor(ex.domain)}`}>
                    {ex.domain}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neuro-primary transition-colors">{ex.title}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{ex.description}</p>
              
              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center text-xs text-slate-500">
                    <Clock size={14} className="mr-1" /> {ex.duration} min
                </div>
                <Button size="sm" variant="secondary" onClick={() => onSelectExercise(ex.id)}>
                    Start
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper for domain colors
const getDomainColor = (domain: string) => {
    switch(domain) {
        case 'Linguistic': return 'bg-yellow-500 text-yellow-500';
        case 'Logical': return 'bg-blue-500 text-blue-500';
        case 'Spatial': return 'bg-teal-500 text-teal-500';
        case 'Existential': return 'bg-purple-500 text-purple-500';
        case 'Intrapersonal': return 'bg-emerald-500 text-emerald-500';
        default: return 'bg-slate-500 text-slate-400';
    }
}

const BrainIcon = ({ domain, className }: { domain: string, className?: string }) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
    );
}

// --- Main App Component ---
const AppContent: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [initialSlideIndex, setInitialSlideIndex] = useState<number>(0); // New state for resuming
  const [appExercises, setAppExercises] = useState<Exercise[]>(staticExercises);
  const navigate = useNavigate();

  // Load profile from local storage
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('neuro_profile');
      if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
      }
      
      const savedExercises = localStorage.getItem('neuro_exercises');
      if (savedExercises) {
          setAppExercises(JSON.parse(savedExercises));
      }
    } catch (e) {
      console.error("Failed to load local data", e);
    }
  }, []);

  const handleAssessmentComplete = (style: string) => {
    const newProfile: UserProfile = {
        name: 'Neuro Navigator',
        learningStyle: style as any,
        completedExercises: [],
        points: 0,
        streak: 1,
        isPremium: false,
        badges: [],
        currentProgress: null
    };
    setUserProfile(newProfile);
    localStorage.setItem('neuro_profile', JSON.stringify(newProfile));
  };

  const startExercise = (id: string) => {
    // Starting fresh
    setInitialSlideIndex(0);
    setActiveExerciseId(id);
  };

  const resumeExercise = () => {
    if (userProfile?.currentProgress) {
        setInitialSlideIndex(userProfile.currentProgress.slideIndex);
        setActiveExerciseId(userProfile.currentProgress.exerciseId);
    }
  }

  const completeExercise = () => {
    setActiveExerciseId(null);
    if (userProfile) {
        const earnedPoints = 150;
        let newBadges = [...userProfile.badges];

        // Gamification Logic: Award badges
        if (!newBadges.includes('b-001')) newBadges.push('b-001'); // First Exercise
        if (userProfile.streak >= 7 && !newBadges.includes('b-004')) newBadges.push('b-004'); // Streak

        // Update profile, ADDING points, badges, completed list, AND clearing currentProgress
        const updated: UserProfile = { 
            ...userProfile, 
            points: userProfile.points + earnedPoints,
            badges: newBadges,
            completedExercises: [...userProfile.completedExercises, activeExerciseId || ''],
            currentProgress: null // Clear progress on completion
        };
        setUserProfile(updated);
        localStorage.setItem('neuro_profile', JSON.stringify(updated));
    }
  };

  const handleExitExercise = (lastIndex: number) => {
      if (userProfile && activeExerciseId) {
          // Save progress
          const updated: UserProfile = {
              ...userProfile,
              currentProgress: {
                  exerciseId: activeExerciseId,
                  slideIndex: lastIndex,
                  timestamp: Date.now()
              }
          };
          setUserProfile(updated);
          localStorage.setItem('neuro_profile', JSON.stringify(updated));
      }
      setActiveExerciseId(null);
  };

  const handleUpgrade = () => {
      if(userProfile) {
          const updated = { ...userProfile, isPremium: true };
          setUserProfile(updated);
          localStorage.setItem('neuro_profile', JSON.stringify(updated));
          alert("Welcome to NeuroForge Premium!");
      }
  }

  // Active Session Override
  if (activeExerciseId) {
    const ex = appExercises.find(e => e.id === activeExerciseId);
    if (ex) {
        return (
            <ExerciseSession 
                exercise={ex} 
                initialSlideIndex={initialSlideIndex}
                onComplete={completeExercise} 
                onExit={handleExitExercise} 
            />
        );
    }
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={
            userProfile ? (
                <Dashboard 
                    profile={userProfile} 
                    onSelectExercise={startExercise} 
                    onResumeExercise={resumeExercise}
                    exercises={appExercises} 
                />
            ) : (
                <Assessment onComplete={handleAssessmentComplete} />
            )
        } />
        <Route path="/leaderboard" element={
            <ProtectedRoute profile={userProfile}>
                <Leaderboard currentUserName={userProfile?.name} />
            </ProtectedRoute>
        } />
        <Route path="/competitions" element={
            <ProtectedRoute profile={userProfile}>
                <Competitions 
                    isPremium={userProfile?.isPremium || false} 
                    onUpgrade={handleUpgrade} 
                />
            </ProtectedRoute>
        } />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/profile" element={
            <ProtectedRoute profile={userProfile}>
                <div className="text-center mt-20 space-y-4">
                    <div className="text-slate-400">Profile Settings</div>
                    <div className="p-6 bg-neuro-surface rounded-xl max-w-md mx-auto border border-white/5">
                        <h3 className="text-xl font-bold mb-4">{userProfile?.name}</h3>
                        <p className="text-slate-400 mb-6">Status: {userProfile?.isPremium ? 'Premium Member' : 'Free Plan'}</p>
                        {userProfile && !userProfile.isPremium && (
                            <Button onClick={handleUpgrade} variant="accent" className="w-full">
                                Unlock Premium Features
                            </Button>
                        )}
                        <Button 
                            onClick={() => {
                                if(window.confirm("Reset profile? You will need to take the assessment again.")) {
                                    localStorage.removeItem('neuro_profile');
                                    setUserProfile(null);
                                    window.location.href = '/';
                                }
                            }} 
                            variant="secondary" 
                            className="w-full mt-4 text-xs"
                        >
                            Reset Profile
                        </Button>
                    </div>
                </div>
            </ProtectedRoute>
        } />
      </Routes>
    </Layout>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}