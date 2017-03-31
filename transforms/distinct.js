var _ = require('lodash');

module.exports = transform;

function transform(req, res, next) {
    var field = req.query.distinct;
    
    if (field) {
        res.transform = distinct;
    }

    next();

    function distinct(data) {
        return _(data)
            .map(field)
            .flatten()
            .uniqWith(_.isEqual)
            .value();
    }
}