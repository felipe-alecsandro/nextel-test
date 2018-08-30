/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  // '*': true,
  SuperheroController: {
    'pagedList': ['isLoggedIn'],                 //1
    'create': ['isLoggedIn','onlyForAdmin','isValidData'],      //2
    'update': ['isLoggedIn','onlyForAdmin','isValidData'],      //3
    'delete': ['isLoggedIn','onlyForAdmin','isValidData'],      //4
    'findOne': ['isLoggedIn','isValidData']                     //5
  },

  SuperPowerController: {
    'pagedList': ['isLoggedIn'],                  //6
    'create': ['isLoggedIn','onlyForAdmin','isValidData'],      //7
    'update': ['isLoggedIn','onlyForAdmin','isValidData'],      //8
    'delete' : ['isLoggedIn','onlyForAdmin','isValidData'],     //9
    'findOne': ['isLoggedIn','isValidData']                     //10
  },

  UserController: {
    'pagedList': ['isLoggedIn','onlyForAdmin'],   //11
    'create': ['isLoggedIn','onlyForAdmin','isValidData'],      //12
    'update': ['isLoggedIn','onlyForAdmin','isValidData'],      //13
    'delete': ['isLoggedIn','onlyForAdmin','isValidData'],      //14
    'findOne': ['isLoggedIn','onlyForAdmin','isValidData'],   
    'login': ['isValidData']                                    //15
  },
};
