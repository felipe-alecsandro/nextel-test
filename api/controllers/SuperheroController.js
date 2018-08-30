/**
 * SuperheroController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const redisClient = require('../services/redisClient')();
const geolib = require('geolib');
module.exports = {

  /**
     * `SuperheroController.create()`
     */
  create: async function (req, res) {

    try {

      let { name, alias, protectionArea = {}, superPowers = [] } = req.body;
      let idSuperPowers = [];
      let idProtectionArea = [];

      if (Object.keys(protectionArea).length) {

        if (protectionArea.id === undefined) {
          const protectionAreaExist = await ProtectionArea.findOne({ name: protectionArea.name });

          if (!protectionAreaExist) {
            const shProtectionArea = await ProtectionArea.create(req.body.protectionArea).fetch();
            idProtectionArea.push(shProtectionArea.id);
          } else {
            return res.serverError({ error: true, message: `This protected area already exists in ID: ${protectionAreaExist.id}` });
          }

        } else {
          idProtectionArea.push(protectionArea.id);
        }

      }

      if (superPowers.length) {
        idSuperPowers = superPowers.map(superPower => superPower.id);
      }

      await Superhero.create({ name, alias }).fetch().exec(async (err, resultSuperHero) => {

        if (err) {
          res.serverError({ error: true, message: err });
        } else {
          await Superhero.addToCollection(resultSuperHero.id, 'superpower', idSuperPowers);
          await Superhero.addToCollection(resultSuperHero.id, 'protectionarea', idProtectionArea);

          const auditEvent = await AuditEventFactore.saveAndPublisher('SuperHero', resultSuperHero.id, req.username, 'CREATE');

          if (auditEvent.error) {
            res.serverError(auditEvent);
          } else {

            redisClient.hmset('superhero_' + resultSuperHero.id, resultSuperHero, (error, reply) => {

              if (error) {
                res.serverError(error.message);
              } else {
                res.ok(resultSuperHero);
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
    * `SuperheroController.update()`
    */
  update: async function (req, res) {

    try {

      let idSuperHero = req.params.id;
      let { name, alias, protectionArea = {}, superPowers = [] } = req.body;
      let idSuperPowers = [];
      let idProtectionArea = [];

      if (Object.keys(protectionArea).length) {

        if (protectionArea.id === undefined) {
          const protectionAreaExist = await ProtectionArea.findOne({ name: protectionArea.name });

          if (!protectionAreaExist) {
            const shProtectionArea = await ProtectionArea.create(protectionArea).fetch();
            idProtectionArea.push(shProtectionArea.id);
          } else {
            return res.serverError({ error: true, message: `This protected area already exists in ID: ${protectionAreaExist.id}` });
          }

        } else {
          protectionArea = await ProtectionArea.update({ id: protectionArea.id }, { protectionArea }).fetch();
          idProtectionArea.push(protectionArea[0].id);
        }

      }

      if (superPowers.length) {
        idSuperPowers = superPowers.map(superPower => superPower.id);
      }

      await Superhero.update({ id: idSuperHero }, { name, alias }).fetch().exec(async (err, resultSuperHero) => {

        if (err) {
          res.serverError({ error: true, message: err });
        } else {
          resultSuperHero = resultSuperHero[0];
          await Superhero.replaceCollection(resultSuperHero.id, 'superpower').members(idSuperPowers);
          await Superhero.replaceCollection(resultSuperHero.id, 'protectionarea').members(idProtectionArea);

          const auditEvent = await AuditEventFactore.saveAndPublisher('SuperHero', resultSuperHero.id, req.username, 'UPDATE');

          if (auditEvent.error) {
            res.serverError(auditEvent);
          } else {

            redisClient.hmset('superhero_' + resultSuperHero.id, resultSuperHero, (error, reply) => {

              if (error) {
                res.serverError(error.message);
              } else {
                res.ok(resultSuperHero);
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
     * `SuperheroController.find()`
     */
  pagedList: async function (req, res) {

    try {

      if (req.query.pageNum === undefined && req.query.pageSize === undefined) {
        return res.badRequest({ error: true, message: 'Must be sent as pageNum and pageSize URL parameter' });
      }

      const { pageNum = 0, pageSize = 10 } = req.query;

      redisClient.hget(`superhero__pageNum_${pageNum}_pageSize_${pageSize}`, async (error, obj) => {

        if (error || !obj) {
          const superheroes = await Superhero.find()
                        .populate('superpower')
                        .populate('protectionarea')
                        .paginate(+pageNum, +pageSize);

          if (!superheroes) {
            res.notFound({ error: true, message: 'No super hero found.' });
          } else {

            redisClient.hmset(`superhero_pageNum_${pageNum}_pageSize_${pageSize}`, superheroes, async (error, reply) => {

              if (error) {
                res.serverError(error.message);
              } else {
                return res.ok(superheroes);
              }

            });
            res.ok(superheroes);
          }

          return;
        } else {
          res.ok(obj);
        }

      });

    } catch (error) {
      return res.serverError({ error: true, message: error });
    }

  },

  /**
    * `SuperheroController.findOne()`
    */
  findOne: async function (req, res) {

    try {

      if (req.params.id === undefined) {
        return res.badRequest({ error: true, message: 'Must be sent a number like a ID' });
      }

      redisClient.hget(`superhero_${req.params.id}`, async (error, obj) => {

        if (error || !obj) {
          const superhero = await Superhero.findOne({ id: req.params.id })
                        .populate('superpower')
                        .populate('protectionarea');

          if (!superhero) {
            res.notFound({ error: true, message: 'No super hero found.' });
          } else {

            redisClient.hmset(`superhero_${req.params.id}`, superhero, (error, reply) => {

              if (error) {
                res.serverError(error.message);
              } else {
                res.ok(superhero);
              }

            });

          }

          return;
        } else {
          res.ok(obj);
        }

      });

    } catch (error) {
      return res.serverError({ error: true, message: error.message });
    }

  },

  /**
  * `SuperheroController.delete()`
  */
  delete: async function (req, res) {

    try {
      const superhero = await Superhero.findOne({ id: req.params.id })
                .populate('superpower')
                .populate('protectionarea');

      if (superhero) {
        idSuperPowers = superhero.superpower.map(obj => obj.id);
        idProtectionArea = superhero.protectionarea.map(obj => obj.id);

        await Superhero.removeFromCollection(superhero.id, 'superpower', idSuperPowers);
        await Superhero.removeFromCollection(superhero.id, 'protectionarea', idProtectionArea);

        await Superhero.destroy({ id: superhero.id });

        const auditEvent = await AuditEventFactore.saveAndPublisher('SuperHero', superhero.id, req.username, 'DELETE');

        if (auditEvent.error) {
          res.serverError(auditEvent);
        } else {

          redisClient.del(`superhero_${superhero.id}`);
          res.ok();
        }

      } else {
        res.notFound({ error: true, message: 'No super hero found.' });
      }

      return;

    } catch (error) {
      return res.serverError({ error: true, message: error.message });
    }
  },

  /**
* `SuperheroController.helpme()`
*/
  helpme: async function (req, res) {

    try {

      let superHero = [];
      let { latitude: lat, longitude: long } = req.query;

      if (lat === undefined && long === undefined) {
        return res.badRequest({ error: true, message: 'Must be sent as latitude and longitude URL parameter' });
      }

      await Superhero.find().populate('protectionarea').exec((err, result) => {

        if (err) {
          res.serverError({ error: true, message: 'There was an error in call of ​​superherop to help you!' });
        } else {

          result.map(obj => {

            let insideArea = geolib.isPointInCircle(
                            {
                              latitude: parseFloat(obj.protectionarea[0].lat),
                              longitude: parseFloat(obj.protectionarea[0].long)
                            },
                            {
                              latitude: parseFloat(lat),
                              longitude: parseFloat(long)
                            },
                            10000
            );
            if (insideArea && superHero.length < 8) {
              superHero.push(obj);
              // if(superHero.length == 8) return res.ok(superHero); //******* Block to test in dev, in prod just use this line *******
            }
          });
          return res.ok(superHero);
        }
      });


    } catch (error) {
      return res.serverError({ error: true, message: error.message });
    }
  },
};

