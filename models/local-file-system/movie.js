import { readJson } from '../../utils/movies.js';
const movies = readJson('../movies.json');

import { randomUUID } from 'node:crypto';

export class MovieModel {
  static async getAll({ genre }) {
    if (genre) {
      const result = movies.filter((movie) =>
        movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
      );
      if (!result.length)
        return { message: `Not movie found with genre '${genre}'` };
      return result;
    }
    return movies;
  }

  static async getById({ id }) {
    const movie = movies.filter((movie) => movie.id === id);
    if (movie.length) return movie;
    return null;
  }

  static async create({ input }) {
    const newMovie = { id: randomUUID(), ...input };
    try {
      movies.push(newMovie);
      writeFileSync('./movies.json', JSON.stringify(movies));
      return { success: newMovie };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete({ id }) {
    const movieIndex = movies.findIndex((movie) => movie.id === id);
    if (movieIndex < 0) return { error: 'Movie Not Found' };
    movies.splice(movieIndex, 1);
    writeFileSync('./movies.json', JSON.stringify(movies));
    return { success: 'Movie deleted' };
  }

  static async update({ id, input }) {
    const movieIndex = movies.findIndex((movie) => movie.id === id);
    if (movieIndex < 0) return { error: 'Movie not found' };
    const updatedMovie = { ...movies[movieIndex], ...input };
    movies[movieIndex] = updatedMovie;
    try {
      writeFileSync('./movies.json', JSON.stringify(movies));
      return { success: movies[movieIndex] };
    } catch (error) {
      return { error: error.message };
    }
  }
}
