import { FastifyReply, FastifyRequest } from "fastify";
import { searchYoutubePlaylistAsBaseAttributes, searchYoutubeVideoAsBaseAttributes } from "../controllers/youtube";
import { listWrap } from "../utilities/ListWrapper";

export async function searchYoutubeVideoAsBaseAttributesView(request:FastifyRequest<{
    Params: { query: string }
}>, replay:FastifyReply) {
    const query = request.params.query
    const response = await searchYoutubeVideoAsBaseAttributes(query)
    replay.send(listWrap(response))
}

export async function searchYoutubePlaylistAsBaseAttributesView(request:FastifyRequest<{
    Params: { playlistId: string }
}>, replay:FastifyReply) {
    const playlistId = request.params.playlistId
    const response = await searchYoutubePlaylistAsBaseAttributes(playlistId)
    replay.send(listWrap(response))
}