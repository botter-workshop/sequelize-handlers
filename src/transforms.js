const _ = require('lodash');

module.exports = {
    distinct,
    raw
};

function distinct(req, res, next) {
    const field = req.query.distinct;
    
    if (field) {
        res.transform = transform;
    }

    next();

    function transform(data) {
        return _(data)
            .map(field)
            .flatten()
            .uniqWith(_.isEqual)
            .value();
    }
}

function raw(req, res, next) {
    if (!_.isFunction(res.transform)) {
        res.transform = transform;
    }
    
    next();
    
    function transform(data) {
        return data;
    }
}