var plainTransform = require('../transforms/plain');

module.exports = init;

function init(model) {
    return [
        plainTransform,
        create
    ];
    
    function create(req, res, next) {
        var body = req.body;
        
        model
            .create(body)
            .then(respond)
            .catch(next);
            
        function respond(row) {
            res
                .status(201)
                .send(res.transform(row));
        }
    }
};