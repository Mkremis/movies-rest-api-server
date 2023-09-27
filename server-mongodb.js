import { createApp } from "./app.js";
import { connectDB } from "./models/mongodb/db.js";
import MovieModel from "./models/mongodb/movie.js";

connectDB();
createApp({ movieModel: MovieModel });
