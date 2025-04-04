import React, { useState } from 'react';
import { updateAttendanceRecord, deleteAttendanceRecord } from '../../api/attendanceApi';
import { calculateDuration } from '../../utils/timeUtils';
import '../../styles/AdminDashboard.css';

const AdminDashboard = ({ attendanceData, onDataUpdate, isLoading, error, setError }) => {
    const [editingRecord, setEditingRecord] = useState(null);
    const [editingValues, setEditingValues] = useState({ checkIn: '', checkOut: '' });
    const [localLoading, setLocalLoading] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);

    // Start editing a record
    const startEditing = (record) => {
        setEditingRecord(record.id);
        setEditingValues({
            checkIn: record.checkIn || '',
            checkOut: record.checkOut || ''
        });
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingRecord(null);
        setEditingValues({ checkIn: '', checkOut: '' });
        setError('');
    };

    // Save edited record
    const saveEditedRecord = async (recordId) => {
        setLocalLoading(true);
        setError('');

        try {
            // Validate time format
            const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
            if (!timePattern.test(editingValues.checkIn)) {
                throw new Error('Check-in time must be in format HH:MM:SS');
            }

            if (editingValues.checkOut && !timePattern.test(editingValues.checkOut)) {
                throw new Error('Check-out time must be in format HH:MM:SS');
            }

            await updateAttendanceRecord(recordId, {
                checkIn: editingValues.checkIn,
                checkOut: editingValues.checkOut || null
            });

            // Exit edit mode
            setEditingRecord(null);

            // Refresh data
            onDataUpdate();
        } catch (error) {
            setError(error.message);
        } finally {
            setLocalLoading(false);
        }
    };

    // Handle input changes while editing
    const handleEditChange = (field, value) => {
        setEditingValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Show delete confirmation
    const showDeleteConfirmation = (recordId) => {
        setDeleteConfirmation(recordId);
    };

    // Cancel delete
    const cancelDelete = () => {
        setDeleteConfirmation(null);
    };

    // Confirm and perform delete
    const confirmDelete = async (recordId) => {
        setLocalLoading(true);
        setError('');

        try {
            await deleteAttendanceRecord(recordId);

            // Clear delete confirmation
            setDeleteConfirmation(null);

            // Refresh data
            onDataUpdate();
        } catch (error) {
            setError(error.message);
        } finally {
            setLocalLoading(false);
        }
    };

    if (!attendanceData || attendanceData.length === 0) {
        return (
            <div className="admin-section">
                <h3>Admin Dashboard</h3>
                <p>No attendance records found.</p>
            </div>
        );
    }

    return (
        <div className="admin-section">
            <h3>Admin Dashboard</h3>
            <p>As an administrator, you can view, edit, and delete attendance records.</p>

            <div className="attendance-records">
                <h3>All Employee Attendance Records</h3>
                {error && <div className="error-message">{error}</div>}
                <table className="records-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Date</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Work Duration</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceData.map(record => (
                            <tr key={record.id}>
                                <td>{record.userName}</td>
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
                                    {deleteConfirmation === record.id ? (
                                        <div className="delete-confirmation">
                                            <span>Are you sure?</span>
                                            <div className="confirmation-buttons">
                                                <button
                                                    className="confirm-delete-btn"
                                                    onClick={() => confirmDelete(record.id)}
                                                    disabled={isLoading || localLoading}
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    className="cancel-delete-btn"
                                                    onClick={cancelDelete}
                                                    disabled={isLoading || localLoading}
                                                >
                                                    No
                                                </button>
                                            </div>
                                        </div>
                                    ) : editingRecord === record.id ? (
                                        <div className="edit-actions">
                                            <button
                                                className="save-edit-btn"
                                                onClick={() => saveEditedRecord(record.id)}
                                                disabled={isLoading || localLoading}
                                            >
                                                {isLoading || localLoading ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                className="cancel-edit-btn"
                                                onClick={cancelEditing}
                                                disabled={isLoading || localLoading}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="record-actions">
                                            <button
                                                className="edit-btn"
                                                onClick={() => startEditing(record)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => showDeleteConfirmation(record.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;