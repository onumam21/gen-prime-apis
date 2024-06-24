import express from 'express';
import db from '../prisma.client.js';

// create router
const router = express.Router();

// get all movies
router.get('/', async (req, res, next) => {
    try {
        const movies = await db.movie.findMany();
        return res.json(movies);
    } catch (error) {
        next(error);
    }
});

// get single movie
router.get('/:id', async (req, res, next) => {
    const params = req.params;
    const id = params.id;

    try {
        const movie = await db.movie.findUnique({ where: { id: +id } });

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json(movie);
    } catch (error) {
        next(error);
    }
});

// create new movie
router.post('/', async (req, res, next) => {
    const { title, description, image, releaseDate, genre, rating, duration } = req.body;

    if (!title || !description || !image || !releaseDate || !genre || !rating || !duration) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate Release Date
    if (new Date(releaseDate) > new Date()) {
        return res.status(400).json({ message: 'Release date must be in the past' });
    }

    // Validate Rating
    if (rating < 0 || rating > 10) {
        return res.status(400).json({ message: 'Rating must be between 0 and 10' });
    }

    // Validate Duration
    if (duration < 0) {
        return res.status(400).json({ message: 'Duration must be greater than 0' });
    }

    try {
        const newMovie = await db.movie.create({
            data: {
                title: title,
                description: description,
                image: image,
                releaseDate: new Date(releaseDate),
                genre: genre,
                rating: +rating,
                duration: +duration,
            },
        });
        res.status(201).json(newMovie);
    } catch (error) {
        next(error);
    }
});

// update movie
router.patch('/:id', async (req, res, next) => {
    const id = req.params.id;

    try {
        const movie = await db.movie.findUnique({ where: { id: +id } });

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        const updatedData = req.body;
        const updatedMovie = await db.movie.update({
            where: { id: +id },
            data: updatedData,
        });

        res.json(updatedMovie);
    } catch (error) {
        next(error);
    }
});

export default router;
