const joi = require("joi");

const userValidationSchema = joi.object({
  email: joi
    .string()
    .email({ tlds: { allow: false } })
    .required(),

  password: joi
    .string()
    .min(8)
    .max(30)
    .pattern(new RegExp("^[a-zA-Z0-9@#_!$%^&*]{8,30}$"))
    .required(),
});

const botValidationSchema = joi.object({
  name: joi
    .string()
    .min(2)
    .max(30)
    .required(),

  description: joi
    .string()
    .min(5)
    .max(100)
    .required(),
});

const documentValidationSchema = joi.object({
  documentName: joi
    .string()
    .min(2)
    .max(30)
    .required(),

  content: joi
    .string()
    .min(5)
    .max(100)
    .required(),
});

module.exports = { userValidationSchema, botValidationSchema, documentValidationSchema };
