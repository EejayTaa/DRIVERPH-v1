const jwt = require('jsonwebtoken');
const role = require('../role');

require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;

const auth = (req, res, next) => {
  //Get token from header
  const token = req.header('x-auth-token');
  //Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied.' });
  }
  //Verify token
  try {
    const decoded = jwt.verify(token, jwtSecret);
    
    const baseUrl = req.baseUrl + req.route.path;

    if (
      role[decoded.role].find(url => {
        return url == baseUrl;
      })
    ) {
      req.newUser = decoded;
      next();
    } else {
      return res
        .status(401)
        .send(
          'Access Denied: You dont have correct privilege to perform this operation'
        );
    }
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: 'Token is not valid.' });
  }
};

module.exports = auth;
