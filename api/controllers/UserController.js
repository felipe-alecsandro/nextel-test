/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const redisClient = require('../services/redisClient')();
module.exports = {

  /**
     * `User.create()`
     */
  create: async function (req, res) {

    try {

      var { username, password, role = [] } = req.body;
      password = await UtilService.hashPassword(password);

      if (role.length) {
        role = role.map(obj => obj.id);
      }

      await User.create({ username, password }).fetch().exec( async ( err , userResult ) => {

        if(err){
          res.serverError({error: true, message: err });
        }else{
          await User.addToCollection(userResult.id, 'role', role);
          userResult.password = 'is protected';

          redisClient.hmset('user_' + userResult.id, userResult, (error, reply) => {

            if (error) {
              res.serverError(error.message);
            } else {
              res.ok(userResult);
            }

          });

        }

        return;

      });

    } catch (error) {
      return res.serverError({error: true, message:error.message});
    }

  },

  /**
     * `User.update()`
     */
  update: async function (req, res) {

    try {

      let idUser = req.params.id;
      let { username, password, role = [] } = req.body;
      password = await UtilService.hashPassword(password);

      if (role.length) {
        role = role.map(obj => obj.id);
      }

      await User.update({id: idUser},{ username, password }).fetch().exec( async ( err , userResult ) => {

        if(err){
          res.serverError({error: true, message: err });
        }else{
          userResult = userResult[0];
          await User.replaceCollection(userResult.id, 'role').members(role);
          userResult.password = 'is protected';

          redisClient.hmset('user_' + userResult.id, userResult, (error, reply) => {

            if (error) {
              res.serverError(error.message);
            } else {
              res.ok(userResult);
            }

          });

        }

        return;

      });

    } catch (error) {
      return res.serverError({error: true, message:error.message});
    }

  },

  /**
     * `User.find()`
     */
  pagedList: async function (req, res) {

    try {

      if(req.query.pageNum === undefined && req.query.pageSize === undefined){
        return res.badRequest({error: true, message: 'Must be sent as pageNum and pageSize URL parameter'});
      }

      const { pageNum = 0, pageSize = 10 } = req.query;


      redisClient.hget(`user_pageNum_${pageNum}_pageSize_${pageSize}`, async (error, obj) => {

        if (error || !obj) {

          const users = await User.find()
                    .populate('role')
                    .paginate(+pageNum, +pageSize);

          if (!users) {
            res.notFound({error: true, messege: 'No results found.'});
          }else{

            redisClient.hmset(`user_pageNum_${pageNum}_pageSize_${pageSize}`, users, async (error, reply) => {

              if (error) {
                res.serverError(error.message);
              } else {
                return res.ok(users);
              }

            });
            res.ok(users);
          }

          return;

        }else{
          res.ok(obj);
        }

      });

    } catch (error) {
      return res.serverError({error: true, message:error.message});
    }

  },

  /**
    * `User.findOne()`
    */
  findOne: async function (req, res) {

    try {

      if(req.params.id === undefined){
        return res.badRequest({error: true, message: 'Must be sent a number like a ID'});
      }

      redisClient.hget(`user_${req.params.id}`, async (error, obj) => {

        if (error || !obj) {
          const user = await User.findOne({ id: req.params.id })
                    .populate('role');

          if (!user) {
            res.notFound({error: true, messege: 'No user found'});
          }else{

            redisClient.hmset(`user_${req.params.id}` , user, (error, reply) => {

              if (error) {
                res.serverError(error.message);
              } else {
                res.ok(user);
              }

            });

          }

          return;
        }else{
          res.ok(obj);
        }

      });
    } catch (error) {
      return res.serverError({error: true, message:error.message});
    }

  },

  /**
   * `UserController.login()`
   */
  login: async function (req, res) {

    try {

      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (!user) {
        res.status(401).json({error: true, message:'Authentication failed. Username not found.'});
      }else{
        const matchedPassword = await UtilService.comparePassword(password, user.password);

        if (!matchedPassword) {
          res.status(401).json({error: true, message:'Authentication failed. Invalid password.'});
        }else{
          const token = JWTService.issuer({ user: user.id }, '1 day');
          res.ok({ token: token, username: user.username });
        }

      }

      return;

    } catch (error) {
      return res.serverError({error: true, message:error.message});
    }
  },

  /**
  * `User.delete()`
  */
  delete: async function (req, res) {

    try {
      const user = await User.findOne({ id: req.params.id })
                .populate('role');

      if (user) {
        idRole = user.role.map(obj => obj.id);
        await User.removeFromCollection(user.id, 'role', idRole);
        await User.destroy({ id: user.id });
        redisClient.del(`user_${req.params.id}`);
        res.ok();
      } else {
        res.notFound({error: true, message: 'No user found.'});
      }

      return;

    } catch (error) {
      return res.serverError({error: true, message:error.message});
    }
  },

};

