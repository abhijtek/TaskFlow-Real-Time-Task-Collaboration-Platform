import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();

// basic configurations
app.use(express.json({limit : "16kb"})) // middleware(app.use()) // 16kb of json data will be taken
app.use(express.urlencoded({extended: true, limit : "16kb"}))//accepting data from url
app.use(express.static("public")) // public part will be vidible to all

app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin : process.env.CORS_ORIGIN ?.split(",") || "http://localhost:5173",
    credentials : true,
    methods : ["GET","POST","PUT","PATCH","DELETE","OPTIONS"
    ],
    allowedHeaders : ["Content-Type","Authorization"],

})); 

// import routes

import  healthCheckRouter from "./routes/healthcheck.routes.js" // default export

import authRouter from "./routes/auth.routes.js"
import apiAuthRouter from "./routes/api/auth.api.routes.js";
import workspaceApiRouter from "./routes/api/workspace.api.routes.js";
import boardApiRouter from "./routes/api/board.api.routes.js";
import listApiRouter from "./routes/api/list.api.routes.js";
import taskApiRouter from "./routes/api/task.api.routes.js";
import activityApiRouter from "./routes/api/activity.api.routes.js";
import searchApiRouter from "./routes/api/search.api.routes.js";
app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/auth", apiAuthRouter);
app.use("/api/workspaces", workspaceApiRouter);
app.use("/api/boards", boardApiRouter);
app.use("/api/lists", listApiRouter);
app.use("/api/tasks", taskApiRouter);
app.use("/api/activities", activityApiRouter);
app.use("/api/search", searchApiRouter);
// take a obj
app.get("/",(req,res)=>{
    res.send("Welcome to Basecampy");
})

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({ error: err.message || "Server error" });
});
export default app;
