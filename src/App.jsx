import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useContext } from 'react';
import { HelmetProvider } from 'react-helmet-async';

// Placeholder Pages (we will create these next)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Mistakes from './pages/Mistakes';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

import Navbar from './components/Navbar';

// Placeholder Import for new pages (will create next)
import Translator from './pages/Translator';
import Interview from './pages/Interview';
import RoleplayHub from './pages/RoleplayHub';
import RoleplaySession from './pages/RoleplaySession';
import History from './pages/History';

function App() {
    return (
        <HelmetProvider>
            <AuthProvider>
                <ThemeProvider>
                    <Router>
                        <div className="min-h-screen bg-deep-void text-text-main font-sans selection:bg-neon-cyan/30 transition-colors duration-300">
                            <Navbar />
                            <div className="pt-20 pb-10"> {/* Add padding for fixed navbar */}
                                <Routes>
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                                    <Route path="/translator" element={<PrivateRoute><Translator /></PrivateRoute>} />
                                    <Route path="/interview" element={<PrivateRoute><Interview /></PrivateRoute>} />
                                    <Route path="/roleplay" element={<PrivateRoute><RoleplayHub /></PrivateRoute>} />
                                    <Route path="/roleplay/:id" element={<PrivateRoute><RoleplaySession /></PrivateRoute>} />
                                    <Route path="/mistakes" element={<PrivateRoute><Mistakes /></PrivateRoute>} />
                                    <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
                                </Routes>

                                <div className="mt-10 text-center text-slate-500 text-sm font-medium opacity-50 hover:opacity-100 transition-opacity">
                                    Designed & Developed by <span className="text-neon-cyan">Harish Singh</span>
                                </div>
                            </div>
                        </div>
                    </Router>
                </ThemeProvider>
            </AuthProvider>
        </HelmetProvider>
    );
}

export default App;
