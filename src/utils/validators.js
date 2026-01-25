/**
 * Движок валидации Zero-Error Entry
 * Содержит правила, сообщения об ошибках и примеры для всех сущностей.
 */

export const validators = {
    property: {
        name: {
            validate: (val) => val && val.trim().length >= 3,
            error: 'validation.nameShort',
            example: 'validation.nameExample'
        },
        address: {
            validate: (val) => val && val.trim().length >= 5,
            error: 'validation.addressFull',
            example: 'validation.addressExample'
        },
        marketValue: {
            validate: (val) => !isNaN(val) && Number(val) > 0,
            error: 'validation.valuePositive',
            example: 'validation.valueExample'
        },
        type: {
            validate: (val) => ['rental', 'construction', 'commercial', 'str'].includes(val),
            error: 'validation.typeInvalid',
            example: 'validation.typeExample'
        },
        monthlyIncome: {
            validate: (val, allValues) => {
                if (val === undefined) return true; // Don't block if field is missing from the form
                if (allValues.type === 'rental' || allValues.type === 'str') {
                    return !isNaN(val) && Number(val) > 0;
                }
                return true;
            },
            error: 'validation.incomeRequired',
            example: 'validation.incomeExample'
        }
    },
    transaction: {
        amount: {
            validate: (val) => !isNaN(val) && Number(val) > 0,
            error: 'validation.amountPositive',
            example: 'validation.amountExample'
        },
        category: {
            validate: (val) => val && val.trim().length > 0,
            error: 'validation.categoryRequired',
            example: 'validation.categoryExample'
        },
        date: {
            validate: (val) => /^\d{4}-\d{2}-\d{2}$/.test(val),
            error: 'validation.dateInvalid',
            example: 'validation.dateExample'
        }
    },
    vendor: {
        name: {
            validate: (val) => val && val.trim().length >= 2,
            error: 'validation.nameShort',
            example: 'validation.nameExample'
        },
        category: {
            validate: (val) => val && val.trim().length > 0,
            error: 'validation.categoryRequired',
            example: 'validation.categoryExample'
        },
        phone: {
            validate: (val) => !val || /^\+?[\d\s-]{10,}$/.test(val),
            error: 'validation.phoneInvalid',
            example: 'validation.phoneExample'
        },
        email: {
            validate: (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            error: 'validation.emailInvalid',
            example: 'validation.emailExample'
        }
    }
};

/**
 * Функция для валидации всей формы
 * @param {string} type - Тип сущности (property, transaction)
 * @param {object} values - Все значения формы
 * @returns {object} - Объект с ошибками { fieldName: { error, example } }
 */
export const validateForm = (type, values) => {
    const rules = validators[type];
    if (!rules) return {};

    const errors = {};
    Object.keys(rules).forEach(field => {
        const rule = rules[field];
        if (!rule.validate(values[field], values)) {
            errors[field] = {
                message: rule.error,
                example: rule.example
            };
        }
    });

    return errors;
};
