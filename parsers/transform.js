var _ = require('lodash');

module.exports = transform;

function transform(req, res, next) {
    if (!_.isFunction(req.transform)) {
        req.transform = plain;
    }
    
    next();
    
    function plain(data) {
        return data;
    }
}