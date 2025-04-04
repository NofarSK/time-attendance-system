const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware());

router.post('/save', attendanceController.saveAttendance);
router.get('/', attendanceController.getAttendance);

router.put('/update/:id', attendanceController.updateAttendance);
router.delete('/delete/:id', authMiddleware({ requireAdmin: true }), attendanceController.deleteAttendance);

module.exports = router;