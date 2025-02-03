const Joi = require("joi");

module.exports.blogSchema = Joi.object({
    blog: Joi.object({
        title: Joi.string().required(),
        image: Joi.string().allow("", null),
        description: Joi.string().required(),
    }).required()
})