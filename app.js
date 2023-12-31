import express, { json } from "express";
import { createMovieRouter } from "./routes/movies.js";
import { corsMiddleware } from "./middlewares/cors.js";

export const createApp = ({ movieModel }) => {
  const app = express();
  const PORT = process.env.PORT ?? 3000;

  app
    .disable("x-powered-by")
    .use(json())
    .use(corsMiddleware())
    .use("/movies", createMovieRouter({ movieModel }))
    .all("*", (req, res) => {
      res.status(404).json({ message: "404 Not Found" });
    })

    .listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
};
