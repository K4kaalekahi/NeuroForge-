import React from 'react';
import { Brain, User, Settings, ShieldCheck, Trophy, Target } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Brain size={20} /> },
    { path: '/competitions', label: 'Compete', icon: <Target size={20} /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
    { path: '/admin', label: 'Admin', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-neuro-bg text-neuro-text font-sans selection:bg-neuro-primary selection:text-white overflow-x-hidden relative isolate">
      {/* Background Texture - Strictly Non-Interactive & Lowest Z-Index */}
      <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none select-none" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }}
      />
      
      {/* Decorative Gradient Orbs - Strictly Non-Interactive */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neuro-primary rounded-full blur-[120px] opacity-10 animate-float z-[-1] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neuro-accent rounded-full blur-[120px] opacity-10 animate-float z-[-1] pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-50 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-[100] bg-neuro-bg/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-3 group relative z-[101]">
                <div className="p-2 bg-gradient-to-br from-neuro-primary to-neuro-accent rounded-xl shadow-lg shadow-neuro-primary/20 group-hover:shadow-neuro-primary/40 transition-shadow">
                    <Brain className="text-white" size={24} />
                </div>
                <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  NeuroForge
                </span>
              </Link>
              
              <nav className="hidden md:flex space-x-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative z-[101] ${
                      location.pathname === item.path
                        ? 'bg-white/10 text-white shadow-inner border border-white/5'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex items-center space-x-1 text-emerald-400 text-xs font-semibold px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      <ShieldCheck size={12} />
                      <span>SECURE</span>
                  </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation (Bottom) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-neuro-bg/95 backdrop-blur-xl border-t border-white/10 pb-safe shadow-2xl">
            <div className="flex justify-around items-center h-20 pb-4">
                 {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative z-[101] ${
                      location.pathname === item.path
                        ? 'text-neuro-primary'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <div className={`p-1.5 rounded-full ${location.pathname === item.path ? 'bg-neuro-primary/20' : ''}`}>
                        {item.icon}
                    </div>
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </Link>
                ))}
            </div>
        </div>

        {/* Main Content */}
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 mb-24 md:mb-0 relative z-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;