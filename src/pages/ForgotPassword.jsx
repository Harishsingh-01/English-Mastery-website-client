import { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [msg, setMsg] = useState('');
    const [token, setToken] = useState(''); // DEV ONLY

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
            setStatus('success');
            setMsg('Reset link sent!');
            if (res.data.token) setToken(res.data.token); // DEV ONLY
        } catch (err) {
            setStatus('error');
            setMsg(err.response?.data?.msg || 'Failed to send reset link');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center -mt-20">
            <Helmet><title>Forgot Password | English Mastery</title></Helmet>
            <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-glass-white/10 shadow-2xl">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-text-main">Reset Password</h1>
                    <p className="text-text-muted text-sm mt-2">Enter your email to receive a reset link</p>
                </div>

                {status === 'success' ? (
                    <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <p className="text-text-main mb-4">Check your email for the reset link.</p>

                        {/* Simulation Link */}
                        {token && (
                            <div className="mb-6 p-4 bg-glass-black/20 rounded-lg text-left">
                                <p className="text-xs text-neon-cyan font-bold uppercase mb-2">Dev Simulation:</p>
                                <p className="text-xs text-text-muted mb-2">Since we don't have an email server, click here:</p>
                                <Link to={`/reset-password/${token}`} className="text-sm text-neon-cyan underline break-all">
                                    Reset Link
                                </Link>
                            </div>
                        )}

                        <Link to="/login" className="text-neon-cyan hover:underline text-sm">Back to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {status === 'error' && <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm text-center">{msg}</div>}

                        <div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-text-muted w-5 h-5" />
                                <input
                                    type="email"
                                    required
                                    placeholder="your@email.com"
                                    className="w-full bg-glass-black/20 border border-glass-white/10 rounded-xl py-2.5 pl-10 pr-4 text-text-main focus:border-neon-cyan outline-none transition-all"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full py-3 bg-neon-cyan text-black font-bold rounded-xl hover:bg-neon-cyan/90 transition-all flex justify-center items-center"
                        >
                            {status === 'loading' ? 'Sending...' : <>Send Reset Link <ArrowRight className="w-4 h-4 ml-2" /></>}
                        </button>

                        <div className="text-center">
                            <Link to="/login" className="text-sm text-text-muted hover:text-white">Back to Login</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
