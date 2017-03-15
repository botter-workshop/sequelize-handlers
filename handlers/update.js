var _ = require('lodash'),
    HttpStatusError = require('../errors/HttpStatusError'),
    plainTransform = require('../transforms/plain');

module.exports = init; 

function init(model) {
    return [
        plainTransform,
        update    
    ];
    
    function update(req, res, next) {
        var body = req.body,
            options = req.options || {}; 

        options.where = options.where || {};
        _.forOwn(req.params, key => { if (model.primaryKeyAttributes.includes(key)) options.where[key] = req.params[key]; });

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
            res
                .status(200)
                .send(res.transform(row));
        }
    }
};
