var _ = require('lodash');

module.exports = {
    distinct: distinct,
    fields: fields,
    filters: filters,
    limit: limit,
    offset: offset,
    sort: sort
}

function distinct(value) {
    return value ? true : null;
}

function fields(options) {
    var fields = null;
    
    if (options) {
        fields = options.split(',');
    }

    return fields;
}
    
function filters(options) {
    var filters = null;
    
    if (!_.isEmpty(options)) {
        filters = {};
        _.forOwn(options, function (value, key) {
            try {
                filters[key] = JSON.parse(value);
            } catch (err) {
                filters[key] = value.split(',');
            }
        });
    }
    
    return filters;
}

function limit(value) {
    value = parseInt(value);
    
    if (!value || value < 0) {
        value = 0;
    }    
    return value;
}

function offset(value) {
    value = parseInt(value);
    
    if (!value || value < 0) {
        value = 0;
    }
    return value;
}

function sort(options) {
    var properties,
        sort = null;
        
    if (options) {
        properties = options.split(',');
        
        sort = _.map(properties, function (x) {
            if (x.indexOf('-') === 0) {
                return [x.substr(1), 'DESC'];
            } else {
                return [x, 'ASC'];
            }
        });
    }
    
    return sort;
}