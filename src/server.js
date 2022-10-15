import express from "express";
import morgan from "morgan";
import session from "express-session";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({extended : true}));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,  
  }));

app.use((req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user;
  next();
});

app.use("/",rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;

