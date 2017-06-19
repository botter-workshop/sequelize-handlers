const _ = require('lodash');

class Handler {
    constructor(Model) {
        this.Model = Model;
    }
    
    async create(req, res, next) {
        try {
            const row = await this.Model.create(req.body);
            res.send(row);
        } catch (error) {
            next(error);
        }
    }
    
    async get(req, res, next) {
        try {
            const row = await this.findOne(req.params);
            res.send(row);
        } catch (error) {
            next(error);
        }
    }
    
    async destroy(req, res, next) {
        try {
            const row = await this.findOne(req.params);
            await row.destroy();
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }
    
    async update(req, res, next) {
        try {
            const row = await this.findOne(req, res, next);
            const updated = await row.updateAttributes(req.body);
            res.send(updated);
        } catch (error) {
            next(error);
        }
    }
    
    async query(req, res, next) {
        try {
            const { rows, start, end, count } = await this.findAndCountAll(req.query);
            
            res.set('Content-Range', `${start}-${end}/${count}`);
            
            if (count > end) {
                res.status(206);
            } else {
                res.status(200);
            }
            
            res.send(rows);
        } catch (error) {
            next(error);   
        }
    }
    
    async findOne(params, options = { where: {} }) {
        options.where = _.merge(this.filter(params), options.where);
        
        const row = await this.Model.findOne(options);
        
        return row;
    }
    
    async findAndCountAll(params, options = { where: {} }) {
        const { fields, limit = 50, offset = 0, sort, ...filters } = params;
        
        options.where = _.merge(this.filter(filters), options.where);
        
        if (fields) {
            options.attributes = fields.split(','); 
        }
        
        if (sort) {
            const keys = sort.split(',');
            
            options.order = keys.map((key) => {
                if (key.indexOf('-') === 0) {
                    return [key.substr(1), 'DESC'];
                } else {
                    return [key, 'ASC'];
                }
            });
        }
        
        const { count, rows } = await this.Model.findAndCountAll(options);
        
        const start = offset;
        const end = Math.max(count, offset + limit);
        
        return { rows, start, end, count };
    }
    
    filter(params, filters = {}) {
        const { rawAttributes } = this.Model;
        
        _.forOwn(params, (value, key) => {
            if (rawAttributes.hasOwnProperty(key)) {
                try {
                    filters[key] = JSON.parse(value);
                } catch (error) {
                    filters[key] = value.split(',');
                }
            }
        });
        
        return filters;
    }
}