import React, { useState } from 'react';
import { saveAttendanceRecord, loadAttendanceData } from '../../api/attendanceApi';

const CheckInOut = ({ currentTime, isCheckedIn, isLoading, onAttendanceChange }) => {
    const [error, setError] = useState('');
    const [localLoading, setLocalLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem('user')) || { userName: '' };

    // Helper to format time values with leading zeros
    const formatTimeValue = (value) => {
        return String(value).padStart(2, '0');
    };

    const handleCheckIn = async () => {
        if (!currentTime || isCheckedIn || isLoading || localLoading) {
            return;
        }

        // Format time with proper leading zeros
        const timeFormat = `${formatTimeValue(currentTime.hour)}:${formatTimeValue(currentTime.minute)}:${formatTimeValue(currentTime.seconds)}`;

        const newAttendanceData = {
            id: Date.now(),
            userName: user.userName,
            date: currentTime.date,
            checkIn: timeFormat,
            checkOut: null
        };

        try {
            setLocalLoading(true);
            setError('');
            await saveAttendanceRecord([newAttendanceData]);
            onAttendanceChange(); // Notify parent to refresh data
        } catch (error) {
            console.error('Error checking in:', error);
            setError(error.message || 'Failed to check in');
        } finally {
            setLocalLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (!currentTime || !isCheckedIn || isLoading || localLoading) {
            return;
        }

        const timeFormat = `${formatTimeValue(currentTime.hour)}:${formatTimeValue(currentTime.minute)}:${formatTimeValue(currentTime.seconds)}`;

        try {
            setLocalLoading(true);
            setError('');

            await saveAttendanceRecord([{
                userName: user.userName,
                date: currentTime.date,
                checkOut: timeFormat
            }]);

            onAttendanceChange();
        } catch (error) {
            console.error('Error checking out:', error);
            setError(error.message || 'Failed to check out');
        } finally {
            setLocalLoading(false);
        }
    };

    const isProcessing = isLoading || localLoading;

    return (
        <div className="attendance-controls">
            {error && <div className="error-message">{error}</div>}

            {!isProcessing ? (
                !isCheckedIn ? (
                    <button
                        className="check-btn check-in-btn"
                        onClick={handleCheckIn}
                        disabled={isProcessing || !currentTime}
                    >
                        {!currentTime ? 'Loading time...' : 'Check In'}
                    </button>
                ) : (
                    <button
                        className="check-btn check-out-btn"
                        onClick={handleCheckOut}
                        disabled={isProcessing || !currentTime}
                    >
                        {!currentTime ? 'Loading time...' : 'Check Out'}
                    </button>
                )
            ) : (
                <div className="loading">Processing...</div>
            )}
        </div>
    );
};

export default CheckInOut;