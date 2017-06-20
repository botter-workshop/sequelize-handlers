const _ = require('lodash');

module.exports = {
    parse
};

function parse(params, { rawAttributes }) {
    const options = {
        where: {}    
    };
    
    const keywords = [
        'fields',
        'limit',
        'offset',
        'sort'
    ];
    
    options.attributes = parseString(params.fields);
    options.limit = parseInteger(params.limit || 50);
    options.offset = parseInteger(params.offset || 0);
    options.order = parseSort(params.sort);
    
    _(params)
        .omit(keywords)
        .forOwn((value, key) => {
            if (rawAttributes.hasOwnProperty(key)) {
                options.where[key] = parseJson(value);
            }
        });
    
    return options;
};

function parseString(value) {
    if (value) {
        value = value.split(',');
    }
    
    return value;
}

function parseJson(value) {
    try {
        value = JSON.parse(value);
    } catch (error) {
        value = parseString(value);
    }
    
    return value;
}

function parseInteger(value) {
    value = parseInt(value);
    
    if (!value || value < 0) {
        value = 0;
    }
    
    return value;
}

function parseSort(value) {
    let sort = null;
        
    if (value) {
        const keys = parseString(value);
        
        sort = _.map(keys, (key) => {
            if (key.indexOf('-') === 0) {
                return [key.substr(1), 'DESC'];
            } else {
                return [key, 'ASC'];
            }
        });
    }
    
    return sort;
}