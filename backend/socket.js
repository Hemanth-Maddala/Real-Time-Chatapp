// socket.js

// steps:-
    // Initializes Express.

    // Applies middleware and routes.

    // Creates an HTTP server.

    // Attaches a socket.io server to it.

    // Manages online users with userSocketMap.

    // Starts the server on a single port.

//******************************************************************** */
// socket.handshake.query.userId retrieves the user ID sent by the client during the initial WebSocket connection.
// It's an object containing query parameters passed when the client connects to the Socket.IO server.
// like: http://example.com?userId=abc123
//******************************************************************** */

// // socekt.io will connect the client and server (connection on two sides)
// // client means person frontend ,  server means http
// // all the different clients will be connected to the same server made by socket.io
// // Server from socket.io is used to create a WebSocket server that runs on top of the HTTP server(means client server)
const { Server } = require("socket.io");

const userSocketMap = {}; // userId -> socketId
let io; // 🔁 io is declared here, assigned later

function setupSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;   // retrieves the user ID sent by the client
        console.log("New client connected:", userId);
        console.log("userSocketMap before update:", { ...userSocketMap });

        if (userId) {
            userSocketMap[userId] = socket.id;  //Socket.IO automatically generates a unique socket.id for each connected client.
        }

        console.log("userSocketMap after update:", { ...userSocketMap });

        io.emit("getOnlineUsers", Object.keys(userSocketMap));   // Broadcasts the list of currently online users to all connected clients.

        socket.on("disconnect", () => {
             // it will trigger when ever the user disconnects 
            console.log("User disconnected:", userId);
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized. Call setupSocket(server) first.");
    }
    return io;
}

module.exports = {
    setupSocket,
    getIO,
    userSocketMap
};
