import { readJson } from '../utils/movies.js';
const movies = readJson('../movies.json');
import { randomUUID } from 'node:crypto';
import { validateMovie, validatePartialMovie } from '../schemas/movies.js';

export const getMovies = (genre) => {
  if (genre) {
    const Genre = genre.charAt(0).toUpperCase() + genre.slice(1);
    const result = movies.filter((movie) => movie.genre.includes(Genre));
    if (result.length) return result;
    return null;
  } else {
    return movies;
  }
};

export const getMovie = (id) => {
  const movie = movies.filter((movie) => movie.id === id);
  if (movie.length) return movie;
  return null;
};

export const createMovie = async (data) => {
  const result = validateMovie(data);
  if (!result.success) return result.error;
  const newMovie = { ...result.data, id: randomUUID() };
  try {
    movies.push(newMovie);
    writeFileSync('./movies.json', JSON.stringify(movies));
    return { success: newMovie };
  } catch (error) {
    return { error: error.message };
  }
};

export const updateMovie = async (id) => {
  const movieIndex = movies.findIndex((movie) => movie.id === id);
  if (movieIndex < 0) return { error: 'Movie not found' };
  const result = validatePartialMovie(req.body);
  if (!result.success) return { error: result.error };
  const updatedMovie = { ...movies[movieIndex], ...result.data };
  movies[movieIndex] = updatedMovie;
  try {
    writeFileSync('./movies.json', JSON.stringify(movies));
    return { success: movies[movieIndex] };
  } catch (error) {
    return { error: error.message };
  }
};

export const deleteMovie = (id) => {
  const movieIndex = movies.findIndex((movie) => movie.id === id);
  if (movieIndex < 0) return { error: 'Movie Not Found' };
  movies.splice(movieIndex, 1);
  writeFileSync('./movies.json', JSON.stringify(movies));
  return { success: 'Movie deleted' };
};
