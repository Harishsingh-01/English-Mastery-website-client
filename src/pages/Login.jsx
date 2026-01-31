import { useState, useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { login, signup, loginWithToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState('');

    const { name, email, password } = formData;

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
            loginWithToken(token);
            navigate('/');
        }
    }, [location, loginWithToken, navigate]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(name, email, password);
            }
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Helmet>
                <title>{isLogin ? 'Login' : 'Sign Up'} | English Mastery</title>
            </Helmet>
            <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-2xl relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-electric-purple to-neon-cyan"></div>
                <div>
                    <h2 className="mt-2 text-center text-3xl font-display font-bold text-text-main tracking-tight">
                        {isLogin ? 'Welcome Back' : 'Join EnglishMastery'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-text-muted">
                        {isLogin ? 'Sign in to continue your journey' : 'Start your language evolution today'}
                    </p>
                </div>

                {/* Google Login Button */}
                <div className="mt-8">
                    <a
                        href="/api/auth/google"
                        className="w-full flex items-center justify-center px-4 py-3 border border-glass-white/10 rounded-lg shadow-sm text-sm font-medium text-text-main bg-glass-black/10 hover:bg-glass-black/20 transition-all text-center group"
                    >
                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Sign in with Google
                    </a>

                    <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-glass-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-bg-primary text-text-muted">Or continue with</span>
                        </div>
                    </div>
                </div>

                <form className="mt-6 space-y-6" onSubmit={onSubmit}>
                    <div className="space-y-4">
                        {!isLogin && (
                            <div>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-glass-black/10 border border-glass-white/10 placeholder-text-muted text-text-main focus:outline-none focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan focus:z-10 sm:text-sm transition-colors"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={onChange}
                                />
                            </div>
                        )}
                        <div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-glass-black/10 border border-glass-white/10 placeholder-text-muted text-text-main focus:outline-none focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan focus:z-10 sm:text-sm transition-colors"
                                placeholder="Email address"
                                value={email}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-glass-black/10 border border-glass-white/10 placeholder-text-muted text-text-main focus:outline-none focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan focus:z-10 sm:text-sm transition-colors"
                                placeholder="Password"
                                value={password}
                                onChange={onChange}
                            />
                        </div>
                    </div>

                    {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-black bg-neon-cyan hover:bg-neon-cyan/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-cyan transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_25px_rgba(0,243,255,0.5)] transform hover:-translate-y-0.5"
                        >
                            {isLogin ? 'Sign in' : 'Create Account'}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm font-medium text-electric-purple hover:text-electric-purple/80 transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
