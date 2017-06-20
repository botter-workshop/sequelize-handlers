const _ = require('lodash');
const { HttpStatusError } = require('./errors');
const { parse } = require('./parser');
const { distinct, raw } = require('./transforms');

class ModelHandler {
    constructor(model, defaults = { limit: 50, offset: 0 }) {
        this.model = model;
        this.defaults = defaults;
    }
    
    create() {
        return [
            raw,
            async (req, res, next) => {
                try {
                    const row = await this.model.create(req.body);
                    res.status(201);
                    res.send(res.transform(row));
                } catch (error) {
                    next(error);
                }
            }
        ];
    }
    
    get() {
        return [
            raw,
            async (req, res, next) => {
                try {
                    const row = await this.findOne(req.params);
                    
                    if (!row) {
                        throw new HttpStatusError(404, 'Not Found');
                    }
                    
                    res.send(res.transform(row));
                } catch (error) {
                    next(error);
                }
            }
        ];
    }
    
    query() {
        return [
            distinct,
            raw,
            async (req, res, next) => {
                try {
                    const { rows, start, end, count } = await this.findAndCountAll(req.query);
                    
                    res.set('Content-Range', `${start}-${end}/${count}`);
                    
                    if (count > end) {
                        res.status(206);
                    } else {
                        res.status(200);
                    }
                    
                    res.send(res.transform(rows));
                } catch (error) {
                    next(error);   
                }
            }
        ];
    }
    
    remove() {
        return [
            async (req, res, next) => {
                try {
                    const row = await this.findOne(req.params);
                    
                    if (!row) {
                        throw new HttpStatusError(404, 'Not Found');
                    }
                    
                    await row.destroy();
                    res.sendStatus(204);
                } catch (error) {
                    next(error);
                }
            }
        ];
    }
    
    update() {
        return [
            raw,
            async (req, res, next) => {
                try {
                    const row = await this.findOne(req.params);
                    
                    if (!row) {
                        throw new HttpStatusError(404, 'Not Found');
                    }
                    
                    const updated = await row.updateAttributes(req.body);
                    res.send(res.transform(updated));
                } catch (error) {
                    next(error);
                }
            }
        ];
    }
    
    async findOne(params, options) {
        options = _.merge(parse(params, this.model), options);

        return await this.model.findOne(options);
    }
    
    async findAndCountAll(params, options) {
        params = _.defaults(params, this.defaults);
        options = _.merge(parse(params, this.model), options);
        
        let { count, rows } = await this.model.findAndCountAll(options);
        
        if (_.isArray(count)) {
            count = _.reduce(count, (sum, row) => {
                return sum + row.count;
            }, 0); 
        }
        
        const start = options.offset;
        const end = Math.min(count, options.offset + options.limit);
        
        return { rows, start, end, count };
    }
}

module.exports = ModelHandler;