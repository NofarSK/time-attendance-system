import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Clock from './Clock';
import CheckInOut from '../components/attendance/CheckInOut';
import UserAttendanceHistory from '../components/attendance/UserAttendanceHistory';
import AdminDashboard from '../components/admin/AdminDashboard';
import { loadAttendanceData } from '../api/attendanceApi';
import '../styles/Dashboard.css';

const DashboardPage = () => {
    const [currentTime, setCurrentTime] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [userStatus, setUserStatus] = useState({
        isCheckedIn: false,
        checkInTime: null,
        checkOutTime: null
    });
    const [showHistory, setShowHistory] = useState(false);

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user')) || { userName: '' };
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else {
            fetchAttendanceData();
        }
    }, [token, navigate]);

    useEffect(() => {
        if (currentTime && attendanceData.length > 0) {
            updateUserStatus();
        }
    }, [currentTime, attendanceData]);

    const fetchAttendanceData = async () => {
        try {
            setIsLoading(true);
            const data = await loadAttendanceData();
            setAttendanceData(data);
        } catch (error) {
            console.error('Error loading attendance data:', error);
            setError('Failed to load attendance data');
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserStatus = () => {
        // Check if user is already checked in today
        const todayRecord = attendanceData.find(
            item => item.userName === user.userName &&
                item.date === currentTime.date &&
                !item.checkOut
        );

        if (todayRecord) {
            setUserStatus({
                isCheckedIn: true,
                checkInTime: todayRecord.checkIn,
                checkOutTime: null
            });
        } else {
            // Check if already checked out today
            const completedRecord = attendanceData.find(
                item => item.userName === user.userName &&
                    item.date === currentTime.date &&
                    item.checkOut
            );

            if (completedRecord) {
                setUserStatus({
                    isCheckedIn: false,
                    checkInTime: completedRecord.checkIn,
                    checkOutTime: completedRecord.checkOut
                });
            } else {
                // Reset state for a new day
                setUserStatus({
                    isCheckedIn: false,
                    checkInTime: null,
                    checkOutTime: null
                });
            }
        }
    };

    const handleTimeUpdate = (time) => {
        setCurrentTime(time);
    };

    const handleAttendanceChange = () => {
        fetchAttendanceData();
    };

    const toggleHistory = () => {
        setShowHistory(!showHistory);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>Welcome, {user.userName}</h2>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </header>

            <div className="clock-section">
                <Clock onTimeUpdate={handleTimeUpdate} />
            </div>
            {user.role === 'user' && (
                <>
                    <CheckInOut
                        currentTime={currentTime}
                        isCheckedIn={userStatus.isCheckedIn}
                        isLoading={isLoading}
                        onAttendanceChange={handleAttendanceChange}
                    />

                    {error && <div className="error-message">{error}</div>}

                    <div className="history-toggle">
                        <button
                            className="history-btn"
                            onClick={toggleHistory}
                        >
                            {showHistory ? 'Hide Attendance History' : 'Show Attendance History'}
                        </button>
                    </div>

                    {showHistory && (
                        <UserAttendanceHistory
                            attendanceData={attendanceData}
                            currentTime={currentTime}
                            onDataUpdate={fetchAttendanceData}
                        />
                    )}
                </>
            )}
            {user.role === 'admin' && (
                <AdminDashboard
                    attendanceData={attendanceData}
                    onDataUpdate={fetchAttendanceData}
                    isLoading={isLoading}
                    error={error}
                    setError={setError}
                />
            )}
        </div>
    );
};

export default DashboardPage;