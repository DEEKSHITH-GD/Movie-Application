console.log('movie app... ... ...');
const express = require('express');
const app = express();
const path = require('path');
const assert = require('assert');
const mongoose = require("mongoose");
const config = require('./config.js');
const movieRouter = require('./routes/movies.js');
const methodOverride = require('method-override');

app.use(methodOverride(function(req, res){
  if(req.body && typeof req.body === 'object' && '_method' in req.body){
      var method = req.body._method;
      delete req.body._method;
      return method;
  }
}))

// Connect to MongoDB using Mongoose
mongoose.connect(config.connect.dbConnectString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views/'))

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', movieRouter);

// Start the Express server once MongoDB is connected
app.listen(config.connect.port, () => {
    console.log('Listening to port:' + config.connect.port);
});