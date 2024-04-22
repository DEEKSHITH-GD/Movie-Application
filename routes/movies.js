const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
//const ObjectId = require('mongodb').ObjectId;

var movieId;
// GET /movies - Get all movies
router.get('/', async (req, res) => {
    try {
        console.log('Fetching movies...');
        const movies = await Movie.find();
        console.log('Movies:', movies);
        //res.json(movies);
        res.render('index.ejs', { movies: movies });
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/addmoviepage', async (req, res) => {
    res.render('addMoviePage.ejs', { i: 1 });
});

router.post('/addmovie', async (req, res) => {
    try {
        await Movie.create({
            "title": req.body.title,
            "year": req.body.year,
            "movieProductionCompany": req.body.movieProductionCompany,
            "movieGenre": req.body.movieGenre,
            "movieRuntime": req.body.movieRuntime,
            "movieDirector": req.body.movieDirector,
            "movieDescription": req.body.movieDescription,
            "movieImg": req.body.movieImg,
            "movieImageContentType": req.body.movieImageContentType
        });

        res.redirect('/');
    } catch (error) {
        // Handle errors
        console.error('Error adding movie:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/editmovie/:movieId', async (req, res) => {
    try {
        movieId = req.params.movieId;
        console.log(movieId);
        let movieData = await Movie.findById(movieId); // Use findById instead of find
        res.render('editMoviePage.ejs', { movieData: movieData }); // Pass movieData to the view
    } catch (error) {
        console.error('Error editing movie:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/updatemovie/:movieId', async(req, res)=>{
    try{
        const updatedMovieData = {
            title: req.body.title,
            year: req.body.year,
            movieProductionCompany: req.body.movieProductionCompany,
            movieGenre: req.body.movieGenre,
            movieRuntime: req.body.movieRuntime,
            movieDirector: req.body.movieDirector,
            movieDescription: req.body.movieDescription,
            movieImg: req.body.movieImg,
            movieImageContentType: req.body.movieImageContentType
        };
        console.log(movieId);
        const update = await Movie.findByIdAndUpdate(movieId, updatedMovieData, {new: true})

        if(!update){
            return res.status(404).json({message: 'Movie not found'})
        }
        res.redirect('/');
    }catch{
        console.error('Error updating movie:', error);
        res.status(500).json({ message: error.message });
    }
})

router.delete('/deleteMovie', async(req, res) =>{
    try{
        let movieDeleteId = req.body.deleteId
        const deleted = await Movie.findByIdAndDelete(movieDeleteId)
        if(!deleted){
            return res.status(404).json({message:'Movie not found'})
        }
        res.json(deleted)
    }catch{
        console.error('Error Deleting movie:', error);
        res.status(500).json({ message: error.message });
    }
})

// Other routes for CRUD operations on movies

module.exports = router;
