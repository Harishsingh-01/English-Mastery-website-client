import { Link, useLocation } from 'react-router-dom';
import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { LogOut, BookOpen, BarChart2, Languages, MessageSquare, Coffee, Clock, Sun, Moon, Bot, Menu, X, Layers, ChevronDown, Mic } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(false); // Mobile Menu

    // Dropdown States
    const [progressOpen, setProgressOpen] = useState(false);

    // Click outside to close dropdowns
    const progressRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (progressRef.current && !progressRef.current.contains(event.target)) {
                setProgressOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!user) return null;

    const isActive = (path) => location.pathname === path;
    const baseLinkClass = "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300";
    const activeClass = "text-neon-cyan bg-glass-black/5 shadow-[0_0_15px_rgba(0,243,255,0.3)]";
    const inactiveClass = "text-text-muted hover:text-text-main hover:bg-glass-black/5";

    const linkClass = (path) => `${baseLinkClass} ${isActive(path) ? activeClass : inactiveClass}`;

    return (
        <nav className="fixed top-0 w-full z-50 glass-panel border-b border-glass-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo & Desktop Nav */}
                    <div className="flex items-center flex-1">
                        <Link to="/" className="flex-shrink-0 flex items-center group mr-6 lg:mr-8">
                            <span className="text-xl lg:text-2xl font-display font-bold text-gradient tracking-tight group-hover:opacity-80 transition-opacity">
                                EnglishMastery
                            </span>
                        </Link>

                        {/* Desktop Links - Hybrid Approach */}
                        <div className="hidden md:flex md:space-x-1 lg:space-x-2">
                            {/* Core Features (Always Visible) */}
                            <Link to="/" className={linkClass('/')}>
                                <BookOpen className="w-4 h-4 mr-2" /> <span className="hidden lg:inline">Practice</span>
                            </Link>
                            <Link to="/translator" className={linkClass('/translator')}>
                                <Languages className="w-4 h-4 mr-2" /> <span className="hidden lg:inline">Translator</span>
                            </Link>
                            <Link to="/interview" className={linkClass('/interview')}>
                                <MessageSquare className="w-4 h-4 mr-2" /> <span className="hidden lg:inline">Interview</span>
                            </Link>
                            <Link to="/roleplay" className={linkClass('/roleplay')}>
                                <Coffee className="w-4 h-4 mr-2" /> <span className="hidden lg:inline">Roleplay</span>
                            </Link>
                            <Link to="/debate" className={linkClass('/debate')}>
                                <Mic className="w-4 h-4 mr-2" /> <span className="hidden lg:inline">Debate</span>
                            </Link>
                            <Link to="/tutor" className={linkClass('/tutor')}>
                                <Bot className="w-4 h-4 mr-2" /> <span className="hidden lg:inline">AI Tutor</span>
                            </Link>

                            {/* Divider */}
                            <div className="w-px h-6 bg-glass-white/10 my-auto mx-2"></div>

                            {/* Progress Dropdown (Stats & History) */}
                            <div className="relative" ref={progressRef}>
                                <button
                                    onClick={() => setProgressOpen(!progressOpen)}
                                    className={`${baseLinkClass} ${progressOpen ? 'text-text-main bg-glass-black/5' : 'text-text-muted hover:text-text-main'}`}
                                >
                                    <BarChart2 className="w-4 h-4 lg:mr-2" />
                                    <span className="hidden lg:inline">My Stats</span>
                                    <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${progressOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {progressOpen && (
                                    <div className="absolute top-full left-0 w-48 mt-1 glass-panel border border-glass-white/10 shadow-xl rounded-xl overflow-hidden animate-slide-up bg-deep-void">
                                        <Link to="/flashcards" className="block px-4 py-3 text-sm text-text-muted hover:text-text-main hover:bg-glass-white/5" onClick={() => setProgressOpen(false)}>
                                            <div className="flex items-center"><Layers className="w-4 h-4 mr-2" /> Vocabulary Deck</div>
                                        </Link>
                                        <Link to="/mistakes" className="block px-4 py-3 text-sm text-text-muted hover:text-text-main hover:bg-glass-white/5" onClick={() => setProgressOpen(false)}>
                                            <div className="flex items-center"><BarChart2 className="w-4 h-4 mr-2" /> Mistakes</div>
                                        </Link>
                                        <Link to="/history" className="block px-4 py-3 text-sm text-text-muted hover:text-text-main hover:bg-glass-white/5" onClick={() => setProgressOpen(false)}>
                                            <div className="flex items-center"><Clock className="w-4 h-4 mr-2" /> History</div>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side Options */}
                    <div className="flex items-center space-x-2 lg:space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-text-muted hover:text-text-main hover:bg-glass-black/5 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <Link to="/profile" className="hidden sm:inline-flex items-center space-x-2 text-sm font-medium text-text-muted hover:text-text-main transition-colors group">
                            <span className="group-hover:text-neon-cyan transition-colors max-w-[100px] truncate hidden xl:inline">{user.name}</span>
                            <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan/20 to-electric-purple/20 rounded-full flex items-center justify-center border border-neon-cyan/30 text-neon-cyan/80">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </Link>

                        <button onClick={logout} className="hidden sm:block p-2 rounded-full text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors">
                            <LogOut className="w-5 h-5" />
                        </button>

                        {/* Mobile menu button */}
                        <div className="flex md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-text-muted hover:text-text-main hover:bg-glass-black/5 focus:outline-none"
                            >
                                {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden glass-panel border-t border-glass-white/10 animate-slide-up h-[calc(100vh-4rem)] overflow-y-auto">
                    <div className="px-4 pt-4 pb-8 space-y-1">
                        <Link to="/" onClick={() => setIsOpen(false)} className={linkClass('/')}>
                            <BookOpen className="w-4 h-4 mr-2" /> Practice
                        </Link>
                        <Link to="/translator" onClick={() => setIsOpen(false)} className={linkClass('/translator')}>
                            <Languages className="w-4 h-4 mr-2" /> Translator
                        </Link>
                        <Link to="/interview" onClick={() => setIsOpen(false)} className={linkClass('/interview')}>
                            <MessageSquare className="w-4 h-4 mr-2" /> Interview
                        </Link>
                        <Link to="/roleplay" onClick={() => setIsOpen(false)} className={linkClass('/roleplay')}>
                            <Coffee className="w-4 h-4 mr-2" /> Roleplay
                        </Link>
                        <Link to="/debate" onClick={() => setIsOpen(false)} className={linkClass('/debate')}>
                            <Mic className="w-4 h-4 mr-2" /> Debate
                        </Link>
                        <Link to="/tutor" onClick={() => setIsOpen(false)} className={linkClass('/tutor')}>
                            <Bot className="w-4 h-4 mr-2" /> AI Tutor
                        </Link>

                        <div className="border-t border-glass-white/10 my-4"></div>
                        <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 px-3">Stats</div>

                        <Link to="/flashcards" onClick={() => setIsOpen(false)} className={linkClass('/flashcards')}>
                            <Layers className="w-4 h-4 mr-2" /> Vocabulary
                        </Link>
                        <Link to="/mistakes" onClick={() => setIsOpen(false)} className={linkClass('/mistakes')}>
                            <BarChart2 className="w-4 h-4 mr-2" /> Mistakes
                        </Link>
                        <Link to="/history" onClick={() => setIsOpen(false)} className={linkClass('/history')}>
                            <Clock className="w-4 h-4 mr-2" /> History
                        </Link>

                        <div className="border-t border-glass-white/10 my-4"></div>
                        <Link to="/profile" onClick={() => setIsOpen(false)} className={linkClass('/profile')}>
                            <div className="w-5 h-5 bg-neon-cyan/20 rounded-full flex items-center justify-center text-[10px] mr-2 text-neon-cyan">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            My Profile
                        </Link>
                        <button onClick={logout} className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all">
                            <LogOut className="w-4 h-4 mr-2" /> Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
