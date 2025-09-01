// src/pages/AddEventPage.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import './PageStyles.css';

const AddEventPage = ({ user, showNotification }) => {
  const [eventName, setEventName] = useState('');
  const [sport, setSport] = useState('');
  const [location, setLocation] = useState('');
  const [eventDateTime, setEventDateTime] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  const navigate = useNavigate();
  const locationHook = useLocation();
  const isEditMode = locationHook.search.includes('editId');
  const editEventId = new URLSearchParams(locationHook.search).get('editId');

  // Restrict access → only admins should use this page
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      showNotification('Access denied. Admins only.', 'error');
      navigate('/events'); // redirect users
    }
  }, [user, navigate, showNotification]);

  // Fetch categories + cities
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        setCategories(categoriesSnapshot.docs.map((doc) => doc.data().name));

        const citiesSnapshot = await getDocs(collection(db, 'cities'));
        setCities(citiesSnapshot.docs.map((doc) => doc.data().name));
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        showNotification('Failed to load sports categories or cities.', 'error');
      }
    };

    fetchDropdownData();
  }, [showNotification]);

  // If edit mode, load event data
  useEffect(() => {
    const fetchEventForEdit = async () => {
      if (isEditMode && editEventId) {
        setLoading(true);
        try {
          const eventRef = doc(db, 'events', editEventId);
          const eventSnap = await getDoc(eventRef);
          if (eventSnap.exists()) {
            const eventData = eventSnap.data();
            setEventName(eventData.name || '');
            setSport(eventData.sport || '');
            setLocation(eventData.location || '');
            setDescription(eventData.description || '');

            if (eventData.eventTime?.toDate) {
              const date = eventData.eventTime.toDate();
              const formatted = `${date.getFullYear()}-${String(
                date.getMonth() + 1
              ).padStart(2, '0')}-${String(date.getDate()).padStart(
                2,
                '0'
              )}T${String(date.getHours()).padStart(2, '0')}:${String(
                date.getMinutes()
              ).padStart(2, '0')}`;
              setEventDateTime(formatted);
            }
          } else {
            showNotification('Event not found for editing.', 'error');
            navigate('/events');
          }
        } catch (error) {
          console.error('Error fetching event for edit:', error);
          showNotification('Failed to load event details for editing.', 'error');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEventForEdit();
  }, [isEditMode, editEventId, navigate, showNotification]);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventName || !sport || !location || !eventDateTime) {
      showNotification(
        'Please fill in all required fields: Event Name, Sport, Location, and Date & Time.',
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        name: eventName,
        sport,
        location,
        eventTime: new Date(eventDateTime),
        description,
        creatorId: user.uid,
        creatorEmail: user.email,
        status: 'upcoming',
        joinedUsers: [],
      };

      if (isEditMode && editEventId) {
        await updateDoc(doc(db, 'events', editEventId), eventData);
        showNotification('Event updated successfully!', 'success');
      } else {
        await addDoc(collection(db, 'events'), {
          ...eventData,
          createdAt: serverTimestamp(),
        });
        showNotification('Event added successfully!', 'success');
      }

      setEventName('');
      setSport('');
      setLocation('');
      setEventDateTime('');
      setDescription('');

      navigate('/admin'); // redirect back to admin dashboard
    } catch (error) {
      console.error('Error adding/updating event:', error);
      showNotification(
        `Failed to ${isEditMode ? 'update' : 'add'} event: ${error.message}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="add-event-page container">
      <h3>{isEditMode ? 'Edit Sports Event' : 'Add New Sports Event'}</h3>
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="eventName">Event Name:</label>
          <input
            type="text"
            id="eventName"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="sport">Sport:</label>
          <input
            type="text"
            id="sport"
            list="sports-categories"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            required
          />
          <datalist id="sports-categories">
            {categories.map((cat, index) => (
              <option key={index} value={cat} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            list="cities-list"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <datalist id="cities-list">
            {cities.map((city, index) => (
              <option key={index} value={city} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="eventDateTime">Date & Time:</label>
          <input
            type="datetime-local"
            id="eventDateTime"
            value={eventDateTime}
            onChange={(e) => setEventDateTime(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional):</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading
            ? isEditMode
              ? 'Updating...'
              : 'Adding...'
            : isEditMode
            ? 'Update Event'
            : 'Add Event'}
        </button>
      </form>
    </section>
  );
};

export default AddEventPage;
