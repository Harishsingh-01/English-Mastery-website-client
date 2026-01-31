import { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Clock, MessageSquare, Coffee, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const History = () => {
    const { user } = useContext(AuthContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/api/history');
            setHistory(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'practice': return <BookOpen className="w-5 h-5 text-neon-cyan" />;
            case 'interview': return <MessageSquare className="w-5 h-5 text-electric-purple" />;
            case 'roleplay': return <Coffee className="w-5 h-5 text-orange-400" />;
            default: return <Clock className="w-5 h-5 text-slate-400" />;
        }
    };

    const filteredHistory = filter === 'all' ? history : history.filter(h => h.type === filter);

    if (loading) return <div className="text-center mt-20 text-slate-400">Loading history...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Helmet>
                <title>History | English Mastery</title>
            </Helmet>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-text-main mb-2">Activity History</h1>
                    <p className="text-text-muted">Your entire learning timeline in one place.</p>
                </div>
                <div className="flex space-x-2 bg-glass-black/5 p-1 rounded-lg border border-glass-white/10">
                    {['all', 'practice', 'interview', 'roleplay'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f ? 'bg-glass-black/10 text-text-main' : 'text-text-muted hover:text-text-main'}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 text-slate-400">
                        No activity found. Start practicing!
                    </div>
                ) : (
                    filteredHistory.map((item) => (
                        <div key={item.id} className="glass-panel rounded-xl overflow-hidden border border-glass-white/5 transition-all hover:border-glass-white/10">
                            <div
                                onClick={() => toggleExpand(item.id)}
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-glass-black/5 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 rounded-lg bg-glass-black/10 border border-glass-white/10">
                                        {getIcon(item.type)}
                                    </div>
                                    <div>
                                        <h3 className="text-text-main font-medium">{item.title}</h3>
                                        <p className="text-text-muted text-sm">{new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-text-muted">
                                    <span className="mr-4 text-sm hidden sm:block italic truncate max-w-[200px] opacity-70">
                                        "{item.preview}"
                                    </span>
                                    {expandedId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedId === item.id && (
                                <div className="p-6 bg-glass-black/5 border-t border-glass-white/5 text-text-muted text-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">

                                    {/* Practice Mode Content */}
                                    {item.type === 'practice' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                                    <div className="text-xs text-red-400 mb-1 font-bold">ORIGINAL</div>
                                                    {item.details.original}
                                                </div>
                                                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                                    <div className="text-xs text-green-400 mb-1 font-bold">CORRECTED</div>
                                                    {item.details.corrected}
                                                </div>
                                            </div>
                                            {item.details.mistakes && item.details.mistakes.length > 0 && (
                                                <div className="mt-4">
                                                    <div className="text-xs text-text-muted uppercase font-bold mb-2">Mistakes Found</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.details.mistakes.map((m, i) => (
                                                            <span key={i} className="px-2 py-1 bg-glass-black/5 border border-glass-white/10 rounded text-xs text-text-muted">
                                                                {/* Mistake schema might be populated or just IDs, handle safely */}
                                                                Mistake #{i + 1}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Interview & Roleplay Content */}
                                    {(item.type === 'interview' || item.type === 'roleplay') && (
                                        <>
                                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {item.details.messages.map((msg, idx) => (
                                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[85%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-electric-purple/20 text-text-main' : 'bg-glass-black/10 text-text-muted'}`}>
                                                            <div className="text-[10px] opacity-50 mb-1 uppercase tracking-wider">{msg.role === 'user' ? 'You' : 'AI'}</div>
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Feedback Display */}
                                            {item.details.feedback && (
                                                <div className="mt-6 p-4 rounded-xl bg-neon-cyan/5 border border-neon-cyan/10">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-neon-cyan font-bold text-sm uppercase">AI Evaluation</span>
                                                        <span className="text-xl font-bold text-text-main">{item.details.feedback.score}<span className="text-text-muted text-sm">/10</span></span>
                                                    </div>
                                                    <p className="text-text-muted italic mb-4">"{item.details.feedback.feedback}"</p>

                                                    {item.details.feedback.improvement && (
                                                        <div className="mt-2 text-sm text-text-muted">
                                                            <span className="block text-text-main font-bold mb-1">Better Version:</span>
                                                            {item.details.feedback.improvement}
                                                        </div>
                                                    )}

                                                    {/* Roleplay Specific Improvements Array */}
                                                    {item.details.feedback.improvements && Array.isArray(item.details.feedback.improvements) && (
                                                        <div className="mt-4 space-y-2">
                                                            {item.details.feedback.improvements.map((imp, i) => (
                                                                <div key={i} className="text-xs bg-glass-black/10 p-2 rounded border border-glass-white/5">
                                                                    <div className="text-red-400 line-through opacity-70">{imp.original}</div>
                                                                    <div className="text-green-500">{imp.improved}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default History;
