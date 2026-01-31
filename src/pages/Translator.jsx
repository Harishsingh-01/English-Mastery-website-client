import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { ArrowRightLeft, Volume2, Copy, Check } from 'lucide-react';
import VoiceInput from '../components/VoiceInput';

const Translator = () => {
    const [text, setText] = useState('');
    const [translation, setTranslation] = useState('');
    const [loading, setLoading] = useState(false);
    const [lang, setLang] = useState('en'); // 'en' -> English to Hindi, 'hi' -> Hindi to English (Target is opposite)

    const handleTranslate = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const target = lang === 'en' ? 'hi' : 'en';
            const res = await axios.post('/api/translate', { text, targetLang: target });
            setTranslation(res.data.translation);
        } catch (err) {
            console.error(err);
            alert('Translation failed');
        } finally {
            setLoading(false);
        }
    };

    const toggleLang = () => {
        setLang(lang === 'en' ? 'hi' : 'en');
        setText(translation);
        setTranslation(text);
    };

    const speak = (txt, language) => {
        const utterance = new SpeechSynthesisUtterance(txt);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Helmet>
                <title>Translator | English Mastery</title>
            </Helmet>
            <h1 className="text-4xl font-display font-bold text-center text-text-main mb-2">AI Translator</h1>
            <p className="text-center text-text-muted mb-12">Instant translation with native pronunciation</p>

            <div className="glass-panel rounded-2xl p-1 shadow-[0_0_50px_rgba(0,243,255,0.1)]">
                <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 p-6">
                    {/* Source Input */}
                    <div className="flex flex-col space-y-4">
                        <span className="text-sm font-medium text-neon-cyan uppercase tracking-wider">
                            {lang === 'en' ? 'English' : 'Hindi'}
                        </span>
                        <div className="relative">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type to translate..."
                                className="flex-1 bg-glass-black/5 border border-glass-white/10 rounded-xl p-4 text-text-main placeholder-text-muted focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 resize-none h-48 md:h-64 transition-all w-full"
                            />
                            <div className="absolute bottom-3 right-3 z-10">
                                <VoiceInput
                                    onTranscript={(t) => setText(prev => prev + ' ' + t)}
                                    lang={lang === 'en' ? 'en-US' : 'hi-IN'}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
// ...
                            <button onClick={() => speak(text, lang)} className="hover:text-neon-cyan transition-colors"><Volume2 className="w-5 h-5" /></button>
                            <span className="text-xs">{text.length} chars</span>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex items-center justify-center">
                        <button
                            onClick={toggleLang}
                            className="p-3 rounded-full bg-glass-black/20 border border-glass-white/20 hover:border-neon-cyan text-text-muted hover:text-neon-cyan transition-all hover:scale-110 active:scale-95"
                        >
                            <ArrowRightLeft className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Target Output */}
                    <div className="flex flex-col space-y-4">
                        <span className="text-sm font-medium text-electric-purple uppercase tracking-wider">
                            {lang === 'en' ? 'Hindi' : 'English'}
                        </span>
                        <div className="flex-1 bg-glass-black/20 border border-glass-white/10 rounded-xl p-4 text-text-main h-48 md:h-64 overflow-y-auto relative group">
                            {loading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan"></div>
                                </div>
                            ) : (
                                translation || <span className="text-text-muted italic">Translation will appear here...</span>
                            )}
                        </div>
                        <div className="flex justify-between items-center text-text-muted">
                            <button onClick={() => speak(translation, lang === 'en' ? 'hi' : 'en')} className="hover:text-electric-purple transition-colors"><Volume2 className="w-5 h-5" /></button>
                            <button
                                onClick={() => navigator.clipboard.writeText(translation)}
                                className="hover:text-text-main transition-colors"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-glass-white/5 flex justify-center">
                    <button
                        onClick={handleTranslate}
                        disabled={loading || !text.trim()}
                        className="px-8 py-3 bg-gradient-to-r from-neon-cyan to-blue-600 text-white font-semibold rounded-lg shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Translating...' : 'Translate Text'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Translator;
