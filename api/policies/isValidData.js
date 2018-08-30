const Joi = require('joi');
const storeValidation = require('../services/StoreValidation');

module.exports = async function(req, res, next) {

  const arrayRoute = req.url.split('/');
  const route = arrayRoute[1].replace(/[^\w\s]/gi, '');
  const verb = req.method;
  const joiBase = storeValidation[route][verb].schema;

  let isValid = true;

  if( joiBase === undefined ){
    isValid = false;
  }else if( !Object.keys(joiBase).length > 0 ){
    isValid = false;
  }

  if(isValid){
    const schema = Joi.object().keys(joiBase);
    Joi.validate(req.allParams(), schema, (err, value) => {

      if(err){
        return res.badRequest(err.details[0]);
      }else{
        next();
      }

    });
  }else{
    return res.badRequest('Invalid Request');
  }
};
