import { FastifyReply, FastifyRequest } from "fastify";
import { addVideoToQueue, clearQueueInPlaylist, deleteQueueById, getAllQueuesInPlaylist, getQueueById, increaseQueuePlayedCount } from "../controllers/queue";
import { listWrap } from "../utilities/ListWrapper";

export async function getAllQueuesInPlaylistView(request: FastifyRequest<{
    Params: { playlistId: string }
}>,replay: FastifyReply) {
    const id = request.params.playlistId
    const queues = await getAllQueuesInPlaylist(id)
    replay.send(listWrap(queues)) 
}

export async function addVideoToQueueView(request: FastifyRequest<{
    Params: { playlistId: string }
    Body: { videoId: string }
}>,replay: FastifyReply) {
    const playlistId = request.params.playlistId
    const videoId = request.body.videoId
    const queue = await addVideoToQueue(playlistId, videoId)
    replay.send(queue)
}

export async function clearQueueInPlaylistView(request: FastifyRequest<{
    Params: { playlistId: string }
}>,replay: FastifyReply) {
    const playlistId = request.params.playlistId
    await clearQueueInPlaylist(playlistId)
    replay.status(204).send()
}

export async function getQueueByIdView(request: FastifyRequest<{
    Params: { queueId: string }
}>,replay: FastifyReply) {
    const queueId = request.params.queueId
    const queue = await getQueueById(queueId)
    replay.send(queue)
}

export async function deleteQueueByIdView(request: FastifyRequest<{
    Params: { queueId: string }
}>,replay: FastifyReply) {
    const queueId = request.params.queueId
    await deleteQueueById(queueId)
    replay.status(204).send()
}

export async function increaseQueuePlayedCountView(request: FastifyRequest<{
    Params: { queueId: string }
}>,replay: FastifyReply) {
    const queueId = request.params.queueId
    const queue = await increaseQueuePlayedCount(queueId)
    replay.send(queue)
}