const bcrypt = require('bcryptjs');
const { User } = require('../models');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const trimmedUsername = username.trim();

        // Check if user exists
        const existingUser = await User.findOne({ where: { username: trimmedUsername } });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username: trimmedUsername,
            password: hashedPassword,
            role: role || 'user'
        });

        res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            role: newUser.role
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, role, is_active } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        if (role) user.role = role;
        if (is_active !== undefined) user.is_active = is_active;

        await user.save();

        res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            is_active: user.is_active
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent deleting self
        if (req.user.id === user.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }

        await user.destroy();
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
