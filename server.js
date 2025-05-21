const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins (restrict in production)
    methods: ['GET', 'POST'],
}));
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
    user: 'postgres', // Replace with your PostgreSQL user
    host: 'localhost',
    database: 'flutter_auth', // Replace with your database name
    password: '2003', // Replace with your password
    port: 5432,
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    console.log('Login request received:', req.body); // Log incoming request
    const { email, password } = req.body;

    try {
        // Query user by email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        console.log('User found:', user); // Log user data

        if (!user) {
            console.log('No user found for email:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isValid); // Log password verification

        if (!isValid) {
            console.log('Invalid password for email:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            'your_jwt_secret', // Replace with your secret key
            { expiresIn: '1h' }
        );
        console.log('Token generated for user:', email); // Log token creation

        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Server error:', err); // Log server errors
        res.status(500).json({ error: 'Server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});