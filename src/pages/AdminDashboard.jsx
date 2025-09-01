// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import './PageStyles.css';
import './AdminDashboard.css';

const AdminDashboard = ({ showNotification }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state for adding new event
    const [newEvent, setNewEvent] = useState({
        name: '',
        sport: '',
        city: '',
        date: '',
    });

    // Fetch all events from Firestore
    const fetchEvents = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'events'));
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
            showNotification('Failed to load events', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Delete event
    const handleDeleteEvent = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await deleteDoc(doc(db, 'events', eventId));
                showNotification('Event deleted successfully', 'success');
                fetchEvents(); // Refresh after deletion
            } catch (error) {
                console.error('Error deleting event:', error);
                showNotification(`Failed to delete event: ${error.message}`, 'error');
            }
        }
    };

    // Add new event
    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'events'), newEvent);
            showNotification('Event added successfully', 'success');
            setNewEvent({ name: '', sport: '', city: '', date: '' }); // reset form
            fetchEvents(); // Refresh list
        } catch (error) {
            console.error('Error adding event:', error);
            showNotification(`Failed to add event: ${error.message}`, 'error');
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <section className="admin-dashboard-page container">
            <h3>Admin Dashboard</h3>

            {/* --- Add Event Form --- */}
            <div className="admin-section">
                <h4>Add New Event</h4>
                <form onSubmit={handleAddEvent} className="admin-form">
                    <input
                        type="text"
                        placeholder="Event Name"
                        value={newEvent.name}
                        onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Sport"
                        value={newEvent.sport}
                        onChange={(e) => setNewEvent({ ...newEvent, sport: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="City/Location"
                        value={newEvent.city}
                        onChange={(e) => setNewEvent({ ...newEvent, city: e.target.value })}
                        required
                    />
                    <input
                        type="datetime-local"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        required
                    />
                    <button type="submit" className="btn btn-primary">Add Event</button>
                </form>
            </div>

            {/* --- Manage Events --- */}
            <div className="admin-section">
                <h4>Manage Sports Events</h4>
                {loading ? (
                    <p>Loading events...</p>
                ) : events.length === 0 ? (
                    <p>No events found.</p>
                ) : (
                    <ul className="admin-list">
                        {events.map(event => (
                            <li key={event.id}>
                                <strong>{event.name}</strong> - {event.sport} - {event.city} - {event.date}
                                <button
                                    className="btn btn-danger btn-small"
                                    onClick={() => handleDeleteEvent(event.id)}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
};

export default AdminDashboard;
