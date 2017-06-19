const HttpStatusError = require('./errors/HttpStatusError');

class Handler {
    constructor(model, options = { limit: 50, offset: 0 }) {
        this.model = model;
        this.limit = options.limit;
        this.offset = options.offset;
    }
    
    async get(req, res, next) {
        try {
            const data = await this.findOne(req.params);
            res.send(data);
        } catch (error) {
            next(error);
        }
    }
    
    async destroy(req, res, next) {
        try {
            const data = await this.findOne(req.params);
            await data.destroy();
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }
    
    async update(req, res, next) {
        try {
            const data = await this.findOne(req, res, next);
            const result = await data.updateAttributes(req.body);
            res.send(result);
        } catch (error) {
            next(error);
        }
    }
    
    async findOne(params, options = { where: {} }) {
        const { rawAttributes } = this.model;
        
        for (let key in params) {
            if (params.hasOwnProperty(key) && rawAttributes.hasOwnProperty(key)) {
                options[key] = params[key];
            }
        }
        
        const data = await this.model.findOne(options);
            
        if (!data) {
            throw new HttpStatusError(404, 'Not Found');
        }
        
        return data;
    }
    
    async findAndCountAll(params, options = { where: {} }) {
        const { fields, limit = this.limit, offset = this.offset, sort, ...filters } = params;
        const { rawAttributes } = this.model;
        
        for (let key in filters) {
            if (filters.hasOwnProperty(key) && rawAttributes.hasOwnProperty(key)) {
                const value = filters[key];
                try {
                    options.where[key] = JSON.parse(value);
                } catch (error) {
                    options.where[key] = value.split(',');
                }
            }
        }
        
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
        
        const { count, rows } = await this.Mode.findAndCountAll(options);
        
        return {
            start: options.offset,
            end: Math.max(count, options.offset + offset.limit),
            count,
            rows
        };    
    }
    
    async query(req, res, next) {
        try {
            const { start, end, count, rows } = await this.findAndCountAll(req.query);
            
            res.set('Content-Range', `${start}-${end}/${count}`);
            res.status(end === count ? 200 : 206);
            res.send(rows);
        } catch (error) {
            next(error);   
        }
    }
}