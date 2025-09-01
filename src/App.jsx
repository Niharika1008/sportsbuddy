// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { auth } from './firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AddEventPage from './pages/AddEventPage';
import AdminDashboard from './pages/AdminDashboard';

import Notification from './components/Notification';

import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const navigate = useNavigate();
    const navRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            showNotification('Logged out successfully!', 'success');
            navigate('/login');
            if (navRef.current.classList.contains('active')) {
                navRef.current.classList.remove('active');
            }
        } catch (error) {
            showNotification(`Logout failed: ${error.message}`, 'error');
        }
    };

    const handleNavLinkClick = () => {
        if (navRef.current.classList.contains('active')) {
            navRef.current.classList.remove('active');
        }
    };

    const isAdmin = user?.email === 'admin7@sportsbuddy.com';

    if (loadingAuth) {
        return <div className="loading-screen flex-center">Loading authentication...</div>;
    }

    return (
        <div className="app-container">
            <header className="main-header">
                <div className="container">
                    <h1 className="logo"><Link to="/" onClick={handleNavLinkClick}>Sports Buddy</Link></h1>
                    <nav className="main-nav" ref={navRef}>
                        <ul className="nav-list">
                            <li><Link to="/" onClick={handleNavLinkClick}>Home</Link></li>

                            {/* Admin-only routes */}
                            {user && isAdmin && (
                                <>
                                    <li><Link to="/admin" onClick={handleNavLinkClick}>Admin Dashboard</Link></li>
                                    <li><Link to="/add-event" onClick={handleNavLinkClick}>Add Event</Link></li>
                                </>
                            )}

                            {/* User-only routes */}
                            {user && !isAdmin && (
                                <>
                                    <li><Link to="/events" onClick={handleNavLinkClick}>Events</Link></li>
                                    
                                    
                                    <li><Link to="/profile" onClick={handleNavLinkClick}>Profile</Link></li>
                                </>
                            )}

                            <li>
                                {user ? (
                                    <button onClick={handleLogout} className="btn btn-primary">Logout</button>
                                ) : (
                                    <Link to="/login" className="btn-auth" onClick={handleNavLinkClick}>Login/Register</Link>
                                )}
                            </li>
                        </ul>
                    </nav>
                    <div className="hamburger-menu" onClick={() => navRef.current.classList.toggle('active')}>
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                    </div>
                </div>
            </header>

            {notification.message && <Notification message={notification.message} type={notification.type} />}

            <main>
                <Routes>
                    <Route path="/" element={<HomePage user={user} />} />
                    <Route path="/login" element={<LoginPage showNotification={showNotification} />} />
                    <Route path="/register" element={<RegisterPage showNotification={showNotification} />} />

                    {/* Protected User Routes */}
                    {user && !isAdmin && (
                        <>
                            <Route path="/events" element={<EventsPage user={user} showNotification={showNotification} />} />
                            <Route path="/profile" element={<ProfilePage user={user} showNotification={showNotification} />} />
                            
                        </>
                    )}

                    {/* Admin Routes */}
                    {user && isAdmin && (
                        <>
                            <Route path="/admin" element={<AdminDashboard user={user} showNotification={showNotification} />} />
                            <Route path="/add-event" element={<AddEventPage user={user} showNotification={showNotification} />} />
                        </>
                    )}

                    {/* Fallback: Redirect any unknown path to Login */}
                    <Route path="*" element={<LoginPage showNotification={showNotification} />} />
                </Routes>
            </main>

            <footer className="main-footer">
                <div className="container">
                    <p>&copy; 2025 Sports Buddy. All rights reserved by NC (https://github.com/Niharika1008).</p>
                </div>
            </footer>
        </div>
    );
}

export default App;
