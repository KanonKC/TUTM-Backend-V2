import { Server } from "socket.io";
import { getAllQueuesInPlaylist } from "./controllers/queue";

const io = new Server({
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("reloadQueuesInPlaylist", async (playlistId) => {
        console.log("Request reload queue in playlist", playlistId);
        io.emit("reloadQueuesInPlaylist", playlistId);
    });
})

io.listen(8001);