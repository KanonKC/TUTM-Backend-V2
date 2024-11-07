import { YoutubeVideo } from "@prisma/client"
import { prisma } from "../prisma"
import { getYoutubeVideoData } from "../services/Youtube.service"

export async function getAllQueuesInPlaylist(playlistId: string) {
    const queues = await prisma.queue.findMany({
        where: { playlistId },
        orderBy: { createdAt: 'asc' },
        include: { youtubeVideo: true }
    })
    return queues
}

export async function addVideoToQueue(playlistId: string, videoId: string) {
    let videoModel:YoutubeVideo | null = null
    try {
        videoModel = await prisma.youtubeVideo.findUnique({where: {id: videoId}})
        if (!videoModel) {
            throw new Error("Video not found")
        }
    }
    catch (err) {
        const videoData = await getYoutubeVideoData(videoId)
        videoModel = await prisma.youtubeVideo.create({
            data: {
                youtubeId: videoData.url,
                title: videoData.title,
                channelTitle: videoData.channel_title,
                description: videoData.description.slice(0,255),
                thumbnail: videoData.thumbnail,
                duration: videoData.duration,
            }
        })

        if (!videoModel) {
            throw new Error("Failed to create video")
        }
    }

    const playlistModel = await prisma.playlist.findUnique({where: {id: playlistId}})

    if (!playlistModel) {
        throw new Error("Playlist not found")
    }

    const playlist = playlistModel
    const video = videoModel

    if (!(playlist.currentIndex && playlist.currentIndex > 0)) {
        await prisma.playlist.update({where: {id: playlistId}, data: {currentIndex: 0}})
    }
    console.log("Adding video to queue")
    const queue = await prisma.queue.create({
        data: {
            playlistId,
            youtubeVideoId: video.id,
        }
    })
    console.log("Adding video to queue")

    return {
        ...queue,
        video
    }
}

export async function clearQueueInPlaylist(playlistId: string) {
    await prisma.queue.deleteMany({where: {playlistId}})
    await prisma.playlist.update({where: {id: playlistId}, data: {currentIndex: null}})
    return true
}

export async function getQueueById(queueId: string) {
    const queue = await prisma.queue.findUnique({
        where: {id: queueId},
        include: {youtubeVideo: true}
    })

    if (!queue) throw new Error('Queue not found')

    return queue
}

export async function deleteQueueById(queueId: string) {
    const queue = await prisma.queue.findUnique({where: {id: queueId}})
    if (!queue) throw new Error('Queue not found')

    const playlistModel = await prisma.playlist.findUnique({where: {id: queue.playlistId }, include: {queues: {
        where: {id: queueId},
        orderBy: {createdAt: 'asc'}
    }}})
    if (!playlistModel) throw new Error('Playlist not found')

    // Decrease one current index if the queue is before the current index
    const allQueues = playlistModel.queues
    const currentIndex = playlistModel.currentIndex 

    if (currentIndex !== null) {
        const queueIndex = allQueues.findIndex(queue => queue.id === queueId)
        if (queueIndex < currentIndex) {
            await prisma.playlist.update({where: {id: playlistModel.id}, data: {currentIndex: currentIndex - 1}})
        }
    }
    
    await prisma.queue.delete({where: {id: queueId}})
    return true
}

export async function increaseQueuePlayedCount(queueId: string) {
    return await prisma.queue.update({
        where: {id: queueId},
        data: {playedCount: {increment: 1}}
    })
}

export async function swapQueuePosition(queueId1: string, queueId2: string) {
    const queue1 = await prisma.queue.findUnique({where: {id: queueId1}})
    const queue2 = await prisma.queue.findUnique({where: {id: queueId2}})

    if (!queue1 || !queue2) throw new Error('Queue not found')

    const updateQueue2 = await prisma.queue.update({
        where: {id: queueId2},
        data: {youtubeVideoId: queue1.youtubeVideoId},
        include: {youtubeVideo: true}
    })

    const updateQueue1 = await prisma.queue.update({
        where: {id: queueId1},
        data: {youtubeVideoId: queue2.youtubeVideoId},
        include: {youtubeVideo: true}
    })

    return {
        queue1: updateQueue1,
        queue2: updateQueue2
    }
}