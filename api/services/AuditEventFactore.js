const Joi = require('joi');
const storeValidation = require('../services/StoreValidation');
const PubSub = require('pubsub-js');

module.exports = {

  saveAndPublisher:  async function (entity, entityid, username, action) {

    try {

      const joiBase = storeValidation.auditEvent.REGISTER.schema;

      let bodyAuditEvent = {
        entity,
        entityid,
        datetime: Date.now().toString(),
        username,
        action
      };

      const schema = Joi.object().keys(joiBase);
      bodyAuditEvent = Joi.validate(bodyAuditEvent, schema);

      if(bodyAuditEvent.error !== null){
        return { error: true, message: bodyAuditEvent.error.details[0] };
      }else{

        const resultAuditEvent = await AuditEvent.create(bodyAuditEvent.value).fetch();

        if (!resultAuditEvent) {
          return { error: true, message: err };
        } else {
          PubSub.publish('auditEvent', resultAuditEvent);
          return resultAuditEvent;
        }

      }

    } catch (error) {
      return { error: true, message: error };
    }

  }

};
