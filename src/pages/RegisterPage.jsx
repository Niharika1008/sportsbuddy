// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import './PageStyles.css'; // General page styling

const RegisterPage = ({ showNotification }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // default role
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: username });

            await setDoc(doc(db, 'users', user.uid), {
                username: username,
                email: email,
                role: role, // Store role
                createdAt: serverTimestamp(),
                sportsInterest: [],
                abilityLevel: '',
                location: ''
            });

            showNotification('Registered successfully! Please login.', 'success');
            console.log('User registered with role:', role);
            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error);
            showNotification(`Registration failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auth-page flex-center">
            <div className="auth-form">
                <h3>Register</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="auth-switch-text">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </section>
    );
};

export default RegisterPage;
