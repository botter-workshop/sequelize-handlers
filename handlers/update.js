var _ = require('lodash'),
    qs = require('../parsers/qs'),
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
            keys = {},
            options = {};
        
        keys.model = _.keys(model.primaryKeyAttributes);
        keys.params = _.keys(req.params);
        keys.filters = _.intersection(keys.model, keys.params);
    
        options.where = qs.filters(_.pick(req.params, keys.filters))
        
        options = _.merge({}, options, req.options);

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