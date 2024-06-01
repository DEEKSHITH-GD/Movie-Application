console.log('movie app... ... ...');
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require("mongoose");
const config = require('./config.js');
const movieRouter = require('./routes/movies.js');
const methodOverride = require('method-override');
const Movie = require('./models/Movie'); 
const Review = require('./models/Review.js');
const { Types: { ObjectId } } = mongoose;

app.use(methodOverride('_method'));

// Connect to MongoDB using Mongoose
mongoose.connect(config.connect.dbConnectString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', movieRouter);

// Start the Express server once MongoDB is connected
mongoose.connection.once('open', () => {
  app.listen(config.connect.port, () => {
    console.log('Listening to port:' + config.connect.port)
  });
});

// Route for moviepage
app.get('/moviepage', async (req, res) => {
  try {
    const movies = await Movie.aggregate([
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "movieId",
          as: "allreviewslist"
        }
      }
    ]);
    res.render('moviepage.ejs', { title: 'Movie Page', moviesdata: movies });
  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/getmoviedetails/:movieId', async (req, res) => {
  try {
    const movieID = req.params.movieId;
    const movieData = await Movie.aggregate([
      {
        $match: {
          _id: new ObjectId(movieID)
        }
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "movieId",
          as: "allreviews"
        }
      }
    ]);
    if (!movieData || movieData.length === 0) {
      return res.status(404).send('Movie not found');
    }
    res.render('reviewpage', { moviedata: movieData[0] });
  } catch (err) {
    console.error('Error fetching movie details:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/savereview', async (req, res) => {
  try {
    if (req.body) {
      await Review.create({
        movieId: new ObjectId(req.body.movieId),
        username: req.body.username,
        reviewtitle: req.body.reviewtitle,
        reviewdesc: req.body.reviewdesc,
        review: req.body.review
      });
      res.redirect('/moviepage');
    }
  } catch (err) {
    console.error('Error saving review:', err);
    res.status(500).send('Internal Server Error');
  }
});
