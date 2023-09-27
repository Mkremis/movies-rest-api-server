import { validateMovie, validatePartialMovie } from "../schemas/movies.js";

export class MovieController {
  constructor({ movieModel }) {
    this.movieModel = movieModel;
  }
  getAll = async (req, res) => {
    const { genre } = req.query;
    const result = await this.movieModel.getAll({ genre });
    res.json(result);
  };

  getById = async (req, res) => {
    const { id } = req.params;
    const result = await this.movieModel.getById({ id });
    if (!result) return res.status(404).json({ message: "Movie not found" });
    return res.json(result);
  };

  create = async (req, res) => {
    const result = validateMovie(req.body);
    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }
    const response = await this.movieModel.create({ input: result.data });
    if (response.error) {
      return res.status(400).json({ error: response.error });
    }
    return res.status(200).json({ message: response.success });
  };

  delete = async (req, res) => {
    const { id } = req.params;
    const result = await this.movieModel.delete({ id });
    if (result.error) return res.status(404).json({ error: result.error });
    return res.json({ message: result.success });
  };

  update = async (req, res) => {
    const { id } = req.params;
    const result = validatePartialMovie(req.body);

    if (!result.success) {
      return res.json({ error: JSON.parse(result.error.message) });
    }
    const response = await this.movieModel.update({ id, input: result.data });
    if (!response.success)
      return res.status(400).json({ error: response.error });
    return res.status(200).json({ message: response.success });
  };
}
