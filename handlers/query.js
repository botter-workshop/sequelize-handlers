var _ = require('lodash'),
    qs = require('../parsers/qs');

module.exports = function (model) {
    var middlewares = [];
    
    middlewares.push(function (req, res, next) {
        var options = {},
            keys = {};
        
        model = req.model || model;
        
        keys.model = _.keys(model.rawAttributes);
        keys.query = _.keys(req.query);
        keys.filters = _.intersection(keys.model, keys.query);
        
        options.attributes = qs.fields(req.query.fields);
        options.limit = qs.limit(req.query.limit) || 50;
        options.offset = qs.offset(req.query.offset);
        options.order = qs.sort(req.query.sort);
        options.where = qs.filters(_.pick(req.query, keys.filters));
        
        options = _.omitBy(options, _.isNull);
        
        req.options = _.merge({}, options, req.options);
        
        next();
    });
    
    middlewares.push(function (req, res, next) {
        var options = req.options;

        model
            .findAndCountAll(options)
            .then(respond)
            .catch(next);
            
        function respond(result) {
            var count = result.count,
                start = options.offset, 
                end = options.offset + options.limit;
            
            if (end >= count) {
                end = count;
                res.status(200);
            } else {
                res.status(206);
            }
            
            res.set('Content-Range', start + '-' + end + '/' + count);
            res.send(result.rows);
        }
    });
    
    return middlewares;
};