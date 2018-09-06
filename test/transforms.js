const assert = require('assert');
const { raw } = require('../src/transforms');

describe('transforms', function () {
    describe('raw', function () {
        it('should not apply default transform', function () {
             const transform = data => null;
             const res = { transform };
             
             raw(null, res, function () {});
             assert.deepEqual(transform, res.transform);
        });     
    });
});