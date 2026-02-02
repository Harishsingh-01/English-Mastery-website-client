import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { Mic, Send, Clock, Play, AlertCircle, Award, Volume2, StopCircle } from 'lucide-react';
import VoiceInput from '../components/VoiceInput';

const Debate = () => {
    const [gameState, setGameState] = useState('setup'); // setup, debating, analysis
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('easy'); // Default to easy per request
    const [customTopic, setCustomTopic] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [turnFeedback, setTurnFeedback] = useState(null);
    const [finalStats, setFinalStats] = useState(null);

    // Timer State
    const [timeLeft, setTimeLeft] = useState(60);
    const [timerActive, setTimerActive] = useState(false);

    // User Input
    const [input, setInput] = useState('');

    // Audio State
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0) {
            setTimerActive(false);
            // Optional: Auto-submit or vibrate?
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const startDebate = async (selectedTopic = null) => {
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/debate/start`, {
                topic: selectedTopic
            });
            setSessionId(res.data.sessionId);
            setTopic(res.data.topic);
            setMessages([{ role: 'ai', content: res.data.openingStatement }]);
            speak(res.data.openingStatement);
            setGameState('debating');
            startUserTurn();
        } catch (err) {
            alert('Failed to start debate');
        } finally {
            setLoading(false);
        }
    };

    const startUserTurn = () => {
        setInput('');
        setTimeLeft(60);
        setTimerActive(true);
    };

    const sendTurn = async () => {
        if (!input.trim()) return;
        setTimerActive(false);
        setLoading(true);

        // Optimistic UI
        const newMsgs = [...messages, { role: 'user', content: input }];
        setMessages(newMsgs);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/debate/turn`, {
                sessionId,
                message: input
            });

            setTurnFeedback(res.data.feedback);

            const withReply = [...newMsgs, { role: 'ai', content: res.data.reply }];
            setMessages(withReply);
            speak(res.data.reply);

            // Prepare for next turn
            startUserTurn();
        } catch (err) {
            alert('Error sending turn');
        } finally {
            setLoading(false);
        }
    };

    const endDebate = async () => {
        setLoading(true);
        window.speechSynthesis.cancel(); // Stop speaking immediately
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/debate/end`, { sessionId });
            setFinalStats(res.data);
            setGameState('analysis');
        } catch (err) {
            alert('Error ending debate');
        } finally {
            setLoading(false);
        }
    };

    const speak = (text) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false); // Handle errors
        window.speechSynthesis.speak(utterance);
    };

    const toggleSpeech = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            // Replay last AI message
            const lastAiMsg = messages.slice().reverse().find(m => m.role === 'ai');
            if (lastAiMsg) speak(lastAiMsg.content);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in text-text-main h-[calc(100vh-12rem)] flex flex-col">
            <Helmet><title>Debate Mode | English Mastery</title></Helmet>

            {/* SETUP SCREEN */}
            {gameState === 'setup' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 glass-panel p-8 rounded-3xl border border-glass-white/10 overflow-y-auto">
                    <div>
                        <div className="w-20 h-20 bg-neon-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                            <Mic className="w-10 h-10 text-neon-cyan" />
                        </div>
                        <h1 className="text-4xl font-display font-bold mb-4">Debate Arena</h1>
                        <p className="text-text-muted max-w-lg mx-auto text-lg">
                            Test your fluency. You have 60 seconds to respond to each point.
                        </p>
                    </div>

                    {/* Difficulty Selector */}
                    <div className="flex bg-glass-black/30 p-1 rounded-xl border border-glass-white/10">
                        {['easy', 'medium', 'hard'].map((level) => (
                            <button
                                key={level}
                                onClick={() => setDifficulty(level)}
                                className={`px-6 py-2 rounded-lg font-bold capitalize transition-all ${difficulty === level
                                    ? 'bg-neon-cyan text-black shadow-lg'
                                    : 'text-text-muted hover:text-text-main hover:bg-glass-white/5'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>

                    <div className="w-full max-w-md space-y-4">
                        {/* Quick Topics */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {['Cats vs Dogs', 'Summer vs Winter', 'City Life vs Village', 'Books vs Movies'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => startDebate(t)}
                                    disabled={loading}
                                    className="p-3 bg-glass-white/5 hover:bg-glass-white/10 border border-glass-white/5 hover:border-neon-cyan/30 rounded-xl transition-all text-text-muted hover:text-neon-cyan truncate"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-glass-white/10"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-deep-void px-2 text-text-muted">Or Random</span></div>
                        </div>

                        <button
                            onClick={() => startDebate()}
                            disabled={loading}
                            className="w-full py-4 bg-neon-cyan text-black font-bold rounded-xl hover:bg-neon-cyan/90 transition-all text-lg shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:scale-105 transform"
                        >
                            {loading ? 'Starting...' : 'Surprise Me (Random Topic)'}
                        </button>

                        <div className="flex gap-2 mt-4">
                            <input
                                value={customTopic}
                                onChange={(e) => setCustomTopic(e.target.value)}
                                placeholder="Enter your own topic..."
                                className="flex-1 bg-glass-black/20 border border-glass-white/10 rounded-xl px-4 focus:border-neon-cyan outline-none"
                            />
                            <button
                                onClick={() => startDebate(customTopic)}
                                disabled={!customTopic.trim() || loading}
                                className="px-4 bg-glass-white/10 hover:bg-glass-white/20 rounded-xl font-bold disabled:opacity-50"
                            >
                                <Play className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DEBATE SCREEN */}
            {gameState === 'debating' && (
                <div className="flex-1 flex flex-col gap-6">
                    {/* Header with Timer and Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-glass-black/20 p-4 rounded-xl border border-glass-white/5 gap-3">
                        <div className="font-bold text-lg leading-tight flex-1">
                            <span className="text-text-muted text-sm uppercase block mb-1">Current Topic</span>
                            <span className="text-neon-cyan break-words">{topic}</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleSpeech}
                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium border ${isSpeaking
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                    : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                                    }`}
                            >
                                {isSpeaking ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                <span>{isSpeaking ? 'Stop Speaking' : 'Replay Audio'}</span>
                            </button>

                            <div className={`flex items-center space-x-2 text-xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-text-main'}`}>
                                <Clock className="w-5 h-5" />
                                <span>00:{timeLeft.toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user'
                                    ? 'bg-neon-cyan/10 text-text-main border border-neon-cyan/20 rounded-tr-sm'
                                    : 'bg-glass-white/5 text-text-main border border-glass-white/10 rounded-tl-sm'
                                    }`}>
                                    <p>{msg.content}</p>
                                    {msg.role === 'ai' && (
                                        <button onClick={() => speak(msg.content)} className="mt-2 text-text-muted hover:text-neon-cyan"><Volume2 className="w-4 h-4" /></button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Live Feedback Toast */}
                    {turnFeedback && (
                        <div className="bg-electric-purple/10 border border-electric-purple/30 p-3 rounded-lg text-sm text-electric-purple flex items-center justify-between animate-slide-up">
                            <span><strong className="mr-2">Instant Feedback:</strong> {turnFeedback.feedback}</span>
                            <span className="font-bold bg-electric-purple/20 px-2 py-0.5 rounded text-xs">Score: {turnFeedback.coherenceScore}/10</span>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="glass-panel p-4 rounded-2xl border border-glass-white/10 mt-auto">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Make your argument..."
                                    className="w-full bg-glass-black/20 border-none rounded-xl p-4 pr-12 text-main focus:ring-1 focus:ring-neon-cyan resize-none h-32 md:h-40 text-lg"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendTurn();
                                        }
                                    }}
                                />
                                <div className="absolute right-3 top-3">
                                    <VoiceInput onTranscript={(text) => setInput(prev => prev + ' ' + text)} />
                                </div>
                            </div>
                            <button
                                onClick={sendTurn}
                                disabled={loading || !input.trim()}
                                className="p-4 bg-neon-cyan rounded-xl text-black hover:bg-neon-cyan/90 transition-colors shadow-lg disabled:opacity-50"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-text-muted">
                            <button onClick={endDebate} className="flex items-center hover:text-red-400 transition-colors">
                                <StopCircle className="w-3 h-3 mr-1" /> End Debate
                            </button>
                            <span>Speak clearly. Don't worry about perfect grammar.</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ANALYSIS SCREEN */}
            {gameState === 'analysis' && finalStats && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="glass-panel p-8 rounded-3xl w-full max-w-2xl border border-neon-cyan/20 animate-slide-up">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-tr from-neon-cyan to-electric-purple rounded-full flex items-center justify-center mx-auto mb-4 text-black animate-bounce-short">
                                <Award className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold font-display">Performance Report</h2>
                            <p className="text-text-muted">Here is how you performed in the debate.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-glass-white/5 p-4 rounded-xl text-center border border-glass-white/5">
                                <div className="text-2xl font-bold text-neon-cyan">{finalStats.logicScore}</div>
                                <div className="text-xs uppercase text-text-muted">Logic</div>
                            </div>
                            <div className="bg-glass-white/5 p-4 rounded-xl text-center border border-glass-white/5">
                                <div className="text-2xl font-bold text-electric-purple">{finalStats.vocabularyScore}</div>
                                <div className="text-xs uppercase text-text-muted">Vocabulary</div>
                            </div>
                            <div className="bg-glass-white/5 p-4 rounded-xl text-center border border-glass-white/5">
                                <div className="text-2xl font-bold text-green-400">{finalStats.fluencyScore}</div>
                                <div className="text-xs uppercase text-text-muted">Fluency</div>
                            </div>
                        </div>

                        <div className="bg-glass-black/20 p-6 rounded-xl border border-glass-white/10 mb-8">
                            <h3 className="font-bold mb-2 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2 text-neon-cyan" />
                                AI Feedback
                            </h3>
                            <p className="text-text-main leading-relaxed italic">"{finalStats.summary}"</p>
                        </div>

                        <button
                            onClick={() => setGameState('setup')}
                            className="w-full py-4 bg-glass-white/10 hover:bg-glass-white/20 rounded-xl font-bold transition-all"
                        >
                            Start New Debate
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Debate;
