const jwt = require('jsonwebtoken');
const SECRET = 'jsalk2342k3j4lkjdl2jrddl2jk3kj32';

module.exports = {
  issuer(payload, expiresIn) {
    return jwt.sign(payload, SECRET, {
      expiresIn
    });
  },
  verify(token) {
    return jwt.verify(token, SECRET);
  }
};
