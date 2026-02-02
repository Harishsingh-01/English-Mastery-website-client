import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Trash2, FileText, HelpCircle, X, Download, Volume2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Mistakes = () => {
    const [mistakes, setMistakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [examples, setExamples] = useState(null); // { mistakeId: '...', data: [] }
    const [examplesLoading, setExamplesLoading] = useState(false);

    useEffect(() => {
        fetchMistakes();
    }, []);

    const fetchMistakes = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/mistakes`);
            setMistakes(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this mistake?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/mistakes/${id}`);
            setMistakes(mistakes.filter(m => m._id !== id));
        } catch (err) {
            alert('Failed to delete mistake');
        }
    };

    const handleGetExamples = async (mistake) => {
        setExamplesLoading(mistake._id);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/analyze/examples`, {
                rule: mistake.rule,
                mistake: mistake.wrongPhrase
            });
            setExamples({ mistakeId: mistake._id, data: res.data });
        } catch (err) {
            alert('Failed to fetch examples');
        } finally {
            setExamplesLoading(false);
        }
    };

    const exportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text("My Mistake Report", 14, 22);

        doc.setFontSize(10);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

        const tableColumn = ["Mistake", "Correction", "Rule", "Frequency"];
        const tableRows = [];

        mistakes.forEach(mistake => {
            const mistakeData = [
                mistake.wrongPhrase,
                mistake.correctPhrase,
                mistake.rule,
                mistake.count
            ];
            tableRows.push(mistakeData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [0, 243, 255], textColor: [0, 0, 0] }
        });

        doc.save("English_Mistakes_Report.pdf");
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <Helmet>
                <title>My Mistakes | English Mastery</title>
            </Helmet>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-display font-bold text-text-main">My Mistakes Library</h1>
                {mistakes.length > 0 && (
                    <button
                        onClick={exportPDF}
                        className="flex items-center px-4 py-2 bg-glass-black/5 hover:bg-glass-black/10 text-text-main rounded-lg border border-glass-white/10 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" /> Export PDF
                    </button>
                )}
            </div>

            {mistakes.length === 0 ? (
                <div className="glass-panel text-center py-16 rounded-2xl flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">✨</span>
                    </div>
                    <p className="text-slate-400 text-lg">Your mistake library is clean. Keep practicing!</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {mistakes.map((mistake) => (
                        <div key={mistake._id} className="glass-panel p-6 rounded-2xl border border-glass-white/5 hover:border-electric-purple/50 transition-all hover:-translate-y-1 relative group overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-electric-purple/10 rounded-full blur-xl -mr-10 -mt-10 group-hover:bg-electric-purple/20 transition-all pointer-events-none"></div>

                            {/* Header */}
                            <div className="flex justify-between items-start mb-5 relative z-10 w-full">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${mistake.count > 3
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                    }`}>
                                    Repeated {mistake.count}x
                                </span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-text-muted font-mono">
                                        {new Date(mistake.lastSeen).toLocaleDateString()}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(mistake._id)}
                                        className="p-1.5 rounded-full hover:bg-red-500/20 text-text-muted hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-4 relative z-10 flex-1">
                                <div className="bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                                    <div className="text-[10px] text-red-400/70 uppercase tracking-widest font-bold mb-1">Mistake</div>
                                    <p className="text-text-main font-medium line-through decoration-red-500/50 decoration-2">{mistake.wrongPhrase}</p>
                                </div>
                                <div className="bg-green-500/5 p-3 rounded-lg border border-green-500/10 relative">
                                    <div className="text-[10px] text-green-400/70 uppercase tracking-widest font-bold mb-1">Correction</div>
                                    <p className="text-green-500 font-medium pr-6">{mistake.correctPhrase}</p>
                                    <button
                                        onClick={() => {
                                            const utterance = new SpeechSynthesisUtterance(mistake.correctPhrase);
                                            window.speechSynthesis.speak(utterance);
                                        }}
                                        className="absolute top-3 right-3 text-green-500/50 hover:text-green-500 transition-colors"
                                    >
                                        <Volume2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="pt-3 border-t border-glass-white/5">
                                    <p className="text-sm text-text-muted italic mb-3">
                                        <span className="text-neon-cyan/70 font-normal not-italic mr-1">Rule:</span>
                                        "{mistake.rule}"
                                    </p>

                                    {/* Examples Section */}
                                    {examples?.mistakeId === mistake._id ? (
                                        <div className="bg-glass-black/5 rounded-lg p-3 animate-fade-in relative mt-2">
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
                                            onClick={() => handleGetExamples(mistake)}
                                            disabled={examplesLoading === mistake._id}
                                            className="w-full py-2 bg-glass-black/5 hover:bg-glass-black/10 border border-glass-white/5 rounded-lg text-xs font-medium text-text-main flex items-center justify-center transition-colors"
                                        >
                                            {examplesLoading === mistake._id ? 'Generating...' : <><HelpCircle className="w-3 h-3 mr-2" /> See Examples</>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Mistakes;
