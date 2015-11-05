module.exports = function (model) {
    return function (req, res, next) {
        var body = req.body;
            
        model = req.model || model;
        
        model
            .create(body)
            .then(respond)
            .catch(next);
            
        function respond(row) {
            res.status(201).send(row);
        }
    };
};