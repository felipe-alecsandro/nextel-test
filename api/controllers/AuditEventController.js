/**
 * AuditEventController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const PubSub = require('pubsub-js');
module.exports = {

  subscribe: async function (req, res) {

    PubSub.subscribe('auditEvent', (topic, data) => {
      res.send(data);
    });

  }

};

