var _ = require('lodash'),
    HttpStatusError = require('../errors/HttpStatusError');

module.exports = init;

function init(model) {
    return [
        remove
    ];
    
    function remove(req, res, next) {
        var options = req.options || {}; 

        options.where = options.where || {};
        _.forOwn(req.params, key => { if (model.primaryKeyAttributes.includes(key)) options.where[key] = req.params[key]; });

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
