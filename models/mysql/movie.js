import mysql from "mysql2/promise";
import { randomUUID } from "node:crypto";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  port: 3306,
  database: "moviesdb",
});

export class MovieModel {
  static async getAll({ genre }) {
    try {
      let lowerCaseGenre = ""; // Declarar y asignar un valor predeterminado

      if (genre) {
        lowerCaseGenre = genre.toLowerCase(); // Asignar el valor si se proporciona un género
      }

      let query = `
    SELECT
      BIN_TO_UUID(movie.id) AS id,
      movie.title,
      movie.year,
      movie.director,
      movie.duration,
      movie.poster,
      movie.rate
    FROM
      movie
  `;

      if (genre) {
        query += `
      JOIN movie_genres ON movie.id = movie_genres.movie_id
      JOIN genre ON movie_genres.genre_id = genre.id
      WHERE
        LOWER(genre.name) = ?
    `;
      }

      const [movies] = await pool.query(query, [lowerCaseGenre]);

      if (!movies.length) {
        return { message: `There are no movies with genre '${genre}'` };
      }

      return movies;
    } catch (err) {
      return { error: "Something was wrong!" };
    }
  }

  static async getById({ id }) {
    try {
      const [movies] = await pool.query(
        `SELECT BIN_TO_UUID(id) AS id, title, year, director, duration, poster, rate FROM movie WHERE id = UUID_TO_BIN(?)`,
        [id]
      );
      if (movies.length) return movies[0];
      return null;
    } catch (error) {
      return { error: "Something was wrong!" };
    }
  }

  static async create({ input }) {
    try {
      const {
        title,
        year,
        director,
        duration,
        genre: genreInput,
        poster,
        rate,
      } = input;

      // Genera un UUID para la película
      const [uuidResult] = await pool.query("SELECT UUID() AS uuid");
      const [{ uuid }] = uuidResult;

      // Inserta la película en la base de datos
      await pool.query(
        "INSERT INTO movie (id, title, year, director, duration, poster, rate) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?)",
        [uuid, title, year, director, duration, poster, rate]
      );

      // Obtén los IDs de género para los géneros proporcionados
      const genreIds = [];
      for (const genre of genreInput) {
        const [genreResult] = await pool.query(
          "SELECT id FROM genre WHERE name = ?",
          [genre.toLowerCase()]
        );
        if (genreResult.length > 0) {
          genreIds.push(genreResult[0].id);
        }
      }

      // Inserta los géneros de la película en la tabla movie_genres
      for (const genreId of genreIds) {
        await pool.query(
          "INSERT INTO movie_genres (movie_id, genre_id) VALUES (UUID_TO_BIN(?), ?)",
          [uuid, genreId]
        );
      }

      // Recupera los datos completos de la película, incluyendo géneros
      const [movies] = await pool.query(
        `
      SELECT
        BIN_TO_UUID(movie.id) AS id,
        movie.title,
        movie.year,
        movie.director,
        movie.duration,
        movie.poster,
        movie.rate,
        GROUP_CONCAT(genre.name) AS genres
      FROM
        movie
      LEFT JOIN movie_genres ON movie.id = movie_genres.movie_id
      LEFT JOIN genre ON movie_genres.genre_id = genre.id
      WHERE
        movie.id = UUID_TO_BIN(?)
      GROUP BY
        movie.id, movie.title, movie.year, movie.director, movie.duration, movie.poster, movie.rate
      `,
        [uuid]
      );

      return { success: movies[0] };
    } catch (error) {
      console.log(error);
      return { error: "Something was wrong!" };
    }
  }

  static async delete({ id }) {
    const movieIndex = movies.findIndex((movie) => movie.id === id);
    if (movieIndex < 0) return { error: "Movie Not Found" };
    movies.splice(movieIndex, 1);
    writeFileSync("./movies.json", JSON.stringify(movies));
    return { success: "Movie deleted" };
  }

  static async update({ id, input }) {
    const movieIndex = movies.findIndex((movie) => movie.id === id);
    if (movieIndex < 0) return { error: "Movie not found" };
    const updatedMovie = { ...movies[movieIndex], ...input };
    movies[movieIndex] = updatedMovie;
    try {
      writeFileSync("./movies.json", JSON.stringify(movies));
      return { success: movies[movieIndex] };
    } catch (error) {
      return { error: error.message };
    }
  }
}
