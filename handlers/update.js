module.exports = function (model) {
    return function (req, res, next) {
        var body = req.body;
        
        model
            .findById(req.params.id)
            .then(updateAttributes)
            .catch(next);
            
        function updateAttributes(row) {
            if (!row) {
                res.sendStatus(404);
            } else {
                row
                    .updateAttributes(body)
                    .then(respond)
                    .catch(next);
            }
        }
        
        function respond(row) {
            res.status(200).send(row);
        }
    };
};