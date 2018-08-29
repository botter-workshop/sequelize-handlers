const { parse, parseString, parseInteger, parseJson, parseSort } = require('../src/parser');
const Sequelize = require('sequelize');

var { User } = require('./helper');

var chai = require('chai');
expect = chai.expect;

describe('Parser', function() {
    describe('parse()', function() {
        it('should parse basic params', function() {
            params = {
                fields: 'username,birthday',
                limit: 10,
                offset: 0,
                sort: 'username,-birthday'
            }
            var output = parse(params, User);
            expected = {
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
            }
            expect(output).to.deep.equal(expected);
        });
        it('should parse "where" params', function() {
            params = {
                fields: 'username,birthday',
                limit: 10,
                offset: 0,
                sort: 'username,-birthday',
                username: 'test'
            }
            var output = parse(params, User);
            expected = {
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
            }
            expect(output).to.deep.equal(expected);
        });
    });

    describe('parseString()', function() {
        it('should separate a comma-delimited string', function() {
            expect(parseString('test0,test1,test2')).to.deep.equal(['test0', 'test1', 'test2'])
        });
        it('should return undefined for a non-string argument', function() {
            expect(parseString()).to.be.undefined;
        });
    });

    describe('parseInteger()', function() {
        it('should return the integer value of a string', function() {
            expect(parseInteger('54')).to.equal(54);
        });
        it('should return undefined for invalid string inputs', function() {
            expect(parseInteger('test')).to.be.undefined;
        });
        it('should return null for null inputs', function() {
            expect(parseInteger()).to.be.undefined;
        });
    });

    describe('parseJson()', function() {
        it('should return the object encoded in the string', function() {
            expect(parseJson('{"test":0,"thing":"hello"}')).to.deep.equal({test:0, thing:'hello'});
        });
        it('should return the comma-split string if it is incorrectly formatted', function() {
            expect(parseJson('this,is,not,json')).to.deep.equal(['this', 'is', 'not', 'json']);
        });
    });

    describe('parseSort()', function() {
        it('should return undefined for null inputs', function() {
            expect(parseSort()).to.be.undefined;
        });
        it('should interpret sort strings properly', function() {
            expect(parseSort('stuff,-things,otherstuff')).to.deep.equal([['stuff', 'ASC'], ['things', 'DESC'], ['otherstuff', 'ASC']]);
        });
    });
});
