const Joi = require('joi');

module.exports = {
  // POST /api/users
  superhero: {
    POST: {
      schema: {
        name: Joi.string().required(),
        alias: Joi.string().required(),
        protectionArea: {
          id: Joi.number(),
          name: Joi.string(),
          lat: Joi.string(),
          long: Joi.string(),
          radius: Joi.number(),
        },
        superPowers: Joi.array().items({
          id: Joi.number()
        })
      }
    },
    PUT: {
      schema: {
        id: Joi.number().required(),
        name: Joi.string().required(),
        alias: Joi.string().required(),
        protectionArea: {
          id: Joi.number(),
          name: Joi.string(),
          lat: Joi.string(),
          long: Joi.string(),
          radius: Joi.number(),
        },
        superPowers: Joi.array().items({
          id: Joi.number()
        })
      }
    },
    GET: {
      schema: {
        id: Joi.number(),
        pageNum: Joi.number(),
        pageSize: Joi.number()
      }
    },
    DELETE: {
      schema: {
        id: Joi.number().required(),
      }
    },
  },
  superpower: {
    POST: {
      schema: {
        name: Joi.string(),
        description: Joi.string()
      }
    },
    PUT: {
      schema: {
        id: Joi.string(),
        name: Joi.string(),
        description: Joi.string()
      }
    },
    GET: {
      schema: {
        id: Joi.number(),
        pageNum: Joi.number(),
        pageSize: Joi.number()
      }
    },
    DELETE: {
      schema: {
        id: Joi.number().required(),
      }
    },
  },
  user: {
    GET: {
      schema: {
        id:  Joi.number(),
        pageNum: Joi.number(),
        pageSize: Joi.number()
      }
    },
    POST: {
      schema: {
        username: Joi.string().required(),
        password: Joi.string().required(),
        role: Joi.array().items({
          id: Joi.number()
        }).required()
      }
    },
    PUT: {
      schema: {
        id: Joi.number().required(),
        username: Joi.string(),
        password: Joi.string(),
        role: Joi.array().items({
          id: Joi.number()
        })
      }
    },
    DELETE: {
      schema: {
        id: Joi.number().required(),
      }
    },
  },
  login: {
    POST: {
      schema: {
        username: Joi.string().required(),
        password: Joi.string().required()
      }
    },
  },
  auditEvent: {
    REGISTER: {
      schema: {
        entity: Joi.string().required(),
        entityid: Joi.number().required(),
        datetime: Joi.string().required(),
        username: Joi.string().required(),
        action: Joi.string().required()
      }
    },
  }
};
