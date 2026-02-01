import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Mic, User, Bot, Award, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import VoiceInput from '../components/VoiceInput';

const RoleplaySession = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const messagesEndRef = useRef(null);

    // Initialize with data from Hub
    useEffect(() => {
        if (location.state?.initialMessage) {
            setMessages([{ role: 'ai', content: location.state.initialMessage }]);
        } else {
            // Fallback if accessed directly (fetch logic omitted for brevity, cleaner to redirect)
            navigate('/roleplay');
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Send only last 6 messages context
            const context = messages.slice(-6);
            const res = await api.post('/api/roleplay/chat', {
                message: userMsg.content,
                history: context,
                scenario: id
            });

            setMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const endSession = async () => {
        setLoading(true);
        try {
            const res = await api.post('/api/roleplay/feedback', {
                history: messages,
                scenario: location.state?.config?.title || id
            });
            setFeedback(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to generate feedback");
        }
        setLoading(false);
    };

    if (feedback) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Helmet>
                    <title>Session Analysis | English Mastery</title>
                </Helmet>
                <button onClick={() => navigate('/roleplay')} className="flex items-center text-text-muted hover:text-text-main mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
                </button>

                <div className="glass-panel p-8 rounded-2xl border border-glass-white/10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-text-main mb-2">Session Analysis</h2>
                            <p className="text-text-muted">Here is how you performed in the {location.state?.config?.title} scenario.</p>
                        </div>
                        <div className="text-center bg-glass-black/5 p-4 rounded-xl border border-glass-white/10">
                            <div className="text-sm text-text-muted mb-1">Score</div>
                            <div className="text-4xl font-bold text-neon-cyan">{feedback.score}/10</div>
                        </div>
                    </div>

                    <div className="mb-8 p-6 bg-glass-black/5 rounded-xl border border-glass-white/10">
                        <h3 className="text-lg font-bold text-text-main mb-3 flex items-center">
                            <Award className="w-5 h-5 mr-2 text-yellow-400" /> General Feedback
                        </h3>
                        <p className="text-text-muted leading-relaxed">{feedback.feedback}</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-text-main mb-2 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-electric-purple" /> Suggested Improvements
                        </h3>
                        {feedback.improvements?.map((item, idx) => (
                            <div key={idx} className="p-4 bg-glass-black/20 rounded-lg border border-glass-white/5">
                                <div className="text-red-400 line-through text-sm mb-1">{item.original}</div>
                                <div className="text-green-500 font-medium mb-1">{item.improved}</div>
                                <div className="text-text-muted text-xs">{item.reason}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] max-w-5xl mx-auto">
            <Helmet>
                <title>{location.state?.config?.title || 'Roleplay'} | English Mastery</title>
            </Helmet>
            {/* Header */}
            <div className="px-6 py-4 border-b border-glass-white/5 flex justify-between items-center bg-glass-black/20 backdrop-blur-md">
                <div className="flex items-center">
                    <button onClick={() => navigate('/roleplay')} className="mr-4 text-text-muted hover:text-text-main">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="font-bold text-text-main text-lg">{location.state?.config?.title}</h2>
                        <span className="text-xs text-neon-cyan px-2 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/20">Live Scenario</span>
                    </div>
                </div>
                <button
                    onClick={endSession}
                    className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                >
                    End Session
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-electric-purple ml-3' : 'bg-neon-cyan mr-3 text-black'}`}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-electric-purple/20 border border-electric-purple/30 text-text-main rounded-tr-none' : 'bg-glass-black/10 border border-glass-white/10 text-text-muted rounded-tl-none'}`}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex items-center space-x-2 bg-glass-black/5 px-4 py-3 rounded-2xl rounded-tl-none border border-glass-white/10 ml-11">
                            <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-glass-white/5 bg-glass-black/20 backdrop-blur-md">
                <form onSubmit={sendMessage} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your response..."
                        className="w-full bg-glass-white/5 border border-glass-white/10 rounded-xl py-4 pl-4 pr-24 text-text-main focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all placeholder-text-muted"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                        <VoiceInput onTranscript={(t) => setInput(prev => prev + (prev ? ' ' : '') + t)} />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="p-2 bg-neon-cyan text-black rounded-lg hover:bg-neon-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoleplaySession;
