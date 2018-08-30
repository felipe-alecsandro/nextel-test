module.exports = async function(req, res, next) {

  if( req.hasOwnProperty('headers') && req.headers.hasOwnProperty('authorization') ) {

    try {

      const tokenParam = req.headers['authorization'];
      const decodedToken = JWTService.verify(tokenParam);

      const user = await User.findOne({ id: decodedToken.user }).populate('role');

      if (!user) {
        res.status(401).json({ error: true, message: 'Invalid credentials provided!' });
      }else{

        if(user.role === undefined){
          res.status(401).json({ error: true, message: 'Invalid roles!' });
        }else{
          req.userRole = user.role.map(nameRole => nameRole.name);
          req.username = user.username;
          next();
        }

      }

      return;

    } catch (err) {
      return res.status(401).json({ error: true, message: 'Failed to authenticate token!' });
    }

  } else {
    res.status(401).json({ error: true, message: 'Authorization header is missing'});
  }

  return;

};
