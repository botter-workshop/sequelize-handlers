const _ = require('lodash');

module.exports = transform;

function transform(req, res, next) {
    if (!_.isFunction(res.transform)) {
        res.transform = plain;
    }
    
    next();
    
    function plain(data) {
        return data;
    }
}