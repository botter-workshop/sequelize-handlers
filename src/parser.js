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
        'requireIncludes',
        'fields',
        'limit',
        'offset',
        'sort'
    ];
    options.include = parseIncludes(params.includes, (params.requireIncludes?params.requireIncludes === 'true':false));
    options.attributes = parseString(params.fields);
    options.limit = parseInteger(params.limit);
    options.offset = parseInteger(params.offset);
    options.order = parseSort(params.sort);
    options.distinct = (options.include && options.include.length > 0);

    _(params)
        .omit(keywords)
        .forOwn((value, key) => {

            // field=~value is shorthand for field={"$like": "%value%"}
            if (typeof value === 'string' && value.startsWith('~')) {
              value = `{"$like":"%${value.replace('~','')}%"}`;
            }

            // field1,field2=value will produce an {"$or": []} block
            if (key.includes(',')) {
              options.where['$or'] = buildOr(key, value);
            } else if (key.indexOf('.') !== -1){
              buildDotWalkFilter(key, value, options);
            } else if (rawAttributes.hasOwnProperty(key)){
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

/*
  Modifited to have duplicating: false to fix has-many relationship queries and also to generate a default where so we can appropriately add where condtions to lower level objects.
*/
function parseIncludes(includes, required) {
    let returnObj;
    if (includes) {
      returnObj = [];
      let baseObj = {};
      let includesArr = includes.split(',');
      for(let i in includesArr){
        if(includesArr[i].indexOf('.') === - 1){
          if(!baseObj.hasOwnProperty(includesArr[i])){
            returnObj.push({association:includesArr[i], duplicating: false, required: required, include:[], where:{}});
            baseObj[includesArr[i]] = {index: returnObj.length - 1};
          }
          continue;
        }
        includeArr = includesArr[i].split('.')
        let basePtr = baseObj;
        let returnPtr = returnObj;
        for(let j in includeArr){
          if(!basePtr.hasOwnProperty(includeArr[j])){
            returnPtr.push({association:includeArr[j], duplicating: false, required: required, include:[], where:{}});
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

/*
    This mutates the options object to place the dot walked key in the correct where conditional and add the appropriate filter value.  This fixes has-many relationship filters and also allows for infinate level filtering on a query
*/
function buildDotWalkFilter(key, value, options){
  let keyParts = key.split('.');
  for(let include of options.include){
    if(include.association === keyParts[0]){
      let wherePtr = include.where;
      let incPtr = include;
      for(let kIdx = 1; kIdx < (keyParts.length - 1); kIdx++){
        for(let inc of incPtr.include){
          if(inc.association === keyParts[kIdx]){
            wherePtr = inc.where;
            incPtr = inc;
          }
        }
      }
      wherePtr[keyParts[(keyParts.length - 1)]] = parseJson(value);
    }
  }
}

/**
 * Build `or` query block based on comma separated list of fields
 *
 * @example
 * // returns
 * // { '$or' :
 * //    [
 * //     { field1: 'partial' },
 * //     { field2: 'partial' },
 * //     { '$RelatedList.field3$': 'partial' }
 * //   ]
 * // }
 * parseFilter('field1,field2,RelatedList.field3', 'value')
 *
 * @param {string} fields - Comma delimited list of fields to search
 * @param {string} value - The string to search for
 *
 * @returns {object} Returns a sequelize 'or' subquery
 */
function buildOr(fields, value) {
  let or = [];
  let fieldKeys = fields.split(',');

  for(let orField of fieldKeys) {
    let fieldKey = orField.includes('.') ? `$${orField}$` : orField;
    let parsed = parseJson(value);
    if(Array.isArray(parsed)){
        parsed = parsed[0];
    }
    or.push({[fieldKey]: parsed});
  }

  return or;
}
