const router = require('express').Router();
const Driver = require('../../models/Driver');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route POST api/createDriver
// @desc  Create drivers
// @access Private

router
  .route('/createDriver')
  .post(
    [
      auth,
      [
        check('first_name', 'First name is required.').not().isEmpty().matches(/^[A-Za-z,-]+$/).withMessage('First name should contain letters only.').isLength({min: 2,max:100}).withMessage('First name length is invalid.'),
        check('middle_name', 'Middle name is required.').not().isEmpty().matches(/^[A-Za-z,-]+$/).withMessage('Middle name should contain letters only.'),
        check('last_name', 'Last name is required.').not().isEmpty().matches(/^[A-Za-z,-]+$/).withMessage('Last name should contain letters only.').isLength({min: 2,max:100}).withMessage('Last name length is invalid.'),
        check('age', 'Age is required.').not().isEmpty().isInt({min: 18, max: 70}).withMessage('Age should not be greater than 70 years old.'),
        check('company', 'Company is required.').not().isEmpty(),
      ],
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      try {
        const {first_name, middle_name, last_name, age, company} = req.body;
        const driver = new Driver({
      
          first_name: first_name.charAt(0).toUpperCase() + first_name.slice(1),
          middle_name: middle_name.charAt(0).toUpperCase() + middle_name.slice(1),
          last_name: last_name.charAt(0).toUpperCase() + last_name.slice(1),
          age: age,
          company: company.charAt(0).toUpperCase() + company.slice(1),
        });

        await driver.save();
        const drivers = await Driver.find().populate();
        res.status(201).json(drivers);
      } catch (err) {
        console.error(err.message);
        res.status(500).json({errors: [{msg: 'Error: Server error'}]  });
      }
    }
  )

  // @route GET api/drivers/getDriver
  // @desc  Get all drivers
  // @access Private

  router.route('/getDrivers')
  .get(auth, async (req, res) => {
    try {
      const drivers = await Driver.find().populate();

      if (!drivers) {
        return res.status(404).json({ msg: 'There is no drivers available.' });
      }
      res.status(200).json(drivers);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Error: Server error' });
    }
  });

  // @route DELETE api/drivers/driver/:driver_id
  // @desc  Delete driver by driver id
  // @access Private
  
  router
  .route('/deleteDriver/:driver_id')
  .delete(auth, async (req, res) => {
    try {
      if (req.params.driver_id.match(/^[0-9a-fA-F]{24}$/)) {
        const driverToDelete = await Driver.findOneAndRemove({
          _id: req.params.driver_id,
        });

        if (!driverToDelete) {
          return res.status(404).json({ msg: 'Driver not found.' });
        }

        const drivers = await Driver.find().populate();
        res.status(200).json(drivers);
      } else {
        return res.status(400).json({
          msg: 'Invalid driver id. ',
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Error: Server error' });
    }
  });

  // @route PUT api/drivers/updateDriver:driver_id
  // @desc  Update driver by driver id
  // @access Private

  router
  .route('/updateDriver/:driver_id')
  .put(
    [
      auth,
      [
        check('first_name', 'First name is required.').not().isEmpty().matches(/^[A-Za-z,-]+$/).withMessage('First name should contain letters only.').isLength({min: 2,max:100}).withMessage('First name length is invalid.'),
        check('last_name', 'Last name is required.').not().isEmpty().matches(/^[A-Za-z,-]+$/).withMessage('Last name should contain letters only.').isLength({min: 2,max:100}).withMessage('Last name length is invalid.'),
        check('age', 'Age is required.').not().isEmpty().isInt({min: 18, max: 70}).withMessage('Age should not be greater than 70 years old.'),
        check('company', 'Company is required.').not().isEmpty(),
      ],
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      try {
        if (req.params.driver_id.match(/^[0-9a-fA-F]{24}$/)) {
          const driverToUpdate = await Driver.findOneAndUpdate(
            { _id: req.params.driver_id },
            {
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              age: req.body.age,
              company: req.body.company,
            },
            { new: true },
            err => {
              console.error(err);
              return;
            }
          );
          if (!driverToUpdate) {
            return res.status(404).json({errors: [{ msg: 'Driver not found.'}] });
          }

          const drivers = await Driver.find().populate();
          res.status(201).json(drivers);
        } else {
          return res.status(400).json({
            errors: [{msg: 'Invalid driver id. '}],
          });
        }
      } catch (err) {
        console.error(err.message);
        res.status(500).json({errors: [{msg: 'Error: Server error'}]  });
      }
    }
  );

module.exports = router;
