# sequelize-handlers
A module that simplifies adding Express handlers for Sequelize models.

## Prerequisites
The following are neceesary to utilize this module.

* express
* body-parser
* sequelize

The Express application must use `body-parser` so that the request body 
is parsed as JSON.

```
var express = require('express'),
    bodyParser = require('body-parser');
    
var app = express();

app.use(bodyParser.json());
```

## Usage
The module provides RESTful handlers for `create`, `get`, `query`, `remove`, and `update` 
operations. The handlers are expected to map to routes as below.

```
create  POST /resource
get     GET /resource/:id
query   GET /resource
remove  DELETE /resource/:id
update  PUT /resource/:id
```

To define a route simply pass your Sequelize model to the handler function.

```
var sequelizeHandlers = require('sequelize-handlers);

app.get('/hammers/:id', sequelizeHandlers.get(Model));
```

Below are examples of each handler being mapped to a route. This is within the context 
of a `hammers` resource with a corresponding Sequelize model `Hammer`.

### create
The `create` handler will return a `201` upon success.

```
app.post('/hammers', sequelizeHandlers.create(Hammer));
```

### get
The `get` handler will return a `200 OK` upon success. The handler will return a `404 Not Found` 
if the corresponding record could not be located.

```
app.get('/hammers/:id', sequelizeHandlers.get(Hammer));
```

### query
The `query` handler will always return paged results. The handler returns paging 
data in the `Content-Range` header in the form `start - end / total`.

Upon success the handler will return a `200 OK` if the entire collection was returned otherwise 
it will return a `206 Partial Content`.

```
app.get('/hammers', sequelizeHandlers.query(Hammer));
```

### remove
The `remove` handler will return a `204 No Content` upon success. The handler will return a `404 Not Found` 
if the corresponding record could not be located.

```
app.delete('/hammers/:id', sequelizeHandlers.remove(Hammer));
```

### update
The `update` handler will return a `200 OK` upon success. The handler will return a `404 Not Found` 
if the corresponding record could not be located.

```
app.put('/hammers/:id', sequelizeHandlers.update(Hammer));
```

## Error handling
Any uncaught exceptions that are thrown by Sequelize operations get passed to whatever 
error middleware is present in the Express application.

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