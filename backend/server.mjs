import express from "express"; 
import dotenv from "dotenv";
import { chats } from "./data/data.mjs";
import { connect } from "mongoose";
import connectDB from "./config/db.mjs";
import colors from "colors";
//import userRoutes from "./routes/userRoutes";
const userRoutes = (await import("./routes/userRoutes.js")).default; // dynamiclly linked instead of the one above
import { notFound, errorHandler } from "./middleware/errorMiddleware.js"
const chatRoutes = (await import("./routes/chatRoutes.js")).default;
const messageRoutes = (await import("./routes/messageRoutes.js")).default;
import { Server } from "socket.io";



dotenv.config();

connectDB();
const app = express(); 

app.use(express.json()); // to accept JSON Data 

app.get("/", (req, res) =>{ 
    res.send("API is Running Successfully"); 
});

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000; 


const server = app.listen(PORT, console.log(`Server Started on PORT ${PORT}`.yellow.bold));

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    },
});


io.on("connection", (socket) =>{
    console.log("connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;

        if(!chat.users) return console.log("chat.users not defined");

        chat.users.forEach( user => {
            if(user._id == newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageRecieved);
     
        })
    });

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
}); 