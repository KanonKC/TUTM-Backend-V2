import { FastifyReply, FastifyRequest } from "fastify";
import {
    addSpotifyTrackToQueue,
	addYoutubeVideoToQueue,
	clearQueueInPlaylist,
	deleteQueueById,
	getAllQueuesInPlaylist,
	getQueueById,
	increaseQueuePlayedCount,
	reOrderQueue,
	ReOrderQueuePayload,
} from "../controllers/queue";
import { listWrap } from "../utilities/ListWrapper";

export async function getAllQueuesInPlaylistView(
	request: FastifyRequest<{
		Params: { playlistId: string };
	}>,
	replay: FastifyReply
) {
	const id = request.params.playlistId;
	const queues = await getAllQueuesInPlaylist(id);
	replay.send(listWrap(queues));
}

export async function addYoutubeVideoToQueueView(
	request: FastifyRequest<{
		Params: { playlistId: string };
		Body: { videoId: string };
	}>,
	replay: FastifyReply
) {
	const playlistId = request.params.playlistId;
	const videoId = request.body.videoId;
	const queue = await addYoutubeVideoToQueue(playlistId, videoId);
	replay.send(queue);
}

export async function addSpotifyTrackToQueueView(
	request: FastifyRequest<{
		Params: { playlistId: string };
		Body: { trackId: string };
	}>,
	replay: FastifyReply
) {
    try {
        const { playlistId } = request.params;
        const { trackId } = request.body;
        const queue = await addSpotifyTrackToQueue(playlistId, trackId);
        replay.send(queue);
    } catch (error) {
        replay.status(400).send({ error: String(error) });
    }
}

export async function clearQueueInPlaylistView(
	request: FastifyRequest<{
		Params: { playlistId: string };
	}>,
	replay: FastifyReply
) {
	const playlistId = request.params.playlistId;
	await clearQueueInPlaylist(playlistId);
	replay.status(204).send();
}

export async function getQueueByIdView(
	request: FastifyRequest<{
		Params: { queueId: string };
	}>,
	replay: FastifyReply
) {
	const queueId = request.params.queueId;
	const queue = await getQueueById(queueId);
	replay.send(queue);
}

export async function deleteQueueByIdView(
	request: FastifyRequest<{
		Params: { queueId: string };
	}>,
	replay: FastifyReply
) {
	const queueId = request.params.queueId;
	await deleteQueueById(queueId);
	replay.status(204).send();
}

export async function increaseQueuePlayedCountView(
	request: FastifyRequest<{
		Params: { queueId: string };
	}>,
	replay: FastifyReply
) {
	const queueId = request.params.queueId;
	const queue = await increaseQueuePlayedCount(queueId);
	replay.send(queue);
}

export async function reOrderQueueView(
	request: FastifyRequest<{
		Params: { playlistId: string };
		Body: ReOrderQueuePayload;
	}>,
	replay: FastifyReply
) {
	try {
		const { playlistId } = request.params;
		const queue = await reOrderQueue(playlistId, request.body);
		replay.send(queue);
	} catch (error) {
		console.log(error);
		replay.status(400).send({ error });
	}
}
