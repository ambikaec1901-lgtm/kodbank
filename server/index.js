import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = 5000;
const JWT_SECRET = 'kodbank_super_secret_key_2026';

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// ─── 1. REGISTER ───────────────────────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
    const { uid, username, password, email, phone, role } = req.body;

    if (!uid || !username || !password || !email || !phone) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    if (role && role !== 'Customer') {
        return res.status(400).json({ error: 'Only Customer role is allowed.' });
    }

    try {
        // Check if uid or username already exists
        const existing = db.prepare('SELECT * FROM KodUser WHERE uid = ? OR username = ?').get(uid, username);
        if (existing) {
            return res.status(409).json({ error: 'UID or username already exists.' });
        }

        // Encrypt password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user with default balance = 100000
        db.prepare(`
      INSERT INTO KodUser (uid, username, password, email, phone, role, balance)
      VALUES (?, ?, ?, ?, ?, ?, 100000)
    `).run(uid, username, hashedPassword, email, phone, role || 'Customer');

        return res.status(201).json({ message: 'Registration successful! Please login.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error during registration.' });
    }
});

// ─── 2. LOGIN ──────────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        // 1. Get data from database
        const user = db.prepare('SELECT * FROM KodUser WHERE username = ?').get(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // 2. Compare password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // 3. Generate JWT — username as Subject, role as Claim, signed with secret key
        const token = jwt.sign(
            { sub: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 4. Store JWT in UserToken table
        db.prepare('INSERT INTO UserToken (username, token) VALUES (?, ?)').run(user.username, token);

        // 5. Send token in cookie
        res.cookie('jwt_token', token, {
            httpOnly: true,
            maxAge: 3600000, // 1 hour
            sameSite: 'lax'
        });

        // 6. Send success response
        return res.status(200).json({ message: 'Login successful!', username: user.username });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error during login.' });
    }
});

// ─── 3. CHECK BALANCE ──────────────────────────────────────────────────────────
app.get('/api/balance', (req, res) => {
    // 1. Get JWT from cookie
    const token = req.cookies.jwt_token;

    if (!token) {
        return res.status(401).json({ error: 'No token found. Please login first.' });
    }

    try {
        // 2. Verify token signature & 3. Check expiry
        const decoded = jwt.verify(token, JWT_SECRET);

        // 4. Extract username from token
        const username = decoded.sub;

        // 5. Fetch balance from KodUser table
        const user = db.prepare('SELECT balance, username FROM KodUser WHERE username = ?').get(username);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // 6. Send balance to client
        return res.status(200).json({ balance: user.balance, username: user.username });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired. Please login again.' });
        }
        return res.status(401).json({ error: 'Invalid token. Please login again.' });
    }
});

// ─── 4. PROFILE ────────────────────────────────────────────────────────────────
app.get('/api/profile', (req, res) => {
    const token = req.cookies.jwt_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = db.prepare('SELECT uid, username, email, phone, role, balance, created_at FROM KodUser WHERE username = ?').get(decoded.sub);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        return res.status(200).json(user);
    } catch (err) {
        if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Session expired.' });
        return res.status(401).json({ error: 'Invalid token.' });
    }
});

// ─── 5. LOGOUT ─────────────────────────────────────────────────────────────────
app.post('/api/logout', (req, res) => {
    res.clearCookie('jwt_token');
    return res.status(200).json({ message: 'Logged out successfully.' });
});

// ─── 5. CHECK AUTH STATUS ──────────────────────────────────────────────────────
app.get('/api/auth/status', (req, res) => {
    const token = req.cookies.jwt_token;
    if (!token) return res.status(401).json({ loggedIn: false });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return res.status(200).json({ loggedIn: true, username: decoded.sub });
    } catch {
        return res.status(401).json({ loggedIn: false });
    }
});

app.listen(PORT, () => {
    console.log(`\n🏦 KodBank Server running at http://localhost:${PORT}`);
    console.log(`   Database: SQLite (bank.db)`);
    console.log(`   JWT Auth: Enabled`);
    console.log(`   CORS:     http://localhost:5173\n`);
});
