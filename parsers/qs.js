var _ = require('lodash');

var qs = {};

qs.limit = function (value) {
    value = parseInt(value);
    
    if (!value || value < 0) {
        value = 0;
    }    
    return value;
};

qs.offset = function (value) {
    value = parseInt(value);
    
    if (!value || value < 0) {
        value = 0;
    }
    return value;
};

qs.sort = function (options) {
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
};

qs.fields = function (options) {
    var fields = null;
    
    if (options) {
        fields = options.split(',');
    }

    return fields;
};
    
qs.filters = function (options) {
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
};

module.exports = qs;