import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Trash2, Plus, Volume2, RotateCw, Check, X, BookOpen, Layers } from 'lucide-react';

const Flashcards = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ word: '', definition: '', example: '', pronunciation: '' });
    const [studyMode, setStudyMode] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/flashcards`);
            setCards(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/flashcards`, formData);
            setCards([res.data, ...cards]);
            setFormData({ word: '', definition: '', example: '', pronunciation: '' });
            setShowForm(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this card?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/flashcards/${id}`);
            setCards(cards.filter(c => c._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleMastery = async (id, level) => {
        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/flashcards/${id}`, { mastery: level });
            const updatedCards = [...cards];
            const index = updatedCards.findIndex(c => c._id === id);
            updatedCards[index] = res.data;
            setCards(updatedCards);

            if (studyMode) {
                nextCard();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const nextCard = () => {
        setIsFlipped(false);
        if (currentCardIndex < cards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
        } else {
            alert("Session complete!");
            setStudyMode(false);
            setCurrentCardIndex(0);
        }
    };

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading your deck...</div>;

    if (studyMode && cards.length > 0) {
        const currentCard = cards[currentCardIndex];
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-6rem)] flex flex-col items-center justify-center">
                <Helmet><title>Study Mode | English Mastery</title></Helmet>

                <div className="w-full max-w-lg mb-8">
                    <div className="flex justify-between items-center text-text-muted mb-4">
                        <span>Card {currentCardIndex + 1} of {cards.length}</span>
                        <button onClick={() => setStudyMode(false)} className="text-sm hover:text-white">Exit Study</button>
                    </div>

                    <div
                        className={`relative w-full h-80 cursor-pointer perspective-1000 group`}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <div className={`relative w-full h-full duration-500 preserve-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>
                            {/* Front */}
                            <div className="absolute inset-0 backface-hidden bg-glass-black border border-glass-white/10 rounded-2xl flex flex-col items-center justify-center p-8 shadow-2xl">
                                <h2 className="text-4xl font-bold text-text-main mb-4">{currentCard.word}</h2>
                                <p className="text-text-muted italic">{currentCard.pronunciation}</p>
                                <div className="mt-8 text-sm text-neon-cyan animate-pulse">Click to flip</div>
                            </div>

                            {/* Back */}
                            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-deep-void border border-neon-cyan/30 rounded-2xl flex flex-col items-center justify-center p-8 shadow-[0_0_30px_rgba(0,243,255,0.1)]">
                                <h3 className="text-xl font-bold text-neon-cyan mb-2">Definition</h3>
                                <p className="text-text-main text-center mb-6">{currentCard.definition}</p>
                                {currentCard.example && (
                                    <div className="bg-white/5 p-3 rounded-lg w-full text-center">
                                        <p className="text-sm text-text-muted italic">"{currentCard.example}"</p>
                                    </div>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); speak(currentCard.word); }}
                                    className="mt-6 p-2 bg-white/10 rounded-full hover:bg-neon-cyan/20 text-neon-cyan"
                                >
                                    <Volume2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {isFlipped && (
                        <div className="flex justify-center space-x-4 mt-8 animate-slide-up">
                            <button onClick={() => handleMastery(currentCard._id, 1)} className="px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20">Hard</button>
                            <button onClick={() => handleMastery(currentCard._id, 2)} className="px-6 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20">Good</button>
                            <button onClick={() => handleMastery(currentCard._id, 3)} className="px-6 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20">Easy</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <Helmet><title>Flashcards | English Mastery</title></Helmet>

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-display font-bold text-text-main mb-2">Vocabulary Deck</h1>
                    <p className="text-text-muted">Master your saved words with spaced repetition.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setStudyMode(true)}
                        disabled={cards.length === 0}
                        className="px-5 py-2.5 bg-electric-purple text-white font-bold rounded-xl hover:bg-electric-purple/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg transition-all"
                    >
                        <Layers className="w-4 h-4 mr-2" /> Study Now
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-5 py-2.5 bg-neon-cyan text-black font-bold rounded-xl hover:bg-neon-cyan/90 flex items-center shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all"
                    >
                        {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {showForm ? 'Cancel' : 'Add Word'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="glass-panel p-6 rounded-2xl mb-8 animate-slide-up border border-neon-cyan/20">
                    <h3 className="text-lg font-bold text-text-main mb-4">Add New Word</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            placeholder="Word"
                            className="bg-glass-black/20 border border-glass-white/10 rounded-lg p-3 text-text-main focus:border-neon-cyan outline-none"
                            value={formData.word}
                            onChange={e => setFormData({ ...formData, word: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Pronunciation (optional)"
                            className="bg-glass-black/20 border border-glass-white/10 rounded-lg p-3 text-text-main focus:border-neon-cyan outline-none"
                            value={formData.pronunciation}
                            onChange={e => setFormData({ ...formData, pronunciation: e.target.value })}
                        />
                        <input
                            placeholder="Definition"
                            className="md:col-span-2 bg-glass-black/20 border border-glass-white/10 rounded-lg p-3 text-text-main focus:border-neon-cyan outline-none"
                            value={formData.definition}
                            onChange={e => setFormData({ ...formData, definition: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Example Sentence (optional)"
                            className="md:col-span-2 bg-glass-black/20 border border-glass-white/10 rounded-lg p-3 text-text-main focus:border-neon-cyan outline-none"
                            value={formData.example}
                            onChange={e => setFormData({ ...formData, example: e.target.value })}
                        />
                        <button type="submit" className="md:col-span-2 py-3 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 rounded-lg font-bold hover:bg-neon-cyan/30 transition-all">
                            Save to Deck
                        </button>
                    </form>
                </div>
            )}

            {cards.length === 0 ? (
                <div className="text-center py-16 opacity-50">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-text-muted" />
                    <p className="text-xl">Your deck is empty.</p>
                    <p className="text-sm">Add words manually or save them from the Dashboard.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map(card => (
                        <div key={card._id} className="glass-panel p-5 rounded-xl border border-glass-white/5 hover:border-neon-cyan/30 transition-all group relative">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-text-main">{card.word}</h3>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => speak(card.word)} className="text-text-muted hover:text-neon-cyan"><Volume2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(card._id)} className="text-text-muted hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <p className="text-xs text-text-muted italic mb-3">{card.pronunciation}</p>
                            <p className="text-sm text-text-main mb-3">{card.definition}</p>
                            {card.example && (
                                <div className="bg-glass-black/10 p-2 rounded text-xs text-text-muted italic border border-glass-white/5">
                                    "{card.example}"
                                </div>
                            )}
                            <div className="mt-4 flex justify-between items-center">
                                <span className={`text-xs px-2 py-1 rounded-full border ${card.mastery === 3 ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        card.mastery === 2 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                    {card.mastery === 3 ? 'Mastered' : card.mastery === 2 ? 'Reviewing' : 'New'}
                                </span>
                                <span className="text-[10px] text-text-muted">Added {new Date(card.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Flashcards;
