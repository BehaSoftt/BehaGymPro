const Joi = require('joi');

const schemas = {
    createMember: Joi.object({
        fullName: Joi.string().required().messages({
            'string.empty': 'Ad Soyad alanı boş bırakılamaz.',
            'any.required': 'Ad Soyad alanı gereklidir.'
        }),
        memberCode: Joi.string().allow('', null),
        phone: Joi.string().allow('', null),
        gender: Joi.string().valid('Erkek', 'Kadın', 'DİĞER', 'MALE', 'FEMALE', 'OTHER').required().messages({
            'any.only': 'Geçersiz cinsiyet seçimi.',
            'any.required': 'Cinsiyet alanı gereklidir.'
        }),
        branchId: Joi.string().uuid().required().messages({
            'string.guid': 'Geçersiz şube ID formatı.',
            'any.required': 'Şube seçimi zorunludur.'
        }),
        profileType: Joi.string().valid('MEMBER', 'INSTRUCTOR', 'PERSONNEL').default('MEMBER')
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
            return res.status(400).json({ 
                status: 'ERROR', 
                message: errorMessages[0], // İlk hatayı göster
                errors: errorMessages 
            });
        }

        next();
    };
};

module.exports = {
    validate
};
