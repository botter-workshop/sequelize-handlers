var create = require('./handlers/create'),
    get = require('./handlers/get'),
    query = require('./handlers/query'),
    remove = require('./handlers/remove'),
    update = require('./handlers/update');

module.exports = {
    create: create,
    get: get,
    query: query,
    remove: remove,
    update: update
};