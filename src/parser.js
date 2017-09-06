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
    let returnObj;
    if (includes) {
      returnObj = [];
      let baseObj = {};
      let includesArr = includes.split(',');
      for(let i in includesArr){
        if(includesArr[i].indexOf('.') === - 1){
          if(!baseObj.hasOwnProperty(includesArr[i])){
            returnObj.push({association:includesArr[i], include:[]});
            baseObj[includesArr[i]] = {index: returnObj.length - 1};
          }
          continue;
        }
        includeArr = includesArr[i].split('.')
        let basePtr = baseObj;
        let returnPtr = returnObj;
        for(let j in includeArr){
          if(!basePtr.hasOwnProperty(includeArr[j])){
            returnPtr.push({association:includeArr[j], include:[]});
            basePtr[includeArr[j]] = {index: returnPtr.length - 1};
          }
          basePtr = basePtr[includeArr[j]];
          returnPtr = returnPtr[basePtr.index].include;
        }
      }
    }
    return returnObj;
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
