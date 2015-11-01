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
                res.sendStatus(404);
            }
        }
    };
};