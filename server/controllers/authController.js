const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register new user
exports.register = async (req, res) => {
  const { username, email, password } = req.body; // include email

  try {
    // let Mongoose handle password hashing
    const user = await User.create({ username, email, password });
    res.json({ message: 'User created', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Wrong password' });

    const token = jwt.sign({ id: user._id }, 'secret'); // replace 'secret' later
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
