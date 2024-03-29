import express from "express";
import {
  createComment,
  registerView,
  deleteComment,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.route("/videos/:id([0-9a-f]{24})/view").post(registerView);
apiRouter.route("/videos/:id([0-9a-f]{24})/comment").post(createComment);
apiRouter.route("/videos/:id([0-9a-f]{24})/comment/delete").post(deleteComment);

export default apiRouter;
