import dotenv from "dotenv"
import http from "http"
import { Server } from "socket.io"
import app from "./app.js"
import connectDB from "./db/index.js";
import { setupSocketHandlers } from "./socket.handlers.js";
dotenv.config({
    path: "./.env",
});

const port =  process.env.PORT  || 3000;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Setup socket handlers
setupSocketHandlers(io);

// Make io accessible to routes
app.set('io', io);

connectDB()
.then(()=>{
    server.listen(port, ()=>{
        console.log(`Example app listening on port http://localhost:${port}`);
        
    });
})
.catch((err)=>{
    console.log("MongoDb Connection Error",err);
    process.exit(1);
    
})