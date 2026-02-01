import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { MessageSquare, Send, Bot, User, RefreshCw, Volume2 } from 'lucide-react';
import VoiceInput from '../components/VoiceInput';

const AiTutor = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Hello! I am your AI Tutor. Ask me anything or just chat with me to practice your English!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Prepare context (last 6 messages excluding the new one we just added locally, but we should include it for the API call context if we want, 
        // actually the API takes 'history' separate from 'message'. 
        // We generally pass the history BEFORE the current message.
        const history = messages.map(m => ({ role: m.role, content: m.content }));

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/tutor/chat`, {
                message: userMsg.content,
                history: history
            });

            setMessages(prev => [...prev, { role: 'ai', content: res.data.reply }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{ role: 'ai', content: 'Chat cleared. What would you like to talk about now?' }]);
    };

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-6rem)]">
            <Helmet>
                <title>AI Tutor | English Mastery</title>
            </Helmet>

            <div className="flex flex-col h-full bg-deep-void/50 rounded-2xl relative overflow-hidden border border-glass-white/10 shadow-2xl">
                {/* Header */}
                <div className="glass-panel p-4 flex justify-between items-center z-10">
                    <div className="flex items-center">
                        <div className="p-2 bg-neon-cyan/20 rounded-xl mr-3">
                            <Bot className="w-6 h-6 text-neon-cyan" />
                        </div>
                        <div>
                            <h2 className="font-display font-bold text-text-main text-lg">AI Tutor</h2>
                            <p className="text-xs text-text-muted">Always here to help</p>
                        </div>
                    </div>
                    <button
                        onClick={clearChat}
                        className="p-2 text-text-muted hover:text-text-main hover:bg-glass-black/10 rounded-lg transition-all"
                        title="Clear Chat"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-6 p-6 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-neon-cyan/20 ml-3' : 'bg-electric-purple/20 mr-3'
                                    }`}>
                                    {msg.role === 'user' ? <User className="w-5 h-5 text-neon-cyan" /> : <Bot className="w-5 h-5 text-electric-purple" />}
                                </div>

                                <div className={`p-4 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-glass-black/30 border border-neon-cyan/30 rounded-tr-none text-right'
                                    : 'bg-glass-black/20 border border-glass-white/10 rounded-tl-none'
                                    }`}>
                                    <p className="text-text-main leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                    {msg.role === 'ai' && (
                                        <button
                                            onClick={() => speak(msg.content)}
                                            className="mt-2 text-xs text-text-muted hover:text-neon-cyan flex items-center transition-colors"
                                        >
                                            <Volume2 className="w-3 h-3 mr-1" /> Listen
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start animate-pulse">
                            <div className="flex items-center bg-glass-black/20 border border-glass-white/10 rounded-2xl rounded-tl-none p-4 ml-11">
                                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce mr-1"></div>
                                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce mr-1 delay-100"></div>
                                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 glass-panel border-t border-glass-white/10">
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend(e)}
                                placeholder="Ask me anything..."
                                disabled={loading}
                                className="w-full bg-glass-black/10 border border-glass-white/10 text-text-main px-4 py-3 pr-10 rounded-xl focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan outline-none transition-all placeholder-text-muted disabled:opacity-50"
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <VoiceInput onTranscript={(t) => setInput(prev => prev + ' ' + t)} />
                            </div>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="p-3 bg-neon-cyan text-black rounded-xl hover:bg-neon-cyan/90 disabled:opacity-50 transition-all font-bold shadow-lg hover:shadow-neon-cyan/20"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiTutor;
