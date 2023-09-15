import { Router } from 'express';
import {
  createMovie,
  deleteMovie,
  getMovie,
  getMovies,
} from '../controllers/movies.js';

export const moviesRouter = Router();
moviesRouter
  .get('/', async (req, res) => {
    const result = getMovies(req.query.genre);
    if (!result)
      return res
        .status(404)
        .json({ message: `Not found movies with genre '${req.query.genre}'` });
    return res.status(200).json(result);
  })

  .get('/:id', async (req, res) => {
    const result = getMovie(req.params.id);
    if (!result) return res.status(404).json({ message: 'Movie not found' });
    return res.json(result);
  })

  .post('/', async (req, res) => {
    const result = await createMovie(req.body);
    if (result.error) return res.status(400).json({ error: result.error });
    return res.status(200).json({ message: result.success });
  })

  .patch('/:id', async (req, res) => {
    const result = await updateMovie(req.params.id);
    if (result.success) return res.status(400).json({ error: result.error });
    return res.status(200).json({ message: result.success });
  })

  .delete('/:id', (req, res) => {
    const result = deleteMovie(req.params.id);
    if (result.error) return res.status(404).json({ error: result.error });
    return res.json({ message: result.success });
  });
