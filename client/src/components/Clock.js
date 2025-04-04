import React, { useState, useEffect, useRef } from 'react';
import '../styles/Clock.css';

const Clock = ({ onTimeUpdate }) => {
    const [displayTime, setDisplayTime] = useState(null);
    const [status, setStatus] = useState('connecting');

    const eventSourceRef = useRef(null);

    useEffect(() => {
        const cleanup = () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };

        const connectTimeStream = () => {
            cleanup();
            setStatus('connecting');

            const eventSource = new EventSource('http://localhost:5000/api/time/stream');
            eventSourceRef.current = eventSource;

            eventSource.onmessage = (event) => {
                try {
                    const serverData = JSON.parse(event.data);
                    setStatus('connected');
                    updateTimeDisplay(serverData);
                } catch (error) {
                    console.error('Error processing time data:', error);
                }
            };

            eventSource.onopen = () => {
                setStatus('connected');
            };

            eventSource.onerror = (error) => {
                console.error('SSE connection error:', error);
                setStatus('error');
                cleanup();
            };
        };

        connectTimeStream();
        return cleanup;
    }, []);

    // Update the display time using server data
    const updateTimeDisplay = (serverData) => {
        if (!serverData) return;

        const timeData = {
            year: serverData.year,
            month: serverData.month,
            day: serverData.day,
            hour: serverData.hour,
            minute: serverData.minute,
            seconds: serverData.seconds,
            dayOfWeek: getDayOfWeek(serverData.year, serverData.month, serverData.day),
            date: formatDateString(serverData.day, serverData.month, serverData.year)
        };

        setDisplayTime(timeData);

        if (onTimeUpdate) {
            onTimeUpdate(timeData);
        }
    };

    const getDayOfWeek = (year, month, day) => {
        const date = new Date(year, month - 1, day);
        return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
    };

    const formatDateString = (day, month, year) => {
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    };

    const formatTime = (time) => String(time).padStart(2, '0');

    if (!displayTime) {
        return (
            <div className="clock-container">
                <div className="loading-clock">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">Connecting to time server...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="clock-container">
            <div className="clock-display">
                <div className="clock-time">
                    {formatTime(displayTime.hour)}:
                    {formatTime(displayTime.minute)}:
                    {formatTime(displayTime.seconds)}
                </div>
                <div className="clock-date">
                    {displayTime.dayOfWeek}, {displayTime.date}
                </div>
                {status === 'connecting' && (
                    <div className="clock-status syncing">
                        Connecting...
                    </div>
                )}
                {status === 'error' && (
                    <div className="clock-status error">
                        Connection error. Server unavailable.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Clock;