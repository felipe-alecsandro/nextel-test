module.exports = async function(req, res, next) {

  try {

    if(!req.userRole.indexOf('admin') !== -1){
      next();
    }else{
      res.status(401).json({ error: true, message: 'Access not allowed' });
    }

    return;

  } catch (err) {
    return res.status(401).json({ error: true, message: 'Failed to confirm roles!' });
  }

};
