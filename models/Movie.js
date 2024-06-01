const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: String,
    year: Number,
    movieProductionCompany: String,
    movieGenre: String,
    movieRuntime: String,
    movieDirector: String,
    movieDescription: String,
    movieImg: String,
    rating: String
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
