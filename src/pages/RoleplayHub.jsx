import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Coffee, Stethoscope, Briefcase, Plane, UtensilsCrossed, Hotel, ShoppingBag, MessageSquareWarning, Landmark, Pill, Dumbbell, Monitor, Home, Palmtree, Car, Sparkles, Shuffle } from 'lucide-react';
import axios from 'axios';

// Icon mapping for scenarios
const iconMap = {
    cafe: Coffee,
    doctor: Stethoscope,
    job_negotiation: Briefcase,
    airport: Plane,
    restaurant: UtensilsCrossed,
    hotel: Hotel,
    shopping: ShoppingBag,
    customer_service: MessageSquareWarning,
    bank: Landmark,
    pharmacy: Pill,
    gym: Dumbbell,
    tech_support: Monitor,
    real_estate: Home,
    travel_agency: Palmtree,
    car_rental: Car
};

// Color mapping for visual variety
const colorMap = [
    { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
    { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
    { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    { color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' },
    { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
    { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    { color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
    { color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
];

const RoleplayHub = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [scenarios, setScenarios] = useState([]);
    const [fetchingScenarios, setFetchingScenarios] = useState(true);

    // Fetch scenarios on mount
    useEffect(() => {
        const fetchScenarios = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/roleplay/scenarios`);
                setScenarios(res.data);
            } catch (err) {
                console.error('Failed to fetch scenarios:', err);
            } finally {
                setFetchingScenarios(false);
            }
        };
        fetchScenarios();
    }, []);

    const startScenario = async (id) => {
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/roleplay/start`, { scenario: id });
            navigate(`/roleplay/${id}`, { state: { initialMessage: res.data.message, config: res.data.scenarioConfig } });
        } catch (err) {
            console.error(err);
            alert("Failed to start scenario");
        } finally {
            setLoading(false);
        }
    };

    const startRandomScenario = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/roleplay/random`);
            navigate(`/roleplay/${res.data.scenarioId}`, {
                state: { initialMessage: res.data.message, config: res.data.scenarioConfig }
            });
        } catch (err) {
            console.error(err);
            alert("Failed to start random scenario");
        } finally {
            setLoading(false);
        }
    };

    const startAIGeneratedScenario = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/roleplay/generate-random`, {
                difficulty: 'medium'
            });
            navigate(`/roleplay/ai_generated`, {
                state: {
                    initialMessage: res.data.message,
                    config: res.data.scenarioConfig,
                    isAIGenerated: true
                }
            });
        } catch (err) {
            console.error(err);
            alert("Failed to generate AI scenario");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Helmet>
                <title>Roleplay Scenarios | English Mastery</title>
            </Helmet>

            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-text-main mb-2">Roleplay Scenarios</h1>
                <p className="text-text-muted mb-6">Practice real-world conversations in a safe environment.</p>

                {/* Quick Start Buttons */}
                <div className="flex gap-4 flex-wrap">
                    <button
                        onClick={startRandomScenario}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        <Shuffle className="w-5 h-5" />
                        <span className="font-semibold">Random Scenario</span>
                    </button>

                    <button
                        onClick={startAIGeneratedScenario}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        <Sparkles className="w-5 h-5" />
                        <span className="font-semibold">AI Generated Scenario</span>
                    </button>
                </div>
            </div>

            {fetchingScenarios ? (
                <div className="text-center py-12 text-text-muted">Loading scenarios...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scenarios.map((s, idx) => {
                        const Icon = iconMap[s.id] || Coffee;
                        const colors = colorMap[idx % colorMap.length];

                        return (
                            <button
                                key={s.id}
                                onClick={() => startScenario(s.id)}
                                disabled={loading}
                                className={`group relative overflow-hidden rounded-2xl border ${colors.border} p-6 text-left transition-all hover:scale-[1.02] hover:shadow-lg glass-panel`}
                            >
                                <div className={`absolute inset-0 ${colors.bg} opacity-50 group-hover:opacity-70 transition-opacity`} />
                                <div className="relative z-10">
                                    <div className={`p-3 rounded-xl inline-block ${colors.bg} border ${colors.border} mb-4`}>
                                        <Icon className={`w-8 h-8 ${colors.color}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-text-main mb-2">{s.title}</h3>
                                    <p className="text-text-muted text-sm">{s.goal}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RoleplayHub;
