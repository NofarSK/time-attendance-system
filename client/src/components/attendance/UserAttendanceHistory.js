import React, { useState, useEffect } from 'react';
import { calculateDuration, isValidTimeFormat } from '../../utils/timeUtils';
import { updateAttendanceRecord } from '../../api/attendanceApi';
import '../../styles/UserAttendanceHistory.css';

const UserAttendanceHistory = ({ attendanceData, currentTime, onDataUpdate }) => {
    const [editingRecord, setEditingRecord] = useState(null);
    const [editingValues, setEditingValues] = useState({ checkIn: '', checkOut: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'week', 'month'

    const user = JSON.parse(localStorage.getItem('user')) || { userName: '' };

    useEffect(() => {
        if (attendanceData && attendanceData.length > 0) {
            const userRecords = attendanceData.filter(record => record.userName === user.userName);

            if (filter === 'all') {
                setFilteredData(userRecords);
            } else if (filter === 'week' && currentTime) {
                const oneWeekAgo = new Date(currentTime.year, currentTime.month - 1, currentTime.day);
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                setFilteredData(userRecords.filter(record => {
                    const recordDate = parseRecordDate(record.date);
                    return recordDate >= oneWeekAgo;
                }));
            } else if (filter === 'month' && currentTime) {
                const oneMonthAgo = new Date(currentTime.year, currentTime.month - 1, currentTime.day);
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

                setFilteredData(userRecords.filter(record => {
                    const recordDate = parseRecordDate(record.date);
                    return recordDate >= oneMonthAgo;
                }));
            }
        } else {
            setFilteredData([]);
        }
    }, [attendanceData, filter, user.userName, currentTime]);

    const parseRecordDate = (dateString) => {
        const [day, month, year] = dateString.split('/').map(num => parseInt(num));
        return new Date(year, month - 1, day);
    };

    const startEditing = (record) => {
        setEditingRecord(record.id);
        setEditingValues({
            checkIn: record.checkIn || '',
            checkOut: record.checkOut || ''
        });
        setError('');
    };

    const cancelEditing = () => {
        setEditingRecord(null);
        setEditingValues({ checkIn: '', checkOut: '' });
        setError('');
    };

    const saveEditedRecord = async (recordId) => {
        setIsLoading(true);
        setError('');

        try {
            if (!isValidTimeFormat(editingValues.checkIn)) {
                throw new Error('Check-in time must be in format HH:MM:SS');
            }

            if (editingValues.checkOut && !isValidTimeFormat(editingValues.checkOut)) {
                throw new Error('Check-out time must be in format HH:MM:SS');
            }

            await updateAttendanceRecord(recordId, {
                checkIn: editingValues.checkIn,
                checkOut: editingValues.checkOut || null
            });

            setEditingRecord(null);

            if (onDataUpdate) {
                onDataUpdate();
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditChange = (field, value) => {
        setEditingValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="user-history-container">
            <h3>My Attendance History</h3>

            <div className="filter-controls">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Time
                </button>
                <button
                    className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
                    onClick={() => setFilter('month')}
                >
                    Last Month
                </button>
                <button
                    className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
                    onClick={() => setFilter('week')}
                >
                    Last Week
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {filteredData.length === 0 ? (
                <p>No attendance records found.</p>
            ) : (
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Work Duration</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(record => (
                            <tr key={record.id}>
                                <td>{record.date}</td>
                                <td>
                                    {editingRecord === record.id ? (
                                        <input
                                            type="text"
                                            value={editingValues.checkIn}
                                            onChange={(e) => handleEditChange('checkIn', e.target.value)}
                                            placeholder="HH:MM:SS"
                                            className="edit-input"
                                        />
                                    ) : (
                                        record.checkIn
                                    )}
                                </td>
                                <td>
                                    {editingRecord === record.id ? (
                                        <input
                                            type="text"
                                            value={editingValues.checkOut}
                                            onChange={(e) => handleEditChange('checkOut', e.target.value)}
                                            placeholder="HH:MM:SS"
                                            className="edit-input"
                                        />
                                    ) : (
                                        record.checkOut || 'Not checked out'
                                    )}
                                </td>
                                <td>
                                    {record.checkIn && record.checkOut ?
                                        calculateDuration(record.checkIn, record.checkOut) :
                                        ''}
                                </td>
                                <td>
                                    {editingRecord === record.id ? (
                                        <div className="edit-actions">
                                            <button
                                                className="save-edit-btn"
                                                onClick={() => saveEditedRecord(record.id)}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                className="cancel-edit-btn"
                                                onClick={cancelEditing}
                                                disabled={isLoading}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="edit-btn"
                                            onClick={() => startEditing(record)}
                                        >
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UserAttendanceHistory;