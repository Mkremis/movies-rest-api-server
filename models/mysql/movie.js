import mysql from "mysql2/promise";
import "dotenv/config";

const defaultConfig = {
  host: "localhost",
  user: "root",
  password: "1234",
  port: 3306,
  database: "moviesdb",
};

const pool = mysql.createPool(process.env.DATABASE_URL || defaultConfig);

export class MovieModel {
  static async getAll({ genre }) {
    try {
      let lowerCaseGenre = "";

      if (genre) {
        lowerCaseGenre = genre.toLowerCase();
      }

      let query = `
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
    `;

      if (genre) {
        query += `
        WHERE LOWER(genre.name) = ?
      `;
      }

      query += `
      GROUP BY
        movie.id, movie.title, movie.year, movie.director, movie.duration, movie.poster, movie.rate
    `;

      const [movies] = await pool.query(query, [lowerCaseGenre]);

      if (genre && !movies.length) {
        return { message: `There are no movies with genre '${genre}'` };
      }

      return movies.map((movie) => ({
        ...movie,
        genres: movie.genres ? movie.genres.split(",") : [],
      }));
    } catch (err) {
      console.log(err);
      return { error: "Something went wrong!" };
    }
  }

  static async getById({ id }) {
    try {
      const [movies] = await pool.query(
        `SELECT BIN_TO_UUID(id) AS id, title, year, director, duration, poster, rate FROM movie WHERE id = UUID_TO_BIN(?)`,
        [id]
      );
      const genres = [];
      const [genres_ids] = await pool.query(
        "SELECT genre_id FROM movie_genres WHERE movie_id = UUID_TO_BIN(?)",
        [id]
      );

      if (genres_ids.length > 0) {
        for (const genre of genres_ids) {
          const [genre_name] = await pool.query(
            "SELECT name FROM genre WHERE id = ?",
            [genre.genre_id]
          );
          genres.push(genre_name[0].name);
        }
      }

      if (movies.length) {
        movies[0].genres = genres;
        return movies[0];
      }
      return null;
    } catch (error) {
      console.log(error);
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
        genres: genreInput,
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
    try {
      // Elimina las filas en movie_genres relacionadas con la película
      await pool.query(
        "DELETE FROM movie_genres WHERE movie_id = UUID_TO_BIN(?)",
        [id]
      );

      // Luego elimina la película de la tabla movie
      const [result] = await pool.query(
        "DELETE FROM movie WHERE id = UUID_TO_BIN(?)",
        [id]
      );
      if (!result.affectedRows) return { error: "Movie not found" };
      return { success: `Movie ID ${id} deleted successfully! ` };
    } catch (error) {
      console.log(error);
      return { error: "Something went wrong" };
    }
  }

  static async update({ id, input }) {
    try {
      const {
        title,
        year,
        director,
        duration,
        genres: genreInput,
        poster,
        rate,
      } = input;

      // Actualiza los datos principales de la película en la tabla movie
      await pool.query(
        "UPDATE movie SET title = COALESCE(?, title), year = COALESCE(?, year), director = COALESCE(?, director), duration = COALESCE(?, duration), poster = COALESCE(?, poster), rate = COALESCE(?, rate) WHERE id = UUID_TO_BIN(?)",
        [title, year, director, duration, poster, rate, id]
      );
      if (genreInput) {
        // Elimina las filas existentes en movie_genres relacionadas con la película
        await pool.query(
          "DELETE FROM movie_genres WHERE movie_id = UUID_TO_BIN(?)",
          [id]
        );

        // Obtiene los IDs de género para los géneros proporcionados en genreInput
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

        // Inserta los géneros actualizados en la tabla movie_genres
        for (const genreId of genreIds) {
          await pool.query(
            "INSERT INTO movie_genres (movie_id, genre_id) VALUES (UUID_TO_BIN(?), ?)",
            [id, genreId]
          );
        }
      }
      return { success: "Movie updated" };
    } catch (error) {
      console.log(error);
      return { error: "Something went wrong" };
    }
  }
}
