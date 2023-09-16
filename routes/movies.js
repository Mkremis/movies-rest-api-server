import { Router } from 'express';
import { MovieController } from '../controllers/movies.js';

export const moviesRouter = Router();

moviesRouter
  .get('/', MovieController.getAll)

  .get('/:id', MovieController.getById)

  .post('/', MovieController.create)

  .delete('/:id', MovieController.delete)

  .patch('/:id', MovieController.update);
