const _ = require('lodash');
const { HttpStatusError } = require('./errors');

module.exports = {
    parse
};

function parse(params, { rawAttributes }) {
    const options = {
        where: {}    
    };
    
    const keywords = [
        'fields',
        'group',
        'limit',
        'offset',
        'sort'
    ];
    
    options.attributes = parseString(params.fields);
    options.limit = parseInteger(params.limit);
    options.offset = parseInteger(params.offset);
    options.order = parseSort(params.sort);
    
    if (params.group) {
        if (!params.fields || !params.sort) {
            throw new HttpStatusError(400, `The 'sort' and 'fields' parameters are required for 'group'`);
        }
        
        const sortKeys = params.sort
            .replace('-', '')
            .split(',');
            
        const fieldsKeys = parseString(params.fields);
        
        const groupKeys = parseString(params.group);
        
        const unionKeys = _.union(sortKeys, fieldsKeys, groupKeys);
        
        if (unionKeys.length > groupKeys.length) {
            throw new HttpStatusError(400, `Values in 'fields' and 'sort' must be present in 'group'.`);
        }
        
        options.group = groupKeys;
    }
    
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
    
    if (_.isNaN(value)) {
        value = undefined;
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