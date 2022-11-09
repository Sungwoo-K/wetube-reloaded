import express from "express";
import {
  logout,
  see,
  startGithubLogin,
  finishGithubLogin,
  getEdit,
  postEdit,
} from "../controllers/userController";
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares";

const userRouter = express.Router();

userRouter.route("/logout").get(protectorMiddleware, logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
userRouter
  .route("/github/start")
  .all(publicOnlyMiddleware)
  .get(startGithubLogin);
userRouter
  .route("/github/finish")
  .all(publicOnlyMiddleware)
  .get(finishGithubLogin);
userRouter.route("/:id").get(see);

export default userRouter;
