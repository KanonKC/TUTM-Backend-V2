import { FastifyReply, FastifyRequest } from "fastify";
import { PlaylistModel, QueueModel, YoutubeVideoModel } from "../models";
import { YoutubeVideo } from "../types/model";

export async function getAllPlaylists() {
    const playlists = await PlaylistModel.findAll()
    return playlists
}

export async function createPlaylist(body: { id: string }) {
    const playlist = await PlaylistModel.create({
        id: body.id,
    })
    return playlist.dataValues
}

export async function getPlaylistWithCurrentVideoById(playlistId: string) {
    const playlist = await PlaylistModel.findOne({where: {id: playlistId}})

    if (!playlist) throw new Error('Playlist not found')

    let currentVideo:YoutubeVideo|null = null;
    if (playlist?.dataValues.current_index) {
        const currentVideoModel = await YoutubeVideoModel.findOne({where: {id: playlist.dataValues.current_index}})
        if (currentVideoModel) {
            currentVideo = currentVideoModel.dataValues
        }
    }

    return { ...playlist.dataValues, video: currentVideo }
}

export async function playIndex(playlistId: string, index: number) {
    const playlist = await PlaylistModel.findOne({where: {id: playlistId}})

    if (!playlist) throw new Error('Playlist not found')

    await playlist.update({current_index: index})
    return playlist.dataValues
}

export async function playNext(playlistId: string) {
    const playlist = await PlaylistModel.findOne({where: {id: playlistId}})

    if (!playlist) throw new Error('Playlist not found')

    let nextIndex = 0

    if (playlist.dataValues.current_index !== null) {
        nextIndex = playlist.dataValues.current_index + 1
    }
    
    await playlist.update({current_index: nextIndex})
    return playlist.dataValues
}

export async function playPrevious(playlistId: string) {
    const playlist = await PlaylistModel.findOne({where: {id: playlistId}})
    const queues = await QueueModel.findAll({where: {playlist_id: playlistId}})
    const queueCount = queues.length

    if (!playlist) throw new Error('Playlist not found')

    let nextIndex = 0

    if (playlist.dataValues.current_index !== null) {
        nextIndex = (playlist.dataValues.current_index - 1) % queueCount
    }
    
    await playlist.update({current_index: nextIndex})
    return playlist.dataValues
}

export async function playAlgorithm(playlistId: string) {
    const playlist = await PlaylistModel.findOne({where: {id: playlistId}})
    const queues = await QueueModel.findAll({where: {playlist_id: playlistId}, order: [['createdAt', 'ASC']]})

    queues.forEach(queue => console.log(queue.dataValues))
    
    if (!playlist) throw new Error('Playlist not found')
        
    const start = playlist.dataValues.current_index
    const queueCount = queues.length
    const minimumPlayedCount = Math.min(...queues.map(queue => queue.dataValues.played_count))
    
    for (let i = 1; i < queueCount; i++) {
        const index = ((start ?? 0) + i) % queueCount
        const queue = queues[index]
        console.log(index,queue.dataValues.played_count,minimumPlayedCount,queue.dataValues.id)
        if (queue.dataValues.played_count === minimumPlayedCount) {
            await playlist.update({current_index: index})
            return playlist.dataValues
        }
    }
}