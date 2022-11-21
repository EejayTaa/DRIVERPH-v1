const router = require('express').Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const {check, validationResult} = require('express-validator');


// @route GET api/profile/me
// @desc Get current user profile
// @access Private

router.route('/getMyProfile')
.get(auth, async(req, res) => {
    try{
        const profile = await Profile.findOne({user: req.newUser.id}).populate('user', ['name', 'avatar', 'role']);
        if(!profile){
            return res.status(404).json({msg: 'There is no profile for this user.'});
        }
        res.status(200).json(profile);
    }catch(err){
        console.error(err.message);
        res.status(500).json({ msg: 'Error: Server error' });
    }
});

// @route POST api/profile
// @desc  Create or update profile
// @access Private

router.route('/createProfile')
.post([auth, [
    check('company', 'Company is required.').not().isEmpty(),
    check('location', 'Location is required.').not().isEmpty()
]],async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const {company, location, facebook, twitter, linkedin, instagram } = req.body;

    //Build Profile Object
    const profileFields = {};
    profileFields.user = req.newUser.id;
    if(company) profileFields.company = company;
    if(location) profileFields.location = location;
    
    //Build Social Object
    profileFields.social = {};
    if(facebook) profileFields.social.facebook = facebook;
    if(twitter) profileFields.social.twitter = twitter;
    if(instagram) profileFields.social.instagram = instagram;
    if(linkedin) profileFields.social.linkedin = linkedin;
    try{
        let profile = await Profile.findOne({user: req.newUser.id});
        if(profile){
            profile = await Profile.findOneAndUpdate({ user: req.newUser.id}, {$set: profileFields},{ new: true}, (err) => {
                console.error(err)
                return
            });
            return res.status(201).json(profile);
        }
       profile = new Profile(profileFields);
       await profile.save();
       res.status(201).json(profile);
    }catch(err){
        console.error(err.message);
        res.status(500).json({errors: [{msg: 'Error: Server error'}]  });
    }
 })



module.exports = router;