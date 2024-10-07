const joi  = require('joi');

const schema = joi.object({
    email: joi.string()
        .email({ tlds : { allow: false } })
        .required(),

    password: joi.string()
        .min(8)
        .max(30)
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required()
})

module.exports = schema;