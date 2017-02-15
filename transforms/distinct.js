var _ = require('lodash');

module.exports = transform;

function transform(req, res, next) {
    var fields = null;
    
    if (req.query.distinct) {
        fields = req.query.distinct.split(',');
        res.transform = distinct;
    }

    next();

    function distinct(data) {
        return _(data)
            .map(_.partialRight(_.pick, fields))
            .uniqWith(_.isEqual)
            .value();
    }
}