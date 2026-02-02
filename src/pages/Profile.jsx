import { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { User, Mail, Calendar, BarChart, Settings, LogOut, CheckCircle, Brain, BookOpen, Edit2, Key, Save, X, Lock, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const [stats, setStats] = useState({ flashcards: 0, mistakes: 0, usage: 0 });
    const [loading, setLoading] = useState(true);

    // Edit Name State
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');

    // Change Password State
    const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passMsg, setPassMsg] = useState('');
    const [passError, setPassError] = useState('');

    // Password Visibility State
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passLoading, setPassLoading] = useState(false);

    useEffect(() => {
        if (user) setNewName(user.name);
        const fetchStats = async () => {
            try {
                const cardRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/flashcards`);
                const mistRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/mistakes`);
                const usageRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/usage`);

                setStats({
                    flashcards: cardRes.data.length,
                    mistakes: mistRes.data.length,
                    usage: usageRes.data.count
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    const handleUpdateName = async () => {
        if (!newName.trim()) return;
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/update`, { name: newName });
            window.location.reload(); // Simple reload to refresh context for now
        } catch (err) {
            alert('Failed to update name');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPassMsg('');
        setPassError('');
        setPassLoading(true); // START LOADING

        if (passForm.newPassword !== passForm.confirmPassword) {
            setPassError('New passwords do not match');
            setPassLoading(false); // STOP LOADING
            return;
        }

        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/password`, {
                oldPassword: passForm.oldPassword,
                newPassword: passForm.newPassword
            });
            setPassMsg(res.data.msg);
            setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPassError(err.response?.data?.msg || 'Failed to update password');
        } finally {
            setPassLoading(false); // STOP LOADING
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in text-text-main">
            <Helmet><title>Profile | English Mastery</title></Helmet>

            {/* Header / Identity */}
            <div className="glass-panel p-8 rounded-3xl mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 border border-glass-white/10 shadow-2xl">
                <div className="w-24 h-24 bg-gradient-to-br from-neon-cyan to-electric-purple rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg relative">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 text-center md:text-left">
                    {isEditing ? (
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="bg-glass-black/20 border border-neon-cyan rounded px-2 py-1 text-xl font-bold text-text-main w-full max-w-[200px]"
                            />
                            <button onClick={handleUpdateName} className="p-2 text-green-400 hover:bg-green-500/10 rounded-full"><Save className="w-5 h-5" /></button>
                            <button onClick={() => setIsEditing(false)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                    ) : (
                        <h1 className="text-3xl font-display font-bold mb-2 flex items-center justify-center md:justify-start gap-3 group">
                            {user?.name}
                            <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-neon-cyan">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </h1>
                    )}

                    <div className="flex flex-col md:flex-row gap-4 text-text-muted text-sm items-center md:items-start">
                        <span className="flex items-center"><Mail className="w-4 h-4 mr-2" /> {user?.email}</span>
                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Joined {new Date().getFullYear()}</span>
                    </div>
                </div>
                <button onClick={logout} className="px-5 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                </button>
            </div>

            {/* Stats Grid - Same as before */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-panel p-6 rounded-2xl border border-glass-white/5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Brain className="w-16 h-16 text-neon-cyan" />
                    </div>
                    <div className="text-3xl font-bold text-neon-cyan mb-1">{stats.flashcards}</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider font-bold">Vocabulary Saved</div>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-glass-white/5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle className="w-16 h-16 text-green-400" />
                    </div>
                    <div className="text-3xl font-bold text-green-400 mb-1">{stats.usage}</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider font-bold">Checks Used</div>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-glass-white/5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BookOpen className="w-16 h-16 text-yellow-400" />
                    </div>
                    <div className="text-3xl font-bold text-electric-purple mb-1">{stats.mistakes}</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider font-bold">Mistakes Logged</div>
                </div>
            </div>

            {/* Account Management Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Change Password Section */}
                <div className="glass-panel p-8 rounded-3xl border border-glass-white/10">
                    <h3 className="text-xl font-bold mb-6 flex items-center text-text-main">
                        <Key className="w-5 h-5 mr-2" /> Change Password
                    </h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        {passMsg && <div className="p-3 bg-green-500/10 text-green-400 rounded-lg text-sm">{passMsg}</div>}
                        {passError && <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm">{passError}</div>}

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showOldPassword ? "text" : "password"}
                                    className="w-full bg-glass-black/20 border border-glass-white/10 rounded-xl px-4 py-2 pr-10 text-text-main focus:border-neon-cyan outline-none"
                                    value={passForm.oldPassword}
                                    onChange={e => setPassForm({ ...passForm, oldPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-main"
                                >
                                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">New Password</label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    className="w-full bg-glass-black/20 border border-glass-white/10 rounded-xl px-4 py-2 pr-10 text-text-main focus:border-neon-cyan outline-none"
                                    value={passForm.newPassword}
                                    onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-main"
                                >
                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="w-full bg-glass-black/20 border border-glass-white/10 rounded-xl px-4 py-2 pr-10 text-text-main focus:border-neon-cyan outline-none"
                                    value={passForm.confirmPassword}
                                    onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-main"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={passLoading}
                            className="w-full py-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 rounded-lg font-medium hover:bg-neon-cyan/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {passLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>

                {/* Preferences Section (Visual) */}
                <div className="glass-panel p-8 rounded-3xl border border-glass-white/10 h-fit">
                    <h3 className="text-xl font-bold mb-6 flex items-center text-text-main">
                        <Settings className="w-5 h-5 mr-2" /> Preferences
                    </h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center opacity-75">
                            <div>
                                <div className="font-medium text-text-main">Email Notifications</div>
                                <div className="text-text-muted text-sm">Receive weekly progress reports</div>
                            </div>
                            <div className="w-11 h-6 bg-neon-cyan rounded-full relative cursor-pointer"><div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div></div>
                        </div>
                        <div className="flex justify-between items-center opacity-75">
                            <div>
                                <div className="font-medium text-text-main">Strict Mode Default</div>
                                <div className="text-text-muted text-sm">Always start checks in strict mode</div>
                            </div>
                            <div className="w-11 h-6 bg-glass-white/10 rounded-full relative cursor-pointer"><div className="w-5 h-5 bg-slate-400 rounded-full absolute top-0.5 left-0.5 shadow-sm"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
