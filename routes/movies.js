import { Router } from "express";
import { MovieController } from "../controllers/movies.js";

export const createMovieRouter = ({ movieModel }) => {
  const moviesRouter = Router();
  const movieController = new MovieController({ movieModel });

  moviesRouter
    .get("/", movieController.getAll)
    .get("/:id", movieController.getById)
    .post("/", movieController.create)
    .delete("/:id", movieController.delete)
    .patch("/:id", movieController.update);

  return moviesRouter;
};
