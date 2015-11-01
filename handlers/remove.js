module.exports = function (model) {
    return function (req, res, next) {
        model
            .findById(req.params.id)
            .then(destroy)
            .catch(next);
            
        function destroy(row) {
            if (!row) {
                res.sendStatus(404);
            } else {
                row
                    .destroy()
                    .then(respond)
                    .catch(next);
            }
        }
        
        function respond(row) {
            res.sendStatus(204);
        }
    };
};