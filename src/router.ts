import cors from "@fastify/cors";
import fastify from "fastify";
import { createOrUpdateAccountBySpotifyAccountView, getAccountBySpotifyAccountView } from "./views/account";
import {
    createPlaylistView,
    getAllPLaylistsView,
    getPlaylistByIdView,
    playAlgorithmView,
    playByQueueIdView,
    playNextView,
    playPreviousView,
} from "./views/playlist";
import {
    addSpotifyTrackToQueueView,
    addYoutubeVideoToQueueView,
    clearQueueInPlaylistView,
    deleteQueueByIdView,
    getAllQueuesInPlaylistView,
    getQueueByIdView,
    increaseQueuePlayedCountView,
    reOrderQueueView,
} from "./views/queue";
import {
    searchYoutubePlaylistAsBaseAttributesView,
    searchYoutubeVideoAsBaseAttributesView,
} from "./views/youtube";

const server = fastify();
server.register(cors, {
	origin: "*",
});

server.post("/accounts/spotify", createOrUpdateAccountBySpotifyAccountView);
server.get("/accounts/spotify", getAccountBySpotifyAccountView);

server.get("/playlists", getAllPLaylistsView);
server.post("/playlists", createPlaylistView);
server.get("/playlists/:playlistId", getPlaylistByIdView);
// server.put('/playlists/:playlistId/play/index/:indexNo', playIndexView)
server.put("/playlists/:playlistId/play/queues/:queueId", playByQueueIdView);
server.put("/playlists/:playlistId/play/next", playNextView);
server.put("/playlists/:playlistId/play/prev", playPreviousView);
server.put("/playlists/:playlistId/play/algorithm", playAlgorithmView);

server.get("/playlists/:playlistId/queues", getAllQueuesInPlaylistView);
server.post("/playlists/:playlistId/queues/youtube-video", addYoutubeVideoToQueueView);
server.post("/playlists/:playlistId/queues/spotify-track", addSpotifyTrackToQueueView);
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
