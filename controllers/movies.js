import { MovieModel } from '../models/movie.js';
import { validateMovie, validatePartialMovie } from '../schemas/movies.js';

export class MovieController {
  static async getAll(req, res) {
    const { genre } = req.query;
    const result = await MovieModel.getAll({ genre });
    res.json(result);
  }

  static async getById(req, res) {
    const { id } = req.params;
    const result = await MovieModel.getById({ id });
    if (!result) return res.status(404).json({ message: 'Movie not found' });
    return res.json(result);
  }

  static async create(req, res) {
    const result = validateMovie(req.body);
    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }
    const response = await MovieModel.create({ input: result.data });
    if (response.error) {
      return res.status(400).json({ error: response.error });
    }
    return res.status(200).json({ message: response.success });
  }

  static async delete(req, res) {
    const { id } = req.params;
    const result = await MovieModel.delete({ id });
    if (result.error) return res.status(404).json({ error: result.error });
    return res.json({ message: result.success });
  }

  static async update(req, res) {
    const { id } = req.params;
    const result = validatePartialMovie(req.body);
    if (!result.success) {
      return { error: JSON.parse(result.error.message) };
    }
    const response = await MovieModel.update({ id, input: result.data });
    if (response.success)
      return res.status(400).json({ error: response.error });
    return res.status(200).json({ message: response.success });
  }
}
