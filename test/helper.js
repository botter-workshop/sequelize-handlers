// setup

const Sequelize = require('sequelize');
var express = require('express');
var bodyParser = require('body-parser');
    
var app = express();

app.use(bodyParser.json());

const sequelize = new Sequelize('sqlite://:memory:');

const ModelHandler = require('../src/handler');

const User = sequelize.define('user', {
	  username: Sequelize.STRING,
	  birthday: Sequelize.DATE
	});


const testHandler = new ModelHandler(User);

app.get('/user', testHandler.query());
app.post('/user', testHandler.create());
app.get('/user/:id', testHandler.get());
app.put('/user/:id', testHandler.update());
app.delete('/user/:id', testHandler.remove());

before(function () {
	return User
		.sync({ force: true })
		.then(() => {
			const user = {
				username: 'test',
				birthday: '12/31/99'
			};
			
	    	return User.create(user);
		});
});

after(function () { 
	return sequelize.close();
});

module.exports = {
    app,
    User
};