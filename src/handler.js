const _ = require('lodash');
const { parse } = require('./parser');
const { distinct, raw } = require('./transforms');

class ModelHandler {
    constructor(Model) {
        this.Model = Model;
    }
    
    create() {
        return [
            raw,
            async (req, res, next) => {
                try {
                    const row = await this.Model.create(req.body);
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
                    res.send(res.transform(row));
                } catch (error) {
                    next(error);
                }
            }
        ];
    }
    
    query () {
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
                    const row = await this.findOne(req, res, next);
                    const updated = await row.updateAttributes(req.body);
                    res.send(updated);
                } catch (error) {
                    next(error);
                }
            }
        ];
    }
    
    async findOne(params, options) {
        options = _.merge(parse(params, this.Model), options);
        
        return await this.Model.findOne(options);
    }
    
    async findAndCountAll(params, options) {
        options = _.merge(parse(params, this.Model), options);
        
        const { count, rows } = await this.Model.findAndCountAll(options);
        
        const start = options.offset;
        const end = Math.min(count, options.offset + options.limit);
        
        return { rows, start, end, count };
    }
}

module.exports = ModelHandler;