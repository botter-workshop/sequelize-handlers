var HttpStatusError = require('../errors/HttpStatusError');

module.exports = function (model) {
    return function (req, res, next) {
        var body = req.body,
            options = req.options || {}; 

        options.where = options.where || {};
        options.where[model.primaryKeyAttribute] = req.params.id;

        model
            .findOne(options)
            .then(updateAttributes)
            .then(respond)
            .catch(next);
            
        function updateAttributes(row) {
            if (!row) {
                throw new HttpStatusError(404, 'Not Found');
            } else {
                return row.updateAttributes(body);
            }
        }
        
        function respond(row) {
            res.status(200).send(row);
        }
    };
};