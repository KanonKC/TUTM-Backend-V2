import fastify from "fastify";
import {
	createPlaylistView,
	getAllPLaylistsView,
	getPlaylistWithCurrentVideoByIdView,
	playNextView,
	playPreviousView,
	playAlgorithmView,
	playByQueueIdView,
} from "./views/playlist";
import {
	addVideoToQueueView,
	clearQueueInPlaylistView,
	deleteQueueByIdView,
	getAllQueuesInPlaylistView,
	getQueueByIdView,
	increaseQueuePlayedCountView,
    reOrderQueueView,
} from "./views/queue";
import cors from "@fastify/cors";
import {
	searchYoutubePlaylistAsBaseAttributesView,
	searchYoutubeVideoAsBaseAttributesView,
} from "./views/youtube";
import { reOrderQueue } from "./controllers/queue";

const server = fastify();
server.register(cors, {
	origin: "*",
});

server.get("/playlists", getAllPLaylistsView);
server.post("/playlists", createPlaylistView);
server.get("/playlists/:playlistId", getPlaylistWithCurrentVideoByIdView);
// server.put('/playlists/:playlistId/play/index/:indexNo', playIndexView)
server.put("/playlists/:playlistId/play/queues/:queueId", playByQueueIdView);
server.put("/playlists/:playlistId/play/next", playNextView);
server.put("/playlists/:playlistId/play/prev", playPreviousView);
server.put("/playlists/:playlistId/play/algorithm", playAlgorithmView);

server.get("/playlists/:playlistId/queues", getAllQueuesInPlaylistView);
server.post("/playlists/:playlistId/queues", addVideoToQueueView);
server.delete("/playlists/:playlistId/queues", clearQueueInPlaylistView);

server.get("/queues/:queueId", getQueueByIdView);
server.delete("/queues/:queueId", deleteQueueByIdView);
server.put("/queues/:queueId/increment", increaseQueuePlayedCountView);
server.patch("/playlists/:playlistId/queues/order", reOrderQueueView);

server.get("/youtube/videos/:query", searchYoutubeVideoAsBaseAttributesView);
server.get(
	"/youtube/playlist/:playlistId",
	searchYoutubePlaylistAsBaseAttributesView
);

export default server;
