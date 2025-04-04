const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const timeRoutes = require('./routes/timeRoutes');

const app = express();
const PORT = 5000;

require('dotenv').config();

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/time', timeRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});