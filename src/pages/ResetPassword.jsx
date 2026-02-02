import { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Key, ArrowRight, CheckCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [status, setStatus] = useState('idle');
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, { token, newPassword });
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setStatus('error');
            setMsg(err.response?.data?.msg || 'Failed to reset password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center -mt-20">
            <Helmet><title>Reset Password | English Mastery</title></Helmet>
            <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-glass-white/10 shadow-2xl">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-text-main">Set New Password</h1>
                    <p className="text-text-muted text-sm mt-2">Enter your new secure password</p>
                </div>

                {status === 'success' ? (
                    <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <p className="text-text-main mb-4">Password reset successfully!</p>
                        <p className="text-text-muted text-sm">Redirecting to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {status === 'error' && <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm text-center">{msg}</div>}

                        <div>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 text-text-muted w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    placeholder="New Password"
                                    className="w-full bg-glass-black/20 border border-glass-white/10 rounded-xl py-2.5 pl-10 pr-4 text-text-main focus:border-neon-cyan outline-none transition-all"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full py-3 bg-neon-cyan text-black font-bold rounded-xl hover:bg-neon-cyan/90 transition-all flex justify-center items-center"
                        >
                            {status === 'loading' ? 'Resetting...' : <>Reset Password <ArrowRight className="w-4 h-4 ml-2" /></>}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
