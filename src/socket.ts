import { Server } from "socket.io";
import { getAllQueuesInPlaylist } from "./controllers/queue";

const io = new Server({
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    console.log("Socket enabled");
    socket.on("reloadQueuesInPlaylist", async (playlistId) => {
        io.emit("reloadQueuesInPlaylist", playlistId);
    });
})

io.listen(8001);