const fileStorage = require('../utils/fileStorage');

exports.saveAttendance = async (req, res) => {
    const { attendanceData } = req.body;

    if (!attendanceData || !Array.isArray(attendanceData)) {
        return res.status(400).json({ message: "Invalid attendance data" });
    }

    try {
        let existingData = [];
        try {
            existingData = await fileStorage.readFile('attendance.json');
        } catch (readError) {
            if (readError.code === 'ENOENT' || readError.message.includes('Unexpected end of JSON input')) {
                existingData = [];
            } else {
                throw readError;
            }
        }

        const newItem = attendanceData[attendanceData.length - 1];

        const existingRecord = existingData.find(
            item => item.userName === newItem.userName &&
                item.date === newItem.date &&
                !item.checkOut
        );

        if (existingRecord && !newItem.checkOut) {
            return res.status(400).json({ message: "Already checked in today" });
        } else if (existingRecord && newItem.checkOut) {
            await fileStorage.updateFile('attendance.json', existingRecord.id, {
                checkOut: newItem.checkOut
            });

            return res.status(200).json({ message: "Check-out recorded successfully" });
        } else {
            await fileStorage.writeFile('attendance.json', newItem);
            return res.status(200).json({ message: "Check-in recorded successfully" });
        }
    }
    catch (error) {
        console.error("Save attendance error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getAttendance = async (req, res) => {
    try {
        const attendanceData = await fileStorage.readFile('attendance.json');
        res.status(200).json(attendanceData);
    } catch (error) {
        if (error.code === 'ENOENT' || error.message.includes('Unexpected end of JSON input')) {
            return res.status(200).json([]);
        }

        console.error('Get attendance error:', error);
        res.status(500).json({ message: 'Failed to retrieve attendance data', error: error.message });
    }
};

exports.updateAttendance = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Attendance ID is required" });
    }

    try {
        const attendanceData = await fileStorage.readFile('attendance.json');
        const recordIndex = attendanceData.findIndex(record => record.id.toString() === id.toString());

        if (recordIndex === -1) {
            return res.status(404).json({ message: "Attendance record not found" });
        }

        const recordToUpdate = attendanceData[recordIndex];

        if (req.user.role !== 'admin' && req.user.userName !== recordToUpdate.userName) {
            return res.status(403).json({ message: "You can only update your own records" });
        }

        const updatedRecord = {
            ...recordToUpdate,
            checkIn: checkIn || recordToUpdate.checkIn,
            checkOut: checkOut || null
        };

        await fileStorage.updateFile('attendance.json', parseInt(id), {
            checkIn: updatedRecord.checkIn,
            checkOut: updatedRecord.checkOut
        });

        res.status(200).json({
            message: "Attendance record updated successfully",
            record: updatedRecord
        });
    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({
            message: "Failed to update attendance record",
            error: error.message
        });
    }
};

exports.deleteAttendance = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Attendance ID is required" });
    }

    try {
        const recordId = parseInt(id);

        await fileStorage.deleteFile('attendance.json', recordId);

        res.status(200).json({
            message: "Attendance record deleted successfully"
        });
    } catch (error) {
        console.error('Delete attendance error:', error);
        res.status(500).json({
            message: "Failed to delete attendance record",
            error: error.message
        });
    }
};