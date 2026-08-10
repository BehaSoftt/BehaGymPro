const Joi = require('joi');

const schemas = {
    createMember: Joi.object({
        fullName: Joi.string().required().messages({
            'string.empty': 'Ad Soyad alanı boş bırakılamaz.',
            'any.required': 'Ad Soyad alanı gereklidir.'
        }),
        memberCode: Joi.string().allow('', null),
        phone: Joi.string().allow('', null),
        gender: Joi.string().valid('Erkek', 'Kadın', 'DİĞER', 'MALE', 'FEMALE', 'OTHER').allow('', null).optional(),
        branchId: Joi.string().uuid().allow('', null).optional(),
        profileType: Joi.string().valid('MEMBER', 'INSTRUCTOR', 'PERSONNEL', 'USER').default('MEMBER')
    }).unknown(true),

    updateMember: Joi.object({
        fullName: Joi.string().messages({
            'string.empty': 'Ad Soyad alanı boş bırakılamaz.'
        }),
        phone: Joi.string().messages({
            'string.empty': 'Telefon alanı boş bırakılamaz.'
        })
    }).unknown(true)
};

const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return next();
        }

        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            console.error(`[Validation Error] (${schemaName}):`, errorMessages, 'Body:', JSON.stringify(req.body));
            return res.status(400).json({ 
                status: 'ERROR', 
                message: errorMessages[0], 
                errors: errorMessages 
            });
        }

        next();
    };
};

module.exports = {
    validate
};
