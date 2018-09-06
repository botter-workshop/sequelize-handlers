const assert = require('assert');

const { parse, parseString, parseInteger, parseJson, parseSort } = require('../src/parser');
const { User } = require('./app');

describe('parser', function () {
    describe('parse', function () {
        it('should parse basic params', function () {
            const params = {
                fields: 'username,birthday',
                limit: 10,
                offset: 0,
                sort: 'username,-birthday'
            };
            
            const output = parse(params, User);
            
            const expected = {
                attributes: [
                    'username',
                    'birthday'
                ],
                limit: 10,
                offset: 0,
                where: {},
                order: [
                    ['username', 'ASC'],
                    ['birthday', 'DESC']
                ]
            };
            
            assert.deepEqual(output, expected);
        });
        
        it('should parse \'where\' params', function () {
            const params = {
                fake: true,
                fields: 'username,birthday',
                limit: 10,
                offset: 0,
                sort: 'username,-birthday',
                username: 'test'
            };
            
            const output = parse(params, User);
            
            const expected = {
                attributes: [
                    'username',
                    'birthday'
                ],
                limit: 10,
                offset: 0,
                where: {
                    'username': ['test']
                },
                order: [
                    ['username', 'ASC'],
                    ['birthday', 'DESC']
                ]
            };
            
            assert.deepEqual(output, expected);
        });
    });

    describe('parse string', function () {
        it('should split comma-delimited string', function () {
            const input = 'A,B,C';
            const expected = ['A', 'B', 'C'];
            
            const output = parseString(input);
            
            assert.deepEqual(output, expected);
        });
        
        it('should return undefined for a non-string argument', function () {
            assert.equal(parseString(), undefined);
        });
    });

    describe('parse integer', function () {
        it('should return the integer value of a string', function () {
            assert.equal(parseInteger('54'), 54);
        });
        
        it('should return undefined for invalid string inputs', function () {
            assert.equal(parseInteger('test'), undefined);
        });
        
        it('should return null for null inputs', function () {
            assert.equal(parseInteger(), undefined);
        });
    });

    describe('parse json', function () {
        it('should return the object encoded in the string', function () {
            const input = '{"test":0,"thing":"hello"}';
            const expected = { test:0, thing:'hello' };
            
            assert.deepEqual(parseJson(input), expected);
        });
        
        it('should return the comma-split string if it is incorrectly formatted', function () {
            const input = 'this,is,not,json';
            const expected = ['this', 'is', 'not', 'json'];
            
            assert.deepEqual(parseJson(input), expected);
        });
    });

    describe('parse sort', function () {
        it('should return undefined for null inputs', function () {
            assert.equal(parseSort(), undefined);
        });
        
        it('should interpret sort strings properly', function () {
            const input = 'stuff,-things,otherstuff';
            const expected = [
                ['stuff', 'ASC'], 
                ['things', 'DESC'], 
                ['otherstuff', 'ASC']
            ];
            
            assert.deepEqual(parseSort(input), expected);
        });
    });
});
