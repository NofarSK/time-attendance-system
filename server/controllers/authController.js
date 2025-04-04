const fileStorage = require('../utils/fileStorage');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { userName, password } = req.body;

    try {

        const users = await fileStorage.readFile('users.json');

        const user = users.find(user => user.userName === userName && user.password === password);

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const token = jwt.sign({ userName: user.userName, role: user.role }, process.env.JWT, { expiresIn: '24h' });

        res.status(200).json({
            token,
            user: {
                userName: user.userName,
                role: user.role
            },
            message: 'Login successful'
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }

}

