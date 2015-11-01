var _ = require('lodash'),
    qs = require('../parsers/qs');

module.exports = function (model) {
    var middlewares = [];
    
    middlewares.push(function (req, res, next) {
        var query = {},
            keys = {};
        
        keys.model = _.keys(model.rawAttributes);
        keys.query = _.keys(req.query);
        keys.filters = _.intersection(keys.model, keys.query);
        
        query.attributes = qs.fields(req.query.fields);
        query.limit = qs.limit(req.query.limit) || 50;
        query.offset = qs.offset(req.query.offset);
        query.order = qs.sort(req.query.sort);
        query.where = qs.filters(_.pick(req.query, keys.filters));
        
        query = _.omit(query, _.isNull);
        
        req.locals = req.locals || {};
        req.locals.query = query;
        
        next();
    });
    
    
    middlewares.push(function (req, res, next) {
        var query = req.locals.query;

        model
            .findAndCountAll(query)
            .then(respond)
            .catch(next);
            
        function respond(result) {
            var count = result.count,
                start = query.offset, 
                end = query.offset + query.limit;
            
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