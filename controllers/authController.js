const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const trimmedUsername = username.trim();

        // Find user
        const user = await User.findOne({ where: { username: trimmedUsername } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check active status
        if (!user.is_active) {
            return res.status(403).json({ error: 'Account is inactive' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();

        const { email, sub: googleId, name } = payload;

        // Find user by googleId or email
        let user = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { googleId },
                    { email }
                ]
            }
        });

        if (!user) {
            // Create new user
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            // Ensure unique username
            let baseUsername = email.split('@')[0];
            let username = baseUsername;
            let counter = 1;
            while (await User.findOne({ where: { username } })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            user = await User.create({
                username,
                email,
                googleId,
                password: hashedPassword,
                role: 'user',
                is_active: true
            });
        } else {
            // Update googleId if missing
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        }

        if (!user.is_active) {
            return res.status(403).json({ error: 'Account is inactive' });
        }

        // Generate token
        const jwtToken = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token: jwtToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ error: 'Google login failed' });
    }
};
