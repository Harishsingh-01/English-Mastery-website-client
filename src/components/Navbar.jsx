import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { LogOut, BookOpen, BarChart2, Languages, MessageSquare, Coffee, Clock, Sun, Moon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const location = useLocation();

    if (!user) return null;

    const isActive = (path) => location.pathname === path;
    const linkClass = (path) => `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${isActive(path)
        ? 'text-neon-cyan bg-glass-black/5 shadow-[0_0_15px_rgba(0,243,255,0.3)]'
        : 'text-text-muted hover:text-text-main hover:bg-glass-black/5'
        }`;

    return (
        <nav className="fixed top-0 w-full z-50 glass-panel border-b border-glass-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center group">
                            <span className="text-2xl font-display font-bold text-gradient tracking-tight group-hover:opacity-80 transition-opacity">
                                EnglishMastery
                            </span>
                        </Link>
                        <div className="hidden sm:ml-10 sm:flex sm:space-x-4">
                            <Link to="/" className={linkClass('/')}>
                                <BookOpen className="w-4 h-4 mr-2" />
                                Practice
                            </Link>
                            <Link to="/translator" className={linkClass('/translator')}>
                                <Languages className="w-4 h-4 mr-2" />
                                Translate
                            </Link>
                            <Link to="/interview" className={linkClass('/interview')}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Interview
                            </Link>
                            <Link to="/roleplay" className={linkClass('/roleplay')}>
                                <div className="flex items-center">
                                    <Coffee className="w-4 h-4 mr-2" />
                                    <span>Roleplay</span>
                                </div>
                            </Link>
                            <Link to="/mistakes" className={linkClass('/mistakes')}>
                                <BarChart2 className="w-4 h-4 mr-2" />
                                Mistakes
                            </Link>
                            <Link to="/history" className={linkClass('/history')}>
                                <Clock className="w-4 h-4 mr-2" />
                                History
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-text-muted hover:text-text-main hover:bg-glass-black/5 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <span className="text-sm font-medium text-text-muted">
                            Hi, <span className="text-text-main">{user.name}</span>
                        </span>
                        <button
                            onClick={logout}
                            className="p-2 rounded-full text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
