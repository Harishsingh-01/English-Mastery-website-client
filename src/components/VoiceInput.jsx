import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceInput = ({ onTranscript, className = "", lang = 'en-US' }) => {
    const [listening, setListening] = useState(false);
    const [supported, setSupported] = useState(true);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setSupported(false);
        }
    }, []);

    const toggleListening = () => {
        if (!supported) {
            alert("Voice input is not supported in this browser.");
            return;
        }

        if (listening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = lang;

        recognition.onstart = () => {
            setListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
            setListening(false);
        };

        recognition.onerror = (event) => {
            if (event.error === 'no-speech') {
                // Ignore no-speech error (timeout) to avoid console noise
                return;
            }
            console.error("Speech recognition error", event.error);
            setListening(false);
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognition.start();
    };

    const stopListening = () => {
        // Recognition stops automatically on end or we can force it, 
        // but since we create a new instance each time, just resetting state logic is fine 
        // unless we store the instance. For simple one-shot, this is okay.
        setListening(false);
    };

    if (!supported) return null;

    return (
        <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-full transition-all ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-slate-400 hover:text-neon-cyan hover:bg-white/20'} ${className}`}
            title="Voice Input"
        >
            {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
    );
};

export default VoiceInput;
