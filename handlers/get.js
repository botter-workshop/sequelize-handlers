var HttpStatusError = require('../errors/HttpStatusError');

module.exports = function (model) {
    return function (req, res, next) {
        var options = req.options || {};; 

        options.where[model.primaryKeyAttribute] = req.params.id;

        model
            .findOne(options)
            .then(respond)
            .catch(next);
        
        function respond(row) {
            if (row) {
                res.send(row);
            } else {
                throw new HttpStatusError(404, 'Not Found');
            }
        }
    };
};