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
    
    options.limit = parseInteger(params.limit);
    options.offset = parseInteger(params.offset);
    options.order = parseSort(params.sort);
    
    if (params.group) {
        if (!options.order) {
            throw new HttpStatusError(400, `The 'sort' parameter is required for 'group'`);
        }
        
        options.attributes = options.group = parseString(params.group);
        
        _(options.order)
            .forEach((pair) => {
                if (!_.includes(options.group, pair.head())) {
                    throw new HttpStatusError(400, `Values in 'sort' must be present in 'group'.`);
                } 
            });
    } else {
        options.attributes = parseString(params.fields);
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
    let sort = undefined;
        
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