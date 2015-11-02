var HttpStatusError = require('../errors/HttpStatusError');

module.exports = function (model) {
    return function (req, res, next) {
        model
            .findById(req.params.id)
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