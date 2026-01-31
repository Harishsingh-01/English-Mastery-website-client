import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Coffee, Stethoscope, Briefcase, Plane, ArrowRight } from 'lucide-react';
import axios from 'axios';

const scenarios = [
    { id: 'cafe', title: 'Coffee Shop', icon: Coffee, desc: 'Order a drink and a snack.', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
    { id: 'doctor', title: 'Doctor Visit', icon: Stethoscope, desc: 'Describe your symptoms.', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { id: 'job_negotiation', title: 'Job Offer', icon: Briefcase, desc: 'Negotiate your salary.', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
    { id: 'airport', title: 'Airport Check-in', icon: Plane, desc: 'Check in for your flight.', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
];

const RoleplayHub = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const startScenario = async (id) => {
        setLoading(true);
        try {
            const res = await axios.post('/api/roleplay/start', { scenario: id });
            // Navigate to session with initial data
            navigate(`/roleplay/${id}`, { state: { initialMessage: res.data.message, config: res.data.scenarioConfig } });
        } catch (err) {
            console.error(err);
            alert("Failed to start scenario");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Helmet>
                <title>Roleplay Scenarios | English Mastery</title>
            </Helmet>
            <h1 className="text-3xl font-display font-bold text-text-main mb-2">Roleplay Scenarios</h1>
            <p className="text-text-muted mb-8">Practice real-world conversations in a safe environment.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {scenarios.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => startScenario(s.id)}
                        disabled={loading}
                        className={`group relative overflow-hidden rounded-2xl border ${s.border} p-6 text-left transition-all hover:scale-[1.02] hover:shadow-lg glass-panel`}
                    >
                        <div className={`absolute inset-0 ${s.bg} opacity-50 group-hover:opacity-70 transition-opacity`} />
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <div className={`p-3 rounded-xl inline-block ${s.bg} border ${s.border} mb-4`}>
                                    <s.icon className={`w-8 h-8 ${s.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-text-main mb-1">{s.title}</h3>
                                <p className="text-text-muted text-sm">{s.desc}</p>
                            </div>
                            <div className="p-2 rounded-full bg-glass-black/5 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                <ArrowRight className="w-5 h-5 text-text-main" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RoleplayHub;
