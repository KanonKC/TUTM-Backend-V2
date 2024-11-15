import { FastifyReply, FastifyRequest } from "fastify";
import {
	createPlaylist,
	CreatePlaylistPayload,
	getAllPlaylists,
	getPlaylistById,
	playAlgorithm,
	playByQueueId,
	playNext,
	playPrevious,
} from "../controllers/playlist";
import { listWrap } from "../utilities/ListWrapper";

export async function getAllPLaylistsView(
	_: FastifyRequest,
	reply: FastifyReply
) {
	const playlists = await getAllPlaylists();
	reply.send(listWrap(playlists));
}

export async function createPlaylistView(
	request: FastifyRequest<{
		Body: CreatePlaylistPayload;
	}>,
	reply: FastifyReply
) {
	try {
		const playlist = await createPlaylist(request.body);
		reply.send(playlist);
	} catch (error) {
		reply.code(400).send({ error: error });
	}
}

export async function getPlaylistByIdView(
	request: FastifyRequest<{
		Params: { playlistId: string };
	}>,
	reply: FastifyReply
) {
	const id = request.params.playlistId;
	try {
		const playlist = await getPlaylistById(id);
		reply.send(playlist);
	} catch (error) {
		reply.code(404).send({ error: "Error" });
	}
}

// export async function playIndexView(
// 	request: FastifyRequest<{
// 		Params: { playlistId: string; indexNo: number };
// 	}>,
// 	reply: FastifyReply
// ) {
// 	const id = request.params.playlistId;
// 	const index = request.params.indexNo;
// 	const playlist = await playIndex(id, Number(index));
// 	reply.send(playlist);
// }

export async function playByQueueIdView(
	request: FastifyRequest<{
		Params: { playlistId: string; queueId: string };
	}>,
	reply: FastifyReply
) {
	const { playlistId, queueId } = request.params;
	const playlist = await playByQueueId(playlistId, queueId);
	reply.send(playlist);
}

export async function playNextView(
	request: FastifyRequest<{
		Params: { playlistId: string };
	}>,
	reply: FastifyReply
) {
	const id = request.params.playlistId;
	const playlist = await playNext(id);
	reply.send(playlist);
}

export async function playPreviousView(
	request: FastifyRequest<{
		Params: { playlistId: string };
	}>,
	reply: FastifyReply
) {
	const id = request.params.playlistId;
	const playlist = await playPrevious(id);
	reply.send(playlist);
}

export async function playAlgorithmView(
	request: FastifyRequest<{
		Params: { playlistId: string };
	}>,
	reply: FastifyReply
) {
	const id = request.params.playlistId;
	const playlist = await playAlgorithm(id);
	reply.send(playlist);
}
