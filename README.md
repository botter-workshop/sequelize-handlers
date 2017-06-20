# sequelize-handlers
A module that simplifies adding RESTful Express handlers for Sequelize models.

## Prerequisites
The following are necessary to utilize this module.

* express
* body-parser
* sequelize

The Express application must use `body-parser` so that the request body 
is parsed as JSON.

```js
var express = require('express'),
    bodyParser = require('body-parser');
    
var app = express();

app.use(bodyParser.json());
```

## Install

```console
$ npm install sequelize-handlers
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

```js
const { ModelHandler } = require('sequelize-handlers');

const hammerHandler = new ModelHandler(Model);

app.get('/hammers/:id', hammerHandler.get());
```

## API

Below are examples of each handler being mapped to a route. This is within the context 
of a `hammers` resource with a corresponding Sequelize model `Hammer`.

### create(model)
The `create` handler will return a `201` upon success.

```js
app.post('/hammers', hammerHandler.create());
```

#### *Request example*

```
POST /hammers
Content-Type: application/json
{
	name: 'claw',
	type: 'metal'
}
```

### get(model)
The `get` handler will return a `200 OK` upon success. The handler will return a `404 HttpStatusError` 
if the corresponding record could not be located.

```js
app.get('/hammers/:id', hammerHandler.get());
```

#### *Request example*
```
GET /hammers/1
```

### query(model)
The `query` handler will always return paged results. The handler returns paging 
data in the `Content-Range` header in the form `start - end / total`.

Upon success the handler will return a `200 OK` if the entire collection was returned otherwise 
it will return a `206 Partial Content`.

```js
app.get('/hammers', hammerHandler.query());
```

#### *Request example*
```
GET /hammers
```

#### Retrieving Specific Fields

To return only specific fields for a result set you can utilize the `fields` parameter. This 
parameter accepts a comma-separated list. 

A call returning only `id` and `name` for a result set would look like this.

```
GET /hammers?fields=id,name
```

#### Filtering

You can perform exact-match filtering on any of a model's fields by using the field name as the key 
and supplying it with a value. These parameters accept a comma-separated list.

A call returning a result set for records with `type` of `new` or `existing`.

```
GET /hammers?type=new,existing
```

Fields can also now be filtered using Sequelize [operators](http://docs.sequelizejs.com/manual/tutorial/querying.html#operators). 
These operators allow you to perform more complex filters like below.

```
// Find hammers where the type is NULL.

GET /hammers?type={"$ne":null}
```

```
// Find hammers where the weight is greater than 5 AND less than 10.

GET /hammers?weight={"$and":{$gt":5,"$lt":10}}
```

#### Sorting

To sort a result set based on one or several fields you can utilize the `sort` parameter. This 
parameters accepts a comma-separated list. 

Results will be sorted in the order of the fields provided. The default sorting order for fields 
is ascending. Fields can be sorted in descending order by prefixing them with a dash (`-`).

A call sorting a result by `id` ascending and then `name` descending would look like this.

```
GET /hammers?sort=id,-name
```

#### Offset and Limit

Query results are always paged. The `query` handler leverages the `offset` and `limit` 
parameters to facilitate this.

When neither of these parameters are explicitly supplied the handler will assume the default 
`limit` of `50`.

`offset` is a number indicating the start position in the result set you want to return.

`limit` is a number indicating how many records past the start position you want returned.  

A call with a result set starting at `5` and returning no more than `25` records would look like this.

```
GET /hammers?offset=5&limit=25
```

If there were `50` records in total, the returned `Content-Range` header would look like 
this.

```
Content-Range: 5-30/50
```

### remove(model)
The `remove` handler will return a `204 No Content` upon success. The handler will return a `404 HttpStatusError` 
if the corresponding record could not be located.

```js
app.delete('/hammers/:id', hammerHandler.remove());
```

#### *Request example*

```
DELETE /hammers/1
```

### update(model)
The `update` handler will return a `200 OK` upon success. The handler will throw an `404 HttpStatusError` 
if the corresponding record could not be located.

```js
app.put('/hammers/:id', hammerHandler.update());
```

#### *Request example*

```
PUT /hammers/1
Content-Type: application/json
{
	id: 12,
	name: 'mallet',
	type: 'wood'
}
```

## Error handling
Any HTTP status errors are thrown as `HttpStatusError`. They will have a `status` property 
containing the HTTP status code that was thrown (i.e. 404).

Any uncaught exceptions that are thrown in the handlers will be passed as-is to the 
Express application's error middleware.

## An example application
This command will install all the modules necessary to run the example.

```console
$ npm install express body-parser sqlite3 sequelize sequelize-handlers
```

Below is a basic example of an Express application that sets up a Sequelize 
model and adds all RESTful routes for it.

```js
// NPM Modules
const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const { ModelHandler } = require('sequelize-handlers');

// Create the Sequelize instance
const sequelize = new Sequelize('sqlite://database.sqlite');

// Define a Sequelize model
const Hammer = sequelize.define('Hammer', {
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

// Create a handler instance
const hammerHandler = new ModelHandler(Hammer);

// Create the Express application
const app = express();

// Setup our application so that the request body is parsed as JSON
app.use(bodyParser.json());

// Add a create route
app.post('/hammers', hammerHandler.create());

// Add a get route
app.get('/hammers/:id', hammerHandler.get());

// Add a query route
app.get('/hammers', hammerHandler.query());

// Add a remove route
app.delete('/hammers/:id', hammerHandler.remove());

// Add an update route
app.put('/hammers/:id', hammerHandler.update());

// Synchronize our models and start the application
sequelize
    .sync()
    .then(start);

function start() {
    app.listen(process.env.PORT || 8080, () => {
        console.log('Listening...');
    });
}
```
