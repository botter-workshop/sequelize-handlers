var HttpStatusError = require('../errors/HttpStatusError');

module.exports = function (model) {
    return function (req, res, next) {
        var body = req.body;
        
        model = req.model || model;
        
        model
            .findById(req.params.id)
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