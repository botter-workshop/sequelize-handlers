var _ = require('lodash'),
    qs = require('../parsers/qs'),
    HttpStatusError = require('../errors/HttpStatusError'),
    plainTransform = require('../transforms/plain');

module.exports = init;

function init(model) {
    return [
        plainTransform,
        get
    ];
    
    function get(req, res, next) {
        var keys = {},
            options = {};
        
        keys.model = _.keys(model.primaryKeyAttributes);
        keys.params = _.keys(req.params);
        keys.filters = _.intersection(keys.model, keys.params);
    
        options.where = qs.filters(_.pick(req.params, keys.filters))
        
        options = _.merge({}, options, req.options);
        
        model
            .findOne(options)
            .then(respond)
            .catch(next);
        
        function respond(row) {
            if (row) {
                res.send(res.transform(row));
            } else {
                throw new HttpStatusError(404, 'Not Found');
            }
        }
    }
};