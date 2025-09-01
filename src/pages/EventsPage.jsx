import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../firebase/firebaseConfig';
import {
    collection,
    query,
    orderBy,
    getDocs,
    updateDoc,
    arrayUnion,
    arrayRemove,
    doc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import EventCard from '../components/EventCard';
import './PageStyles.css';

const EventsPage = ({ showNotification }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const q = query(collection(db, 'events'), orderBy('eventTime', 'asc'));
            const querySnapshot = await getDocs(q);
            const eventsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // only upcoming events
            const now = new Date();
            const upcoming = eventsData.filter(event =>
                event.eventTime && event.eventTime.toDate() > now
            );

            setEvents(upcoming);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events.');
            if (showNotification) showNotification('Failed to load events.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleJoinEvent = async (eventId, hasJoined) => {
        if (!currentUser) {
            showNotification('You must be logged in to join an event.', 'error');
            return;
        }

        try {
            const ref = doc(db, 'events', eventId);
            if (hasJoined) {
                await updateDoc(ref, { joinedUsers: arrayRemove(currentUser.uid) });
                showNotification('You have left the event.', 'info');
            } else {
                await updateDoc(ref, { joinedUsers: arrayUnion(currentUser.uid) });
                showNotification('You have joined the event!', 'success');
            }
            fetchEvents();
        } catch (error) {
            console.error('Join/Leave error:', error);
            showNotification(`Failed: ${error.message}`, 'error');
        }
    };

    if (loading) return <div className="loading-state flex-center">Loading events...</div>;
    if (error) return <div className="error-state flex-center">{error}</div>;

    return (
        <section className="events-page container">
            <h3>Upcoming Sports Events</h3>
            {events.length === 0 ? (
                <p className="no-data-message">No upcoming events.</p>
            ) : (
                <div className="grid-container">
                    {events.map(event => (
                        <EventCard
                            key={event.id}
                            event={event}
                            currentUser={currentUser}
                            onJoin={handleJoinEvent} 
                            showNotification={showNotification}
                            hideAdminControls={true}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default EventsPage;
