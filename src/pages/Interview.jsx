import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { MessageSquare, Mic, Send, PlayCircle, Award, RefreshCw, Upload, Clock, FileText, ChevronRight, Plus, X, Volume2 } from 'lucide-react';
import VoiceInput from '../components/VoiceInput';

const Interview = () => {
    // Session State
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]);

    // UI State
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [length, setLength] = useState('short'); // 'short', 'medium', 'long'
    const [stats, setStats] = useState({ questions: 0, totalScore: 0 });
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);

    const messagesEndRef = useRef(null);

    // Initial Load
    useEffect(() => {
        fetchHistory();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/interview/history`);
            setSessions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadSession = async (id) => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/interview/session/${id}`);
            setCurrentSessionId(res.data._id);
            // Transform backend messages to UI format
            const uiMessages = res.data.messages.flatMap(m => {
                const msgs = [{
                    type: m.role,
                    text: m.content
                }];
                // If this message has an evaluation, push it as a separate 'evaluation' message
                if (m.evaluation) {
                    msgs.push({
                        type: 'evaluation',
                        evaluation: m.evaluation
                    });
                }
                return msgs;
            });
            setMessages(uiMessages);

            // Recalculate stats
            const evaluations = uiMessages.filter(m => m.evaluation);
            const totalScore = evaluations.reduce((acc, curr) => acc + (curr.evaluation.score || 0), 0);
            setStats({
                questions: evaluations.length,
                totalScore: totalScore
            });

            // Persist active session
            localStorage.setItem('activeInterviewSession', id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedSessionId = localStorage.getItem('activeInterviewSession');
        if (savedSessionId) {
            loadSession(savedSessionId);
        }
    }, []);

    const startNewSession = async () => {
        setLoading(true);
        const formData = new FormData();
        if (resumeFile) {
            formData.append('resume', resumeFile);
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/interview/start`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSessions(prev => [res.data, ...prev]);
            setCurrentSessionId(res.data._id);
            setMessages([{ type: 'ai', text: 'New session started! ' + (resumeFile ? 'I have read your resume. ' : '') + 'Select a topic to begin.' }]);
            setStats({ questions: 0, totalScore: 0 });
            setShowResumeModal(false);
            setResumeFile(null);
        } catch (err) {
            console.error(err);
            alert('Failed to start session');
        } finally {
            setLoading(false);
        }
    };

    const getNextQuestion = async (type = 'general') => {
        setLoading(true);
        try {
            // Optimistic update
            // setMessages(prev => [...prev]); 

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/interview/question`, {
                type,
                sessionId: currentSessionId,
                length
            });

            setMessages(prev => [...prev, { type: 'ai', text: res.data.question }]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const answer = input;
        setInput('');
        setMessages(prev => [...prev, { type: 'user', text: answer }]);
        setLoading(true);

        const lastQuestion = messages.filter(m => m.type === 'ai').pop()?.text;

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/interview/evaluate`, {
                question: lastQuestion || 'General Context',
                answer,
                sessionId: currentSessionId,
                length
            });

            setMessages(prev => {
                const newMessages = [...prev, {
                    type: 'evaluation',
                    evaluation: res.data
                }];

                if (res.data.nextQuestion) {
                    newMessages.push({
                        type: 'ai',
                        text: res.data.nextQuestion
                    });
                }

                return newMessages;
            });

            setStats(prev => ({
                questions: prev.questions + 1,
                totalScore: prev.totalScore + (res.data.score || 0)
            }));
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { type: 'system', text: 'Error evaluating answer.' }]);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 8) return 'text-green-400';
        if (score >= 5) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-6rem)] flex gap-6">
            <Helmet>
                <title>Interview Coach | English Mastery</title>
            </Helmet>

            {/* Sidebar History */}
            <div className={`fixed inset-y-0 left-0 z-40 transform ${showHistory ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out w-64 glass-panel rounded-r-2xl lg:rounded-2xl lg:p-4 h-full lg:flex flex-col bg-deep-void lg:bg-transparent shadow-2xl lg:shadow-none`}>
                <div className="p-4 h-full flex flex-col">
                    <div className="flex justify-between items-center lg:hidden mb-4">
                        <h3 className="font-bold text-text-main">History</h3>
                        <button onClick={() => setShowHistory(false)}><X className="w-5 h-5 text-text-muted" /></button>
                    </div>
                    <button
                        onClick={() => setShowResumeModal(true)}
                        className="w-full mb-2 py-3 bg-neon-cyan text-black font-bold rounded-xl hover:bg-neon-cyan/90 transition-all flex items-center justify-center"
                    >
                        <Plus className="w-4 h-4 mr-2" /> New Interview
                    </button>
                    <button
                        onClick={() => {
                            setCurrentSessionId(null);
                            setMessages([]);
                            setStats({ questions: 0, totalScore: 0 });
                            localStorage.removeItem('activeInterviewSession');
                            setShowHistory(false);
                        }}
                        className="w-full mb-4 py-2 bg-glass-black/5 text-text-muted font-medium rounded-xl hover:bg-glass-black/10 transition-all flex items-center justify-center text-xs"
                    >
                        <RefreshCw className="w-3 h-3 mr-2" /> Clear / Close Session
                    </button>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Past Sessions</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {sessions.map(session => (
                            <button
                                key={session._id}
                                onClick={() => {
                                    loadSession(session._id);
                                    setShowHistory(false);
                                }}
                                className={`w-full text-left p-3 rounded-xl transition-all border ${currentSessionId === session._id
                                    ? 'bg-glass-black/10 border-neon-cyan/50 text-text-main'
                                    : 'hover:bg-glass-black/5 border-transparent text-text-muted'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium truncate text-sm">
                                        {session.title || 'Untitled Session'}
                                    </span>
                                    <ChevronRight className="w-3 h-3 opacity-50" />
                                </div>
                                <div className="text-[10px] opacity-60 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(session.lastUpdated).toLocaleDateString()}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Backdrop for mobile sidebar */}
            {showHistory && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setShowHistory(false)}
                />
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full bg-deep-void/50 rounded-2xl relative overflow-hidden">
                {/* Header Control Bar */}
                <div className="glass-panel p-4 flex flex-wrap justify-between items-center rounded-2xl mb-4 z-10">
                    <div className="flex items-center">
                        <div className="lg:hidden mr-4 flex space-x-2">
                            <button onClick={() => setShowHistory(true)} className="p-2 bg-glass-black/20 text-text-muted rounded-lg border border-glass-white/10 hover:text-text-main"><Clock className="w-4 h-4" /></button>
                            <button onClick={() => setShowResumeModal(true)} className="p-2 bg-neon-cyan/20 text-neon-cyan rounded-lg"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div>
                            <h2 className="font-display font-bold text-text-main text-lg">Interview Coach</h2>
                            {stats.questions > 0 && (
                                <span className="text-xs text-text-muted">
                                    Avg Score: <span className="text-neon-cyan font-bold">{(stats.totalScore / stats.questions).toFixed(1)}</span>/10
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                        <div className="flex bg-glass-black/20 rounded-lg p-1 border border-glass-white/10">
                            {['short', 'medium', 'long'].map(l => (
                                <button
                                    key={l}
                                    onClick={() => setLength(l)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${length === l ? 'bg-glass-black/10 text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'
                                        }`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                        {currentSessionId && (
                            <div className="flex space-x-1">
                                <button onClick={() => getNextQuestion('general')} className="px-3 py-1.5 bg-glass-black/5 hover:bg-glass-black/10 text-xs text-text-main rounded-lg border border-glass-white/10 transition-colors">General</button>
                                <button onClick={() => getNextQuestion('hr')} className="px-3 py-1.5 bg-glass-black/5 hover:bg-glass-black/10 text-xs text-text-main rounded-lg border border-glass-white/10 transition-colors">HR</button>
                                <button onClick={() => getNextQuestion('technical')} className="px-3 py-1.5 bg-glass-black/5 hover:bg-glass-black/10 text-xs text-text-main rounded-lg border border-glass-white/10 transition-colors">Tech</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto space-y-6 px-4 pb-4 custom-scrollbar">
                    {!currentSessionId && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-70">
                            <div className="w-20 h-20 bg-neon-cyan/10 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                                <Upload className="w-8 h-8 text-neon-cyan" />
                            </div>
                            <h3 className="text-2xl font-bold text-text-main mb-2">Ready to Practice?</h3>
                            <p className="text-text-muted max-w-md mb-8">
                                Start a new session. You can optionally upload your resume to get personalized questions tailored to your experience.
                            </p>
                            <button
                                onClick={() => setShowResumeModal(true)}
                                className="px-8 py-3 bg-neon-cyan text-black font-bold rounded-xl hover:bg-neon-cyan/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                            >
                                Start New Session
                            </button>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                            {msg.type === 'ai' && (
                                <div className="max-w-[85%] bg-glass-black/5 border border-glass-white/10 rounded-2xl p-4 rounded-tl-none">
                                    <p className="text-text-main leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                                    <button
                                        onClick={() => {
                                            const utterance = new SpeechSynthesisUtterance(msg.text);
                                            window.speechSynthesis.speak(utterance);
                                        }}
                                        className="mt-2 text-xs text-text-muted hover:text-neon-cyan flex items-center transition-colors"
                                    >
                                        <Volume2 className="w-3 h-3 mr-1" /> Listen
                                    </button>
                                </div>
                            )}
                            {msg.type === 'user' && (
                                <div className="max-w-[85%] bg-gradient-to-r from-neon-cyan/20 to-blue-600/20 border border-neon-cyan/30 rounded-2xl p-4 rounded-tr-none">
                                    <p className="text-white leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            )}
                            {msg.type === 'evaluation' && (
                                <div className="w-full bg-glass-black/20 border border-electric-purple/30 rounded-xl p-6 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-electric-purple to-neon-cyan"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-bold text-text-main flex items-center">
                                            <Award className="w-5 h-5 mr-2 text-yellow-400" />
                                            Feedback
                                        </h3>
                                        <span className={`text-2xl font-bold font-display ${getScoreColor(msg.evaluation.score)}`}>
                                            {msg.evaluation.score}/10
                                        </span>
                                    </div>
                                    <div className="space-y-4 text-sm">
                                        <p className="text-text-main">{msg.evaluation.feedback}</p>
                                        <div className="bg-glass-black/5 p-4 rounded-lg border border-glass-white/5">
                                            <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Better Answer:</p>
                                            <p className="text-green-500 font-medium italic">"{msg.evaluation.betterAnswer}"</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 glass-panel border-t border-glass-white/10 rounded-t-2xl">
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend(e)}
                                placeholder="Type your answer..."
                                disabled={loading || !currentSessionId}
                                className="w-full bg-glass-black/10 border border-glass-white/10 text-text-main px-4 py-3 pr-10 rounded-xl focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan outline-none transition-all placeholder-text-muted disabled:opacity-50"
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <VoiceInput onTranscript={(t) => setInput(prev => prev + ' ' + t)} />
                            </div>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={loading || !currentSessionId}
                            className="p-3 bg-neon-cyan text-black rounded-xl hover:bg-neon-cyan/90 disabled:opacity-50 transition-all font-bold shadow-lg hover:shadow-neon-cyan/20"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>


                </div>
            </div>
            {/* Resume Modal */}
            {showResumeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-glass-black border border-glass-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl relative backdrop-blur-xl">
                        <button onClick={() => setShowResumeModal(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-main">✕</button>
                        <h3 className="text-2xl font-display font-bold text-text-main mb-2">Start New Session</h3>
                        <p className="text-text-muted mb-6 text-sm">Upload your resume for personalized questions (PDF) or skip to start generic.</p>

                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-glass-white/10 rounded-xl cursor-pointer hover:border-neon-cyan/50 hover:bg-glass-black/5 transition-all mb-6 group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 text-text-muted mb-2 group-hover:text-neon-cyan transition-colors" />
                                <p className="text-sm text-text-muted group-hover:text-text-main">{resumeFile ? resumeFile.name : 'Click to upload PDF'}</p>
                            </div>
                            <input type="file" className="hidden" accept=".pdf" onChange={(e) => setResumeFile(e.target.files[0])} />
                        </label>

                        <div className="flex space-x-3">
                            <button
                                onClick={startNewSession}
                                className="flex-1 py-3 bg-neon-cyan text-black font-bold rounded-xl hover:bg-neon-cyan/90 transition-all"
                            >
                                {resumeFile ? 'Start with Resume' : 'Start without Resume'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Interview;
