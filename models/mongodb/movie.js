import { Schema, model } from "mongoose";

const genreSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const movieSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  poster: String,
  rate: {
    type: Number,
    required: true,
  },
  genres: [
    {
      type: Schema.Types.ObjectId,
      ref: "Genre",
    },
  ],
});

const Genre = model("Genre", genreSchema);
const Movie = model("Movie", movieSchema);

class MovieModel {
  static async getAll({ genre }) {
    try {
      let query = Movie.find();

      if (genre) {
        // Buscar el ObjectId del género por su nombre
        const genreDoc = await Genre.findOne({ name: genre.toLowerCase() });
        if (genreDoc) {
          query = query.where("genres").in([genreDoc._id]);
        } else {
          return { message: `There are no movies with genre '${genre}'` };
        }
      }

      query = query.populate("genres"); // Popula los datos de género

      const movies = await query.exec();

      return movies.map((movie) => ({
        id: movie._id,
        title: movie.title,
        year: movie.year,
        director: movie.director,
        duration: movie.duration,
        poster: movie.poster,
        rate: movie.rate,
        genres: movie.genres.map((genre) => genre.name),
      }));
    } catch (err) {
      console.log(err);
      return { error: "Something went wrong!" };
    }
  }
  static async getById({ id }) {
    try {
      const movie = await Movie.findById(id).populate("genres").exec();

      if (!movie) {
        return null;
      }

      return {
        id: movie._id,
        title: movie.title,
        year: movie.year,
        director: movie.director,
        duration: movie.duration,
        poster: movie.poster,
        rate: movie.rate,
        genres: movie.genres.map((genre) => genre.name),
      };
    } catch (error) {
      console.error(error);
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

      const movie = new Movie({
        title,
        year,
        director,
        duration,
        poster,
        rate,
        genres: [],
      });

      for (const genre of genreInput) {
        let existingGenre = await Genre.findOne({ name: genre.toLowerCase() });

        if (!existingGenre) {
          existingGenre = new Genre({ name: genre.toLowerCase() });
          await existingGenre.save();
        }

        movie.genres.push(existingGenre._id);
      }

      await movie.save();

      return { success: movie };
    } catch (error) {
      console.error(error);
      return { error: "Something was wrong!" };
    }
  }

  static async delete({ id }) {
    try {
      // Elimina la película
      const deletedMovie = await Movie.findByIdAndRemove(id).exec();

      if (!deletedMovie) {
        return { error: "Movie not found" };
      }

      // Elimina las referencias de género
      await Genre.updateMany(
        { _id: { $in: deletedMovie.genres } },
        { $pull: { movies: deletedMovie._id } }
      ).exec();

      return { success: `Movie ID ${id} deleted successfully! ` };
    } catch (error) {
      console.error(error);
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

      // Actualiza la película
      const updatedMovie = await Movie.findByIdAndUpdate(
        id,
        {
          title,
          year,
          director,
          duration,
          poster,
          rate,
        },
        { new: true }
      ).exec();

      if (!updatedMovie) {
        return { error: "Movie not found" };
      }

      if (genreInput) {
        // Actualiza las referencias de género
        const updatedGenres = [];
        for (const genre of genreInput) {
          let existingGenre = await Genre.findOne({
            name: genre.toLowerCase(),
          });

          if (!existingGenre) {
            existingGenre = new Genre({ name: genre.toLowerCase() });
            await existingGenre.save();
          }

          updatedGenres.push(existingGenre._id);
        }

        updatedMovie.genres = updatedGenres;
        await updatedMovie.save();
      }

      return { success: "Movie updated" };
    } catch (error) {
      console.error(error);
      return { error: "Something went wrong" };
    }
  }
}

export default MovieModel;
import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://martinkremis:fb9QUueXiQ5sjvAx@cluster0.qtc36xs.mongodb.net/?retryWrites=true&w=majority"

export const connectDB = async () => {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB is connected');
    } catch (error) {
      console.error(error);
    }
  };

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("U