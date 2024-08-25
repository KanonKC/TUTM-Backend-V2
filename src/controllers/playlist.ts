import { YoutubeVideo } from "@prisma/client";
import { prisma } from "../prisma";

export async function getAllPlaylists() {
    const playlists = await prisma.playlist.findMany()
    return playlists
}

export async function createPlaylist(body: { id: string }) {
    const playlist = await prisma.playlist.create({
        data: {
            // slug: body.id,
            id: body.id,
            type: 'linear'
        }
    })
    return playlist
}

export async function getPlaylistWithCurrentVideoById(playlistId: string) {

    const playlist = await prisma.playlist.findUniqueOrThrow({
        where: { id: playlistId },
        include: { queues: {
            where: { playlistId },
            orderBy: { createdAt: 'asc' }
        }}
    })

    if (!playlist) throw new Error('Playlist not found')

    let currentVideo:YoutubeVideo|null = null;

    if (playlist.currentIndex) {
        const currentQueue = playlist.queues[playlist.currentIndex]
        currentVideo = await prisma.youtubeVideo.findFirst({where: {id: currentQueue.youtubeVideoId}})
    }

    return { ...playlist, video: currentVideo }
}

export async function playIndex(playlistId: string, index: number) {
    const playlist = await prisma.playlist.findUnique({where: {id: playlistId}})

    if (!playlist) throw new Error('Playlist not found')

    await prisma.playlist.update({
        where: { id: playlistId },
        data: { currentIndex: index }
    })
    return playlist
}

export async function playNext(playlistId: string) {
    const playlist = await prisma.playlist.findUnique({where: {id: playlistId}})

    if (!playlist) throw new Error('Playlist not found')

    let nextIndex = 0

    if (playlist.currentIndex !== null) {
        nextIndex = playlist.currentIndex + 1
    }
    
    await prisma.playlist.update({
        where: { id: playlistId },
        data: { currentIndex: nextIndex }
    })
    return playlist
}

export async function playPrevious(playlistId: string) {
    const playlist = await prisma.playlist.findUnique({where: { id: playlistId }})
    const queues = await prisma.queue.findMany({where: { playlistId }})
    const queueCount = queues.length

    if (!playlist) throw new Error('Playlist not found')

    let nextIndex = 0

    if (playlist.currentIndex !== null) {
        nextIndex = (playlist.currentIndex - 1) % queueCount
    }
    
    await prisma.playlist.update({
        where: { id: playlistId },
        data: { currentIndex: nextIndex }
    })
    return playlist
}

export async function playAlgorithm(playlistId: string) {
    const playlist = await prisma.playlist.findUnique({where: {id: playlistId}})
    const queues = await prisma.queue.findMany({where: { playlistId }, orderBy: { createdAt: 'asc' }})

    queues.forEach(queue => console.log(queue))
    
    if (!playlist) throw new Error('Playlist not found')
        
    const start = playlist.currentIndex
    const queueCount = queues.length
    const minimumPlayedCount = Math.min(...queues.map(queue => queue.playedCount))
    
    for (let i = 1; i < queueCount; i++) {
        const index = ((start ?? 0) + i) % queueCount
        const queue = queues[index]
        // console.log(index,queue.playedCount,minimumPlayedCount,queue.id)
        if (queue.playedCount === minimumPlayedCount) {
            await prisma.playlist.update({
                where: { id: playlistId },
                data: { currentIndex: index }
            })
            return playlist
        }
    }
}