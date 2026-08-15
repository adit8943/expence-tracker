const { validationResult } = require('express-validator');
const User = require('../models/User');
const createToken = require('../utils/token');

const respondWithUser = (res, user, status = 200) => res.status(status).json({
  token: createToken(user._id), user: { id: user._id, name: user.name, email: user.email },
});

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ message: errors.array()[0].msg });
    const { name, email, password } = req.body;
    if (await User.exists({ email })) return res.status(409).json({ message: 'An account with this email already exists.' });
    respondWithUser(res, await User.create({ name, email, password }), 201);
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Incorrect email or password.' });
    respondWithUser(res, user);
  } catch (error) { next(error); }
};

exports.me = (req, res) => res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (email && email !== req.user.email && await User.exists({ email })) return res.status(409).json({ message: 'Email is already in use.' });
    req.user.name = name || req.user.name;
    req.user.email = email || req.user.email;
    await req.user.save();
    exports.me(req, res);
  } catch (error) { next(error); }
};
