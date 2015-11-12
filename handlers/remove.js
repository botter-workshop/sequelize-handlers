var HttpStatusError = require('../errors/HttpStatusError');

module.exports = function (model) {
    return function (req, res, next) {
        var options = req.options || {}; 

        options.where = options.where || {};
        options.where[model.primaryKeyAttribute] = req.params.id;

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
    };
};