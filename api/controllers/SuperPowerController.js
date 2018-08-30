/**
 * SuperPowerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const redisClient = require('../services/redisClient')();
module.exports = {

  /**
     * `SuperPowerController.create()`
     */
  create: async function (req, res) {

    try {

      var { name, description } = req.body;

      await SuperPower.create({ name, description }).fetch().exec(async (err, resultSuperPower) => {

        if (err) {
          res.serverError({ error: true, message: err });
        } else {

          const auditEvent = await AuditEventFactore.saveAndPublisher('SuperPower', resultSuperPower.id, req.username, 'CREATE');

          if (auditEvent.error) {
            res.serverError(auditEvent);
          } else {

            redisClient.hmset('superpower' + resultSuperPower.id, resultSuperPower, (error, reply) => {

              if (error) {
                res.serverError(error.message);
              } else {
                res.ok(resultSuperPower);
              }

            });

          }

        }

        return;

      });

    } catch (error) {
      return res.serverError({ error: true, message: error.message });
    }
  },

  update: async function (req, res) {

    try {

      let idSuperPower = req.params.id;
      let { name, description } = req.body;

      await SuperPower.update({ id: idSuperPower }, { name, description }).fetch().exec(async (err, resultSuperPower) => {

        if (err) {
          res.serverError({ error: true, message: err });
        } else {
          resultSuperPower = resultSuperPower[0];
          const auditEvent = await AuditEventFactore.saveAndPublisher('SuperPower', resultSuperPower.id, req.username, 'UPDATE');

          if (auditEvent.error) {
            res.serverError(auditEvent);
          } else {

            redisClient.hmset('superpower_' + resultSuperPower.id, resultSuperPower, (error, reply) => {

              if (error) {
                res.serverError(error.message);
              } else {
                res.ok(resultSuperPower);
              }

            });

          }

        }

        return;

      });

    } catch (error) {
      return res.serverError({ error: true, message: error.message });
    }
  },

  /**
     * `SuperPowerController.pagedList()`
     */
  pagedList: async function (req, res) {

    try {

      if (req.query.pageNum === undefined && req.query.pageSize === undefined) {
        return res.badRequest({ error: true, message: 'Must be sent as pageNum and pageSize URL parameter' });
      }

      const { pageNum = 0, pageSize = 10 } = req.query;

      redisClient.hget(`superpower_pageNum_${pageNum}_pageSize_${pageSize}`, async (error, obj) => {

        if (error || !obj) {
          const superPowers = await SuperPower.find()
                        .paginate(+pageNum, +pageSize);

          if (!superPowers) {
            res.notFound({ error: true, message: 'No superpower was found.' });
          } else {
            redisClient.hmset(`superpower_pageNum_${pageNum}_pageSize_${pageSize}` , superPowers, (error, reply) => {

              if (error) {
                res.serverError(error.message);
              } else {
                res.ok(superPowers);
              }

            });
          }

          return;

        } else {
          return res.ok(obj);
        }

      });

    } catch (error) {
      return res.serverError({ error: true, message: error.message });
    }

  },

  /**
    * `SuperPowerController.findOne()`
    */
  findOne: async function (req, res) {

    if (req.params.id === undefined) {
      return res.badRequest({ error: true, message: 'Must be sent a number like a ID' });
    }

    try {

      redisClient.hget(`superpower_${req.params.id}`, async (error, obj) => {

        if (error || !obj) {
          const superPower = await SuperPower.findOne({
            id: req.params.id
          });

          if (!superPower) {
            res.notFound({ error: true, message: 'No superpower was found.' });
          } else {

            redisClient.hmset(`superpower_${req.params.id}`, superPower, (error, reply) => {

              if (error) {
                res.serverError(error.message);
              } else {
                res.ok(superPower);
              }

            });

          }

          return;
        }else{
          return res.ok(obj);
        }

      });

    } catch (error) {
      return res.serverError({ error: true, message: error.message });
    }

  },

  /**
  * `SuperPowerController.delete()`
  */
  delete: async function (req, res) {
    try {

      const superPower = await SuperPower.findOne({ id: req.params.id })
                .populate('superhero');

      if (superPower) {

        if (superPower.superhero.length) {
          res.serverError('This superpower has a superhero linked');
        } else {
          await SuperPower.destroy({ id: superPower.id });

          const auditEvent = await AuditEventFactore.saveAndPublisher('SuperPower', superPower.id, req.username, 'DELETE');

          if (auditEvent.error) {
            res.serverError(auditEvent);
          } else {
            redisClient.del(`superpower_${superPower.id}`);
            res.ok();
          }

          return;

        }

      } else {
        res.notFound({ error: true, message: 'No superpower was found.' });
      }

      return;

    } catch (error) {
      return res.serverError({ error: true, message: error.message });
    }
  },

};

