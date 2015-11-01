# sequelize-handlers
A module that simplifies adding Express handlers for Sequelize models.

## An example application
This command will install all the modules necessary to run the example.

```
npm install express body-parser sqlite3 sequelize sequelize-handlers
```

Below is a basic example of an Express application that sets up a Sequelize 
model and adds all RESTful routes for it.

```
// NPM Modules
var express = require('express'),
    bodyParser = require('body-parser'),
    Sequelize = require('sequelize'),
    sequelizeHandlers = require('sequelize-handlers');

// Create the Sequelize instance
var sequelize = new Sequelize('sqlite://database.sqlite');

// Define a Sequelize model
var Hammer = sequelize.define('Hammer', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
    },
    name: {
        type: Sequelize.STRING
    },
    type: {
        type: Sequelize.STRING
    }
});

// Create the Express application
var app = express();

// Setup our application so that the request body is parsed as JSON
app.use(bodyParser.json());

// Add a create route
app.post('/hammers', sequelizeHandlers.create(Hammer));

// Add a get route
app.get('/hammers/:id', sequelizeHandlers.get(Hammer));

// Add a query route
app.get('/hammers', sequelizeHandlers.query(Hammer));

// Add a remove route
app.delete('/hammers/:id', sequelizeHandlers.remove(Hammer));

// Add an update route
app.put('/hammers/:id', sequelizeHandlers.update(Hammer));

// Synchronize our models and start the application
sequelize
    .sync()
    .then(start);

function start() {
    app.listen(process.env.PORT || 8080, function () {
        console.log('Listening...');
    });
}

```