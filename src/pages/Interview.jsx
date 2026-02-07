import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { MessageSquare, Mic, Send, PlayCircle, Award, RefreshCw, Upload, Clock, FileText, ChevronRight, Plus, X, Volume2, Trash2 } from 'lucide-react';
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
    const [sessionState, setSessionState] = useState({ phase: 'intro', mood: 'friendly', tempType: 'general', tempContext: '' });
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);

    // Voice State
    const [autoSpeak, setAutoSpeak] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const messagesEndRef = useRef(null);

    // Initial Load
    useEffect(() => {
        fetchHistory();
    }, []);

    const deleteSession = async (e, id) => {
        e.stopPropagation(); // Prevent loading the session when clicking delete
        if (!window.confirm("Are you sure you want to delete this session?")) return;

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/interview/session/${id}`);
            setSessions(prev => prev.filter(s => s._id !== id));

            // If deleting current session, clear it
            if (currentSessionId === id) {
                setCurrentSessionId(null);
                setMessages([]);
                setStats({ questions: 0, totalScore: 0 });
                localStorage.removeItem('activeInterviewSession');
            }
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-TTS Effect
    useEffect(() => {
        if (!autoSpeak) return;

        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.type === 'ai') {
            // Cancel previous speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(lastMsg.text);

            // Optional: Select a specific voice if available (e.g., Google US English)
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Microsoft Zira'));
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        }
    }, [messages, autoSpeak]);

    // Initial Voice Load fix (Voices load asynchronously)
    useEffect(() => {
        window.speechSynthesis.onvoiceschanged = () => {
            // Force re-render or voice load if needed, mostly handled by browser
        };
    }, []);

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
            setSessionState({
                phase: res.data.interviewPhase || 'intro',
                mood: res.data.interviewerMood || 'friendly'
            });

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

    const startNewSession = async (type = 'general', context = '') => {
        setLoading(true);
        const formData = new FormData();
        if (resumeFile) {
            formData.append('resume', resumeFile);
        }
        formData.append('interviewType', type);
        formData.append('manualContext', context);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/interview/start`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSessions(prev => [res.data, ...prev]);
            setCurrentSessionId(res.data._id);
            setSessionState({ phase: 'intro', mood: 'friendly', tempType: type, tempContext: context });

            // AUTO-START: Immediately get the first Intro question
            // Pass the new ID explicitly because state update is async
            await getNextQuestion('intro', res.data._id, true);

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

    const getNextQuestion = async (type = 'general', overrideSessionId = null, isFirst = false) => {
        setLoading(true);
        const targetId = overrideSessionId || currentSessionId;
        if (!targetId) return;

        try {
            // Optimistic update
            // setMessages(prev => [...prev]); 

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/interview/question`, {
                type,
                sessionId: targetId,
                length
            });

            // If first question, replace "New session" text or just append
            if (isFirst) {
                setMessages([{ type: 'ai', text: res.data.question }]);
            } else {
                setMessages(prev => [...prev, { type: 'ai', text: res.data.question }]);
            }

            if (res.data.interviewPhase) setSessionState(prev => ({ ...prev, phase: res.data.interviewPhase }));
            if (res.data.interviewerMood) setSessionState(prev => ({ ...prev, mood: res.data.interviewerMood }));
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

            // Update State
            if (res.data.interviewPhase) setSessionState(prev => ({ ...prev, phase: res.data.interviewPhase }));
            if (res.data.interviewerMood) setSessionState(prev => ({ ...prev, mood: res.data.interviewerMood }));

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

    // Helper for Mood Icon
    const getMoodIcon = (mood) => {
        if (mood === 'friendly') return '😃';
        if (mood === 'strict') return '😠';
        return '😐';
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
                                className={`w-full text-left p-3 rounded-xl transition-all border group relative ${currentSessionId === session._id
                                    ? 'bg-glass-black/10 border-neon-cyan/50 text-text-main'
                                    : 'hover:bg-glass-black/5 border-transparent text-text-muted'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium truncate text-sm max-w-[80%]">
                                        {session.title || 'Untitled Session'}
                                    </span>
                                    <Trash2
                                        className="w-4 h-4 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
                                        onClick={(e) => deleteSession(e, session._id)}
                                    />
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
                            <h2 className="font-display font-bold text-text-main text-lg mr-4">Interview Coach</h2>

                            {/* NEW BADGES */}
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Phase:</span>
                                <span className="text-xs bg-neon-cyan/20 px-2 py-0.5 rounded text-neon-cyan border border-neon-cyan/30 capitalize">
                                    {sessionState.phase}
                                </span>
                                <span className="text-gray-600 px-1">|</span>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Mood:</span>
                                <span className={`text-xs px-2 py-0.5 rounded capitalize border ${sessionState.mood === 'friendly' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                                    sessionState.mood === 'strict' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                                    }`}>
                                    {getMoodIcon(sessionState.mood)} {sessionState.mood}
                                </span>
                            </div>

                        </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                        {/* Speaking Indicator */}
                        {isSpeaking && (
                            <div className="flex items-center space-x-1 mr-2 px-2 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20">
                                <div className="w-1 h-3 bg-neon-cyan animate-pulse"></div>
                                <div className="w-1 h-5 bg-neon-cyan animate-pulse delay-75"></div>
                                <div className="w-1 h-3 bg-neon-cyan animate-pulse delay-150"></div>
                                <span className="text-[10px] font-bold text-neon-cyan ml-1">SPEAKING</span>
                            </div>
                        )}

                        {/* Controls */}
                        <div className="flex bg-glass-black/20 rounded-lg p-1 border border-glass-white/10">
                            <button
                                onClick={() => setAutoSpeak(!autoSpeak)}
                                className={`p-1.5 rounded-md transition-all ${autoSpeak ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-text-muted hover:text-text-main'}`}
                                title={autoSpeak ? "Auto-Speak ON" : "Auto-Speak OFF"}
                            >
                                <Volume2 className="w-4 h-4" />
                            </button>
                            <div className="w-px bg-glass-white/10 mx-1"></div>
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
                        {/* Auto-Structure: No manual overrides allowed */}
                        {currentSessionId && (
                            <div className="flex items-center ml-2">
                                <span className="text-[10px] bg-glass-white/5 border border-glass-white/10 px-2 py-1 rounded text-text-muted">
                                    AUTO-PROGRESS ON
                                </span>
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
            {/* Resume / Settings Modal */}
            {showResumeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-glass-black border border-glass-white/10 p-8 rounded-2xl max-w-lg w-full shadow-2xl relative backdrop-blur-xl">
                        <button onClick={() => setShowResumeModal(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-main">✕</button>
                        <h3 className="text-2xl font-display font-bold text-text-main mb-2">Configure Interview</h3>
                        <p className="text-text-muted mb-6 text-sm">Customize your practice session.</p>

                        {/* Interview Type Selection */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Interview Focus</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['general', 'technical', 'hr', 'behavioral', 'hybrid'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setSessionState(prev => ({ ...prev, tempType: type }))}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium capitalize border transition-all ${(sessionState.tempType || 'general') === type
                                            ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                                            : 'bg-glass-black/20 border-glass-white/10 text-text-muted hover:border-glass-white/30'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Resume Upload */}
                        <div className="mb-4">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Context Source</label>
                            <div className="space-y-4">
                                <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all group ${resumeFile ? 'border-neon-cyan bg-neon-cyan/5' : 'border-glass-white/10 hover:border-neon-cyan/50 hover:bg-glass-black/5'}`}>
                                    <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                        <Upload className={`w-6 h-6 mb-2 transition-colors ${resumeFile ? 'text-neon-cyan' : 'text-text-muted group-hover:text-neon-cyan'}`} />
                                        <p className="text-xs text-text-muted group-hover:text-text-main">{resumeFile ? resumeFile.name : 'Upload Resume (PDF)'}</p>
                                    </div>
                                    <input type="file" className="hidden" accept=".pdf" onChange={(e) => setResumeFile(e.target.files[0])} />
                                </label>

                                {/* OR Divider */}
                                <div className="flex items-center justify-center text-xs text-text-muted">
                                    <span className="bg-deep-void px-2">OR ENTER MANUALLY</span>
                                </div>

                                {/* Manual Context Input */}
                                <textarea
                                    className="w-full bg-glass-black/20 border border-glass-white/10 rounded-xl p-3 text-sm text-text-main focus:border-neon-cyan outline-none"
                                    rows="3"
                                    placeholder="Paste your Skills, Tech Stack, or Project details here..."
                                    onChange={(e) => setSessionState(prev => ({ ...prev, tempContext: e.target.value }))}
                                ></textarea>
                            </div>
                        </div>

                        <button
                            onClick={() => startNewSession(sessionState.tempType, sessionState.tempContext)}
                            className="w-full py-3 bg-neon-cyan text-black font-bold rounded-xl hover:bg-neon-cyan/90 transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                        >
                            Start Interview
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Interview;
