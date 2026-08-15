const router = require('express').Router();
const { body } = require('express-validator');
const protect = require('../middleware/auth');
const controller = require('../controllers/authController');
router.post('/register', [body('name').trim().isLength({ min: 2 }).withMessage('Name must have at least 2 characters.'), body('email').isEmail().withMessage('Enter a valid email.'), body('password').isLength({ min: 6 }).withMessage('Password must have at least 6 characters.')], controller.register);
router.post('/login', controller.login);
router.get('/me', protect, controller.me);
router.patch('/me', protect, controller.updateProfile);
module.exports = router;
