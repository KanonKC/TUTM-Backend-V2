import { Model } from "sequelize"
import { PlaylistModel, QueueModel, YoutubeVideoModel } from "../models"
import { Queue, QueueCreation, YoutubeVideo, YoutubeVideoCreation } from "../types/model"
import { getYoutubeVideoData } from "../services/Youtube.service"

export async function populateVideoFromQueues(queues:Model<Queue, QueueCreation>[]) {
    const populatedQueues = await Promise.all(queues.map(async queue => {
        const video = await YoutubeVideoModel.findOne({where: {id: queue.dataValues.video_id}})
        return {
            ...queue.dataValues,
            video: video?.dataValues
        }
    }))
    return populatedQueues

}

export async function getAllQueuesInPlaylist(playlistId: string) {
    const queues = await QueueModel.findAll({where: {playlist_id: playlistId},order: [['createdAt', 'ASC']]})
    return populateVideoFromQueues(queues)
}

export async function addVideoToQueue(playlistId: string, videoId: string) {
    let videoModel:Model<YoutubeVideo, YoutubeVideoCreation> | null = null
    try {
        videoModel = await YoutubeVideoModel.findOne({where: {id: videoId}})
        if (!videoModel) {
            throw new Error("Video not found")
        }
    }
    catch (err) {
        const videoData = await getYoutubeVideoData(videoId)
        videoModel = await YoutubeVideoModel.create({
            youtube_id: videoData.url,
            title: videoData.title,
            channel_title: videoData.channel_title,
            description: videoData.description.slice(0,255),
            thumbnail: videoData.thumbnail,
            duration: videoData.duration,
        })

        if (!videoModel) {
            throw new Error("Failed to create video")
        }
    }

    const playlistModel = await PlaylistModel.findOne({where: {id: playlistId}})

    if (!playlistModel) {
        throw new Error("Playlist not found")
    }

    const playlist = playlistModel.dataValues
    const video = videoModel.dataValues

    if (!(playlist.current_index && playlist.current_index > 0)) {
        await PlaylistModel.update({current_index: 0}, {where: {id: playlistId}})
    }
    console.log("Adding video to queue")
    const queueModel = await QueueModel.create({
        playlist_id: playlistId,
        video_id: video.id,
    })
    console.log("Adding video to queue")

    return {
        ...queueModel.dataValues,
        video
    }
}

export async function clearQueueInPlaylist(playlistId: string) {
    await QueueModel.destroy({where: {playlist_id: playlistId}})
    await PlaylistModel.update({current_index: null}, {where: {id: playlistId}})
    return true
}

export async function getQueueById(queueId: string) {
    const queueModel = await QueueModel.findOne({where: {id: queueId}})
    if (!queueModel) throw new Error('Queue not found')
    const quque = queueModel.dataValues
    const video = await YoutubeVideoModel.findOne({where: {id: quque.video_id}})
    return {
        ...quque,
        video: video?.dataValues
    }
}

export async function deleteQueueById(queueId: string) {
    const queueModel = await QueueModel.findOne({where: {id: queueId}})
    if (!queueModel) throw new Error('Queue not found')

    const playlistModel = await PlaylistModel.findOne({where: {id: queueModel.dataValues.playlist_id}})
    if (!playlistModel) throw new Error('Playlist not found')

    // Decrease one current index if the queue is before the current index
    const allQueuesModel = await QueueModel.findAll({where: {playlist_id: playlistModel.dataValues.id}})
    const allQueues = allQueuesModel.map(queue => queue.dataValues)
    const currentIndex = playlistModel.dataValues.current_index 

    if (currentIndex !== null) {
        const queueIndex = allQueues.findIndex(queue => queue.id === queueId)
        if (queueIndex < currentIndex) {
            await PlaylistModel.update({current_index: currentIndex - 1}, {where: {id: playlistModel.dataValues.id}})
        }
    }
    
    await queueModel.destroy()
    return true
}

export async function increaseQueuePlayedCount(queueId: string) {
    const queueModel = await QueueModel.findOne({where: {id: queueId}})
    if (!queueModel) throw new Error('Queue not found')
    const queue = queueModel.dataValues
    const newQueueModel = await queueModel.update({played_count: queue.played_count + 1})
    return newQueueModel.dataValues
}