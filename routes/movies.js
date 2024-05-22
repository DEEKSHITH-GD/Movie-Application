const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
const app = express();

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const MAGIC_NUMBERS = {
    jpg: 'ffd8ffe0',
    jpg1: 'ffd8ffe1',
    png: '89504e47',
    gif: '47494638'
};

function checkMagicNo(magic) {
    console.log('Uploaded file magic number:', magic); // Debugging: Log magic number
    if (magic === MAGIC_NUMBERS.jpg || magic === MAGIC_NUMBERS.jpg1 || magic === MAGIC_NUMBERS.png || magic === MAGIC_NUMBERS.gif) {
        return true;
    } else {
        console.log('Invalid magic number:', magic); // Debugging: Log invalid magic number
        return false;
    }
}

const imgStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: imgStorage });

// GET /movies - Get all movies
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find();
        res.render('index.ejs', { movies: movies });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/addmoviepage', (req, res) => {
    res.render('addMoviePage.ejs', { i: 1 });
});

router.post('/addmovie', upload.single('posterImg'), async (req, res) => {
    if (err) {
        console.error('Multer error:', err);  // Log the multer error details
        return res.status(500).json({ message: 'File upload failed.', error: err.message });
    } else {
        try {
            const filePath = path.resolve(__dirname, '../uploads', req.file.filename);
            console.log('Uploaded file path:', filePath);  // Debugging: Log file path

            let bitmap = fs.readFileSync(filePath).toString('hex', 0, 4);

            if (!checkMagicNo(bitmap)) {
                fs.unlinkSync(filePath);
                return res.status(400).json({ message: 'File is not valid.' });
            }

            await Movie.create({
                title: req.body.title,
                year: req.body.year,
                movieProductionCompany: req.body.movieProductionCompany,
                movieGenre: req.body.movieGenre,
                movieRuntime: req.body.movieRuntime,
                movieDirector: req.body.movieDirector,
                movieDescription: req.body.movieDescription,
                movieImg: req.file.filename,
                movieImageContentType: req.file.mimetype
            });

            res.redirect('/');
        } catch (error) {
            console.error('Error adding movie:', error);  // Log the error details
            res.status(500).json({ message: error.message });
        }
    }
});

router.get('/getPoster/:movieID', async (req, res) => {
    try {
        const movieID = req.params.movieID;
        const movie = await Movie.findById(movieID);

        if (!movie) {
            return res.status(404).send('Movie not found');
        }

        const movieImg = movie.movieImg;
        const imgPath = path.resolve(__dirname, '../uploads', movieImg);

        if (fs.existsSync(imgPath)) {
            res.sendFile(imgPath);
        } else {
            res.status(404).send('Image not found');
        }
    } catch (err) {
        console.error('Error retrieving movie poster:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/editmovie/:movieId', async (req, res) => {
    try {
        const movieId = req.params.movieId;
        const movieData = await Movie.findById(movieId);
        res.render('editMoviePage.ejs', { movieData: movieData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/updatemovie/:movieId', upload.single('movieImgEdit'), async (req, res) => {
    try {
        const movieId = req.params.movieId;
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        let movieFileName = movie.movieImg;
        if (req.file) {
            const filePath = path.join(__dirname, '../uploads', req.file.filename);
            const bitmap = fs.readFileSync(filePath).toString('hex', 0, 4);

            if (!checkMagicNo(bitmap)) {
                fs.unlinkSync(filePath);
                console.log('File is not valid');
                return res.status(400).json({ message: 'Invalid file format' });
            } else {
                console.log('File is uploaded');
                movieFileName = req.file.filename;
                if (movie.movieImg) {
                    fs.unlinkSync(path.join(__dirname, '../uploads', movie.movieImg));
                }
            }
        }

        const updatedMovieData = {
            title: req.body.title,
            year: req.body.year,
            movieProductionCompany: req.body.movieProductionCompany,
            movieGenre: req.body.movieGenre,
            movieRuntime: req.body.movieRuntime,
            movieDirector: req.body.movieDirector,
            movieDescription: req.body.movieDescription,
            movieImg: movieFileName,
            movieImageContentType: req.file ? req.file.mimetype : movie.movieImageContentType
        };

        const updatedMovie = await Movie.findByIdAndUpdate(movieId, updatedMovieData, { new: true });
        res.redirect('/');
    } catch (error) {
        console.error('Error updating movie:', error);
        res.status(500).json({ message: error.message });
    }
});

router.delete('/deleteMovie', async (req, res) => {
    try {
        const movieDeleteId = req.body.deleteId;
        const deleted = await Movie.findByIdAndDelete(movieDeleteId);
        if (!deleted) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json(deleted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
