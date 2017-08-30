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
        'limit',
        'offset',
        'sort'
    ];

    params = translateKeys(params);

    options.attributes = parseString(params.fields);
    options.limit = parseInteger(params.limit);
    options.offset = parseInteger(params.offset);
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

function translateKeys(object) {
  // Translate keys to be used as this package expects
  let str = JSON.stringify(object);
  str = str.replace('_sort', 'sort');
  str = str.replace('_start', 'offset');
  str = str.replace('_end', 'limit');
  object = JSON.parse(str);

  // Package is expecting to receive the order as part of sort params
  // For example: sort:id for ASC and sort:-id for DESC
  if( object['_order'] ) {
    if( object['_order'] == 'DESC' )
      object['sort'] = '-' + object['sort'];
    delete object['_order'];
  }
  return object;
}
