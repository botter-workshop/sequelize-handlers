const Sequelize = require('sequelize');
const express = require('express');
const bodyParser = require('body-parser');
    
const app = express();
app.use(bodyParser.json());

const sequelize = new Sequelize('sqlite://:memory:');

const { ModelHandler } = require('../');

const User = sequelize.define('user', {
  username: Sequelize.STRING,
  birthday: Sequelize.DATE
});

const userHandler = new ModelHandler(User);

app.get('/users', userHandler.query());
app.post('/users', userHandler.create());
app.get('/users/:id', userHandler.get());
app.put('/users/:id', userHandler.update());
app.delete('/users/:id', userHandler.remove());

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