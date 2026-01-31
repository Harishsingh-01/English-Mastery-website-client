import { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Send, AlertTriangle, CheckCircle, Info, HelpCircle, X } from 'lucide-react';
import VoiceInput from '../components/VoiceInput';

const Dashboard = () => {
    const [usage, setUsage] = useState(null);
    const [sentence, setSentence] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [examples, setExamples] = useState(null);
    const [examplesLoading, setExamplesLoading] = useState(false);
    const [dailyWord, setDailyWord] = useState(null);
    const [strictMode, setStrictMode] = useState(false);

    const fetchUsage = async () => {
        try {
            const res = await axios.get('/api/auth/usage');
            setUsage(res.data);
        } catch (err) {
            console.error('Failed to fetch usage', err);
        }
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!sentence.trim()) return;

        setLoading(true);
        setResult(null);
        try {
            const res = await axios.post('/api/analyze', { sentence, strictMode });
            setResult(res.data);
            fetchStats();
        } catch (err) {
            console.error(err);
            alert('Error analyzing sentence');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/analyze/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchUsage();
        const saved = localStorage.getItem('dashboard_sentence');
        if (saved) setSentence(saved);

        const fetchDailyWord = async () => {
            const today = new Date().toISOString().split('T')[0];
            const cached = localStorage.getItem('daily_word_data');
            const cachedDate = localStorage.getItem('daily_word_date');

            if (cached && cachedDate === today) {
                setDailyWord(JSON.parse(cached));
            } else {
                try {
                    const res = await axios.get('/api/daily/word');
                    setDailyWord(res.data);
                    localStorage.setItem('daily_word_data', JSON.stringify(res.data));
                    localStorage.setItem('daily_word_date', today);
                } catch (err) {
                    console.error("Failed to fetch daily word", err);
                }
            }
        };
        fetchDailyWord();
    }, []);

    useEffect(() => {
        localStorage.setItem('dashboard_sentence', sentence);
    }, [sentence]);

    const handleGetExamples = async (mistakeData, idx) => {
        setExamplesLoading(idx);
        try {
            const res = await axios.post('/api/analyze/examples', {
                rule: mistakeData.rule,
                mistake: mistakeData.mistake
            });
            setExamples({ id: idx, data: res.data });
        } catch (err) {
            alert('Failed to fetch examples');
        } finally {
            setExamplesLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <Helmet>
                <title>Dashboard | English Mastery</title>
            </Helmet>
            {/* ... (Header) */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Input Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                        {/* ... (Background effects) */}
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-neon-cyan uppercase tracking-wide">
                                Write a sentence to check
                            </label>
                            <div className="flex items-center space-x-2">
                                <span className={`text-xs font-bold transition-colors ${strictMode ? 'text-electric-purple' : 'text-text-muted'}`}>Strict Mode</span>
                                <button
                                    type="button"
                                    onClick={() => setStrictMode(!strictMode)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-electric-purple focus:ring-offset-2 focus:ring-offset-black ${strictMode ? 'bg-electric-purple' : 'bg-slate-700'}`}
                                >
                                    <span
                                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${strictMode ? 'translate-x-5' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleAnalyze}>
                            <div className="relative">
                                <textarea
                                    value={sentence}
                                    onChange={(e) => setSentence(e.target.value)}
                                    rows={4}
                                    className="w-full bg-glass-black/5 border border-glass-white/10 rounded-xl p-4 text-text-main placeholder-text-muted focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all resize-none shadow-inner"
                                    placeholder="e.g. I listen music everyday..."
                                />
                                <div className="absolute bottom-3 right-3">
                                    <VoiceInput onTranscript={(text) => setSentence(prev => prev + ' ' + text)} />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading || !sentence.trim()}
                                    className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-lg shadow-lg text-black bg-neon-cyan hover:bg-neon-cyan/90 hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                                >
                                    {loading ? 'Analyzing...' : <><Send className="w-4 h-4 mr-2" /> Check Sentence</>}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Results Section */}
                    {result && (
                        <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-neon-cyan animate-slide-up">
                            <h2 className="text-xl font-display font-bold text-text-main mb-6 flex items-center">
                                {result.mistakes.length === 0 ? (
                                    <span className="text-green-400 flex items-center"><CheckCircle className="w-6 h-6 mr-2" /> Perfect!</span>
                                ) : (
                                    <span className="text-yellow-400 flex items-center"><AlertTriangle className="w-6 h-6 mr-2" /> Analysis Result</span>
                                )}
                            </h2>

                            <div className="space-y-6">
                                <div className="p-5 bg-glass-black/5 rounded-xl border border-glass-white/10">
                                    <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Corrected Version</div>
                                    <p className="text-xl font-medium text-text-main">{result.corrected}</p>
                                </div>

                                {result.polished_alternatives && result.polished_alternatives.length > 0 && (
                                    <div className="p-5 bg-gradient-to-r from-neon-cyan/5 to-electric-purple/5 rounded-xl border border-glass-white/10">
                                        <div className="text-xs text-text-muted uppercase tracking-wider mb-3 flex items-center">
                                            <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full mr-2"></span>
                                            Professional Alternatives
                                        </div>
                                        <ul className="space-y-3">
                                            {result.polished_alternatives.map((alt, i) => (
                                                <li key={i} className="text-text-main font-medium flex items-start">
                                                    <span className="text-text-muted mr-2 text-sm">{i + 1}.</span>
                                                    {alt}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {result.mistakes.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-text-main flex items-center">
                                            <Info className="w-4 h-4 mr-2" /> Detailed Breakdown
                                        </h3>
                                        {result.mistakes.map((m, idx) => (
                                            <div key={idx} className="bg-glass-black/5 rounded-xl p-5 border border-glass-white/10 hover:border-glass-white/20 transition-colors">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="line-through text-red-400 decoration-2 decoration-red-500/50">{m.wrong}</span>
                                                        <span className="text-text-muted">→</span>
                                                        <span className="text-green-500 font-bold">{m.correct}</span>
                                                    </div>
                                                    <span className="text-xs font-bold px-3 py-1 bg-electric-purple/20 text-electric-purple rounded-full border border-electric-purple/20 w-fit">{m.category}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-text-main"><span className="text-neon-cyan/80">Rule:</span> {m.rule}</p>
                                                    <p className="text-sm text-text-muted pl-4 border-l-2 border-slate-700 italic">{m.explanation}</p>

                                                    {/* Examples */}
                                                    {examples?.id === idx ? (
                                                        <div className="bg-glass-black/5 rounded-lg p-3 mt-3 relative animate-fade-in">
                                                            <button onClick={() => setExamples(null)} className="absolute top-2 right-2 text-text-muted hover:text-text-main"><X className="w-3 h-3" /></button>
                                                            <p className="text-xs font-bold text-text-main uppercase mb-2">Examples:</p>
                                                            <ul className="list-disc pl-4 space-y-1">
                                                                {examples.data.map((ex, i) => (
                                                                    <li key={i} className="text-xs text-text-muted">{ex}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleGetExamples({ rule: m.rule, mistake: m.wrong }, idx)}
                                                            disabled={examplesLoading === idx}
                                                            className="text-xs text-neon-cyan hover:text-neon-cyan/80 font-medium flex items-center mt-2 transition-colors"
                                                        >
                                                            {examplesLoading === idx ? 'Generating...' : <><HelpCircle className="w-3 h-3 mr-1" /> See Similar Examples</>}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    {/* Usage Meter */}
                    {usage && (
                        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                            <h3 className="text-lg font-display font-bold text-text-main mb-2">Daily Quota</h3>
                            <div className="flex justify-between text-sm text-text-muted mb-2">
                                <span>Requests Used</span>
                                <span>{usage.count} / 100</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2.5">
                                <div
                                    className={`h-2.5 rounded-full transition-all duration-500 ${usage.count > 45 ? 'bg-red-500' : 'bg-neon-cyan'}`}
                                    style={{ width: `${Math.min((usage.count / 100) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-text-muted mt-2 text-right">Resets daily</p>
                        </div>
                    )}

                    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-electric-purple/10 rounded-full blur-2xl pointer-events-none"></div>
                        <h3 className="text-lg font-display font-bold text-text-main mb-6">Your Progress</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-glass-black/5 rounded-xl p-4 text-center">
                                <span className="block text-3xl font-bold text-neon-cyan">{stats?.totalSentences || 0}</span>
                                <span className="text-xs text-text-muted uppercase tracking-widest">Checks</span>
                            </div>
                            <div className="bg-glass-black/5 rounded-xl p-4 text-center">
                                <span className="block text-3xl font-bold text-electric-purple">{stats?.totalMistakes || 0}</span>
                                <span className="text-xs text-text-muted uppercase tracking-widest">Mistakes</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl p-6">
                        <h3 className="text-lg font-display font-bold text-text-main mb-4">Top Mistakes</h3>
                        {stats?.topMistakes?.length > 0 ? (
                            <ul className="space-y-3">
                                {stats.topMistakes.map((m, i) => (
                                    <li key={i} className="flex justify-between items-center text-sm group cursor-default">
                                        <span className="text-text-main truncate mr-2 group-hover:text-neon-cyan transition-colors" title={m.wrongPhrase}>{m.wrongPhrase}</span>
                                        <span className="bg-glass-black/10 text-text-main px-2 py-0.5 rounded text-xs border border-glass-white/10">{m.count}x</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-text-muted italic">No mistakes recorded yet.</p>
                        )}
                    </div>

                    {/* Word of the Day Widget */}
                    {dailyWord && (
                        <div className="glass-panel rounded-2xl p-6 bg-gradient-to-br from-neon-cyan/5 to-transparent border border-neon-cyan/20 animate-fade-in">
                            <h3 className="text-sm font-bold text-neon-cyan mb-2 uppercase tracking-wider">Word of the Day</h3>
                            <div className="text-2xl font-bold text-text-main mb-1">{dailyWord.word}</div>
                            <div className="text-xs text-text-muted italic mb-2">{dailyWord.pronunciation}</div>
                            <p className="text-sm text-text-main mb-3">{dailyWord.definition}</p>
                            <div className="text-sm text-electric-purple font-medium mb-3 bg-electric-purple/10 px-2 py-1 rounded w-fit border border-electric-purple/20">
                                {dailyWord.hindiMeaning}
                            </div>
                            <div className="space-y-1">
                                {dailyWord.examples.map((ex, i) => (
                                    <p key={i} className="text-xs text-text-muted border-l-2 border-slate-700 pl-2 italic">"{ex}"</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
