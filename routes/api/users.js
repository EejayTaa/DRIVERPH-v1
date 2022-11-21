const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const auth = require('../../middleware/auth');
const gravatar = require('gravatar');
const _ = require('lodash');

// @route POST api/users/createUser
// @desc Register user
// @access Private

router
  .route('/createUser')
  .post(
    [
      auth,
      [
        check('firstName', 'First name is required.').not().isEmpty(),
        check('lastName', 'Last name is required.').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
          'password',
          'Please enter a valid password with 6 or more characters.'
        ).isLength({ min: 6 }),
        check('role', 'Role is required.').not().isEmpty(),
      ],
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'User already exists' }] });
        }
        const avatar = gravatar.url(req.body.email, {
          s: '200',
        });

      
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const newUser = new User(
          _.pick(req.body, [
            'firstName',
            'lastName',
            'email',
            'password',
            'avatar',
            'role',
          ])
        );
        newUser.password = hashedPassword;
        newUser.firstName = newUser.firstName.charAt(0).toUpperCase() + newUser.firstName.slice(1)
        newUser.lastName = newUser.lastName.charAt(0).toUpperCase() + newUser.lastName.slice(1)
        newUser.avatar = avatar;
        await newUser.save();

        const users = await User.find().populate('User', [
          'firstName',
          'lastName',
          'email',
          'role',
        ]);
        if (!users) {
          return res
            .status(404)
            .json({ errors: [{ msg: 'There is no available users.' }] });
        }
        res.status(201).json(users);
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Error: Server error' });
      }
    }
  );

  // @route GET api/users/getUsers
  // @desc Get all registered users
  // @access Private

router.route('/getUsers')
  .get(auth, async (req, res) => {
    try {
      const users = await User.find().select('-password');
      if (!users) {
        return res.status(404).json({ msg: 'There is no available users.' });
      }

      res.status(200).json(users);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Error: Server error' });
    }
  });

// @route DELETE api/users/deleteUser/:email_address
// @desc DELETE specific user based on email address
// @access Private

router
  .route('/deleteUser/:email_address')
  .delete(auth, async (req, res) => {
    try {
      const user = await User.findOne({ email: req.params.email_address });
      if (!user) {
        return res.status(404).json({ msg: 'User not found.' });
      }
      await User.findOneAndRemove({ email: req.params.email_address }, err => {
        if (err) {
          console.error(err);
          return;
        }
      });

      const users = await User.find().populate();
      res.status(200).json(users);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Error: Server error' });
    }
  });

  // @route PUT api/users/user/:email_address
  // @desc Edit specific user based on email address
  // @access Private
  router
  .route('/updateUser/:email_address')
  .put(
    [
      auth,
      [
        check('firstName', 'First name is required.').not().isEmpty(),
        check('lastName', 'Last name is required.').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
          'password',
          'Please enter a valid password with 6 or more characters.'
        ).isLength({ min: 6 }),
        check('role', 'Role is required.').not().isEmpty(),
      ],
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const user = await User.findOne({ email: req.params.email_address });
        if (!user) {
          return res.status(404).json({ msg: ' User not found.' });
        }
        const avatar = gravatar.url(req.body.email, {
          s: '200',
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        await User.findOneAndUpdate(
          { email: req.params.email_address },
          {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            avatar: avatar,
            role: req.body.role,
          },
          { new: true }, (err) => {
            console.error(err);
            return
          }
        );

        const users = await User.find().populate('User', [
          'firstName',
          'lastName',
          'email',
          'role',
        ]);
        if (!users) {
          return res
            .status(404)
            .json({ errors: [{ msg: 'There is no available users.' }] });
        }
        res.status(201).json(users);
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Error: Server error' });
      }
    }
  );

module.exports = router;
