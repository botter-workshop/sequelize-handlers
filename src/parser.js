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
        'includes',
        'fields',
        'limit',
        'offset',
        'sort'
    ];

    options.include = parseIncludes(params.includes);
    options.attributes = parseString(params.fields);
    options.limit = parseInteger(params.limit);
    options.offset = parseInteger(params.offset);
    options.order = parseSort(params.sort);

    _(params)
        .omit(keywords)
        .forOwn((value, key) => {
            if(key.indexOf('.') !== -1){
              key = '$' + key + '$';
              options.where[key] = parseJson(value);
            }else if(rawAttributes.hasOwnProperty(key)){
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

function parseIncludes(includes) {
    if (includes) {
        includesArr = includes.split(',');
        includes = {};
        for(let i in includesArr){
          if(includes[i].indexOf('.') === - 1){
            includes[includesArr[i]] = {}
          }
          includeArr = includes[i].split('.')
          let includePtr = includes;
          for(let j in includeArr){
            if(includePtr[includeArr[j]].indexOf('.') === - 1){
              includePtr[includeArr[j]] = {};
            }
            includePtr = includePtr[includeArr[j]];
          }
        }
    }
    console.log(includes);
    return includes;
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
