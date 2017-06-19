var _ = require('lodash'),
    qs = require('../parsers/qs'),
    HttpStatusError = require('../errors/HttpStatusError');

module.exports = init;

function init(model) {
    return [
        remove
    ];
    
    function remove(req, res, next) {
        var keys = {},
            options = {};
        
        keys.model = _.keys(model.primaryKeyAttributes);
        keys.params = _.keys(req.params);
        keys.filters = _.intersection(keys.model, keys.params);
    
        options.where = qs.filters(_.pick(req.params, keys.filters))
        
        options = _.merge({}, options, req.options);

        model
            .findOne(options)
            .then(destroy)
            .then(respond)
            .catch(next);
            
        function destroy(row) {
            if (!row) {
                throw new HttpStatusError(404, 'Not Found');
            } else {
                return row.destroy();
            }
        }
        
        function respond(row) {
            res.sendStatus(204);
        }
    }
};