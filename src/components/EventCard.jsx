import React from 'react';
import { useNavigate } from 'react-router-dom';

// Helper to format Firestore Timestamp to readable string
const formatFirestoreTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'Not specified';
    const date = timestamp.toDate();
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace(',', '');
};

const EventCard = ({ event, currentUser, onJoin, onComplete, onEdit, onDelete, showNotification }) => {
    const navigate = useNavigate();
    const eventTime = event.eventTime ? event.eventTime.toDate() : null;
    const currentTime = new Date();

    const isCompleted = event.status === 'completed' || (eventTime && eventTime < currentTime);
    const hasJoined = currentUser && event.joinedUsers && event.joinedUsers.includes(currentUser.uid);
    const isCreator = currentUser && event.creatorId === currentUser.uid;
    const isAdmin = currentUser && currentUser.email === 'admin7@sportsbuddy.com';

    // Button handlers
    const handleJoinClick = () => {
        if (onJoin) {
            onJoin(event.id, hasJoined);
        } else {
            console.warn("onJoin handler not provided.");
            if (showNotification) showNotification("Join not available.", "info");
        }
    };

    const handleCompleteClick = () => {
        if (onComplete) {
            onComplete(event.id, event.creatorId);
        } else {
            console.warn("onComplete handler not provided.");
            if (showNotification) showNotification("Complete not available.", "info");
        }
    };

    const handleEditClick = () => {
        if (onEdit) {
            onEdit(event.id, event.creatorId);
        } else {
            console.warn("onEdit handler not provided.");
            if (showNotification) showNotification("Edit not available.", "info");
            navigate(`/add-event?editId=${event.id}`);
        }
    };

    const handleDeleteClick = () => {
        if (onDelete) {
            onDelete(event.id);
        } else {
            console.warn("onDelete handler not provided.");
            if (showNotification) showNotification("Delete not available.", "info");
        }
    };

    return (
        <div className={`event-card ${isCompleted ? 'event-completed' : ''}`}>
            <h4 className="event-title">{event.name || 'Event Title'}</h4>
            <p><strong>Sport:</strong> {event.sport || 'Not specified'}</p>
            <p><strong>Location:</strong> {event.location || 'Not specified'}</p>
            <p><strong>Time:</strong> {formatFirestoreTimestamp(event.eventTime)}</p>
            {event.description && <p className="event-description">{event.description}</p>}

            {/* Status tags */}
            {isCompleted ? (
                <p className="completed-tag">**COMPLETED**</p>
            ) : (
                <p className="upcoming-tag">**OPEN**</p>
            )}

            {hasJoined && !isCompleted && (
                <p className="joined-tag">**JOINED**</p>
            )}

            {/* Action buttons */}
            <div className="event-actions-horizontal">
                {/* Join/Leave */}
                {currentUser && !isCreator && !isCompleted && (
                    <button
                        className={`btn-join-event ${hasJoined ? 'btn-leave-event' : ''}`}
                        onClick={handleJoinClick}
                    >
                        {hasJoined ? 'Leave' : 'Join'}
                    </button>
                )}

                {/* Complete */}
                {(isCreator || isAdmin) && !isCompleted && (
                    <button className="btn-complete-event" onClick={handleCompleteClick}>Complete</button>
                )}

                {/* Edit */}
                {(isCreator || isAdmin) && (
                    <button className="btn-edit-event" onClick={handleEditClick}>Edit</button>
                )}

                {/* Delete */}
                {(isCreator || isAdmin) && (
                    <button className="btn-delete-event" onClick={handleDeleteClick}>Delete</button>
                )}
            </div>
        </div>
    );
};

export default EventCard;
