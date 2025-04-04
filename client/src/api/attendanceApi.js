const CACHE_EXPIRY = 5000;
let cachedAttendanceData = null;
let lastFetched = 0;


export const loadAttendanceData = async (forceRefresh = false) => {
    // Check if we have fresh cached data and not forcing refresh
    const now = Date.now();
    if (!forceRefresh && cachedAttendanceData && (now - lastFetched < CACHE_EXPIRY)) {
        return cachedAttendanceData;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch('http://localhost:5000/api/attendance', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            // This prevents browser caching
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data = await response.json();

        // Update cache
        cachedAttendanceData = data;
        lastFetched = now;

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error(error.message);
    }
};



export const saveAttendanceRecord = async (recordData) => {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch('http://localhost:5000/api/attendance/save', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ attendanceData: recordData })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        // Invalidate cache after successful save
        cachedAttendanceData = null;

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw new Error(error.message);
    }
};



export const updateAttendanceRecord = async (recordId, updateData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required');
        }

        if (cachedAttendanceData) {
            const recordIndex = cachedAttendanceData.findIndex(record => record.id === recordId);
            if (recordIndex !== -1) {
                const updatedCache = [...cachedAttendanceData];
                updatedCache[recordIndex] = {
                    ...updatedCache[recordIndex],
                    ...updateData
                };
                cachedAttendanceData = updatedCache;
            }
        }

        const response = await fetch(`http://localhost:5000/api/attendance/update/${recordId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            // Invalidate cache on error to force a fresh fetch
            cachedAttendanceData = null;

            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const updatedRecord = await response.json();

        // Update the cache with the server response
        if (cachedAttendanceData) {
            const recordIndex = cachedAttendanceData.findIndex(record => record.id === recordId);
            if (recordIndex !== -1) {
                const updatedCache = [...cachedAttendanceData];
                updatedCache[recordIndex] = {
                    ...updatedCache[recordIndex],
                    ...updatedRecord.record
                };
                cachedAttendanceData = updatedCache;
            }
        }

        return updatedRecord;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error(error.message);
    }
};


export const deleteAttendanceRecord = async (recordId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required');
        }

        if (cachedAttendanceData) {
            cachedAttendanceData = cachedAttendanceData.filter(record => record.id !== recordId);
        }

        const response = await fetch(`http://localhost:5000/api/attendance/delete/${recordId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Invalidate cache on error to force a fresh fetch
            cachedAttendanceData = null;

            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        // Cache is already updated with optimistic delete, no need to update again
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw new Error(error.message);
    }
};