const router = require('express').Router();

const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;


// @route GET api/auth
// @desc Get authenticated user
// @access Private

router
  .route('/')
  .get(auth, async (req, res) => {
    try {
      const user = await User.findById(req.newUser.id).select('-password');
      if (!user) {
        return res
          .status(404)
          .json({ msg: 'There is no available users.' });
      }

      res.status(200).json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Error: Server error' });
    }
  })

  // @route POST api/auth
  // @desc  Authenticate user and get token
  // @access Public

  .post(
    [
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Password is required.').exists(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;

      try {
        let user = await User.findOne({ email: email });
        if (!user) {
          return res
            .status(404)
            .json({ errors: [{ msg: 'Invalid credentials.' }] });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res
            .status(404)
            .json({ errors: [{ msg: 'Invalid credentials' }] });
        }
        const token = jwt.sign(
          { id: user.id, role: user.role },
          jwtSecret
        );
        res.status(200).json({ token: token });
      } catch (err) {
        console.error(err.message);
        res.status(500).json({errors: [{msg: 'Error: Server error'}]  });
      }
    }
  );

module.exports = router;
