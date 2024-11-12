import { Queue, YoutubeVideo } from "@prisma/client";
import { prisma } from "../prisma";
import { getYoutubeVideoData } from "../services/Youtube.service";
import { playNext } from "./playlist";

export async function getAllQueuesInPlaylist(playlistId: string) {
	const queues = await prisma.queue.findMany({
		where: { playlistId },
		include: { youtubeVideo: true },
		orderBy: { order: "asc" },
	});

	return queues;
}

export async function addVideoToQueue(playlistId: string, videoId: string) {
	let videoModel: YoutubeVideo | null = null;
	try {
		videoModel = await prisma.youtubeVideo.findUnique({
			where: { id: videoId },
		});
		if (!videoModel) {
			throw new Error("Video not found");
		}
	} catch (err) {
		const videoData = await getYoutubeVideoData(videoId);
		videoModel = await prisma.youtubeVideo.create({
			data: {
				youtubeId: videoData.url,
				title: videoData.title,
				channelTitle: videoData.channel_title,
				description: videoData.description.slice(0, 255),
				thumbnail: videoData.thumbnail,
				duration: videoData.duration,
			},
		});

		if (!videoModel) {
			throw new Error("Failed to create video");
		}
	}

	const playlist = await prisma.playlist.findUnique({
		where: { id: playlistId },
	});

	if (!playlist) {
		throw new Error("Playlist not found");
	}

	const queues = await getAllQueuesInPlaylist(playlistId);

    const nextOrder =
		queues.length === 0
			? 0
			: Math.max(...queues.map((q) => q.order ?? -1)) + 1;
	const video = videoModel;

	const queue = await prisma.queue.create({
		data: {
			playlistId,
			youtubeVideoId: video.id,
			order: nextOrder,
		},
	});

	return {
		...queue,
		video,
	};
}

export async function clearQueueInPlaylist(playlistId: string) {
	await prisma.queue.deleteMany({ where: { playlistId } });
	await prisma.playlist.update({
		where: { id: playlistId },
		data: {
			currentQueueId: null,
		},
	});
	return true;
}

export async function getQueueById(queueId: string) {
	const queue = await prisma.queue.findUnique({
		where: { id: queueId },
		include: { youtubeVideo: true },
	});

	if (!queue) throw new Error("Queue not found");

	return queue;
}

export async function deleteQueueById(queueId: string) {
	const queue = await prisma.queue.findUniqueOrThrow({
		where: { id: queueId },
		include: { playlist: true },
	});

	if (queue.playlist.currentQueueId === queueId) {
		try {
			await playNext(queue.playlistId);
		} catch (error) {}
	}
	await prisma.queue.delete({
		where: { id: queueId },
	});

	const queueList = await getAllQueuesInPlaylist(queue.playlistId);

	for (let i = 0; i < queueList.length; i++) {
		await prisma.queue.update({
			where: { id: queueList[i].id },
			data: { order: i },
		});
	}

	return true;
}

export async function increaseQueuePlayedCount(queueId: string) {
	return await prisma.queue.update({
		where: { id: queueId },
		data: { playedCount: { increment: 1 } },
	});
}

export interface ReOrderQueuePayload {
	queues: {
		queueId: string;
		order: number;
	}[];
}

export async function reOrderQueue(
	playlistId: string,
	payload: ReOrderQueuePayload
) {
	await prisma.queue.updateMany({
		where: { playlistId },
		data: { order: null },
	});
	for (let i = 0; i < payload.queues.length; i++) {
		await prisma.queue.update({
			where: { id: payload.queues[i].queueId },
			data: { order: payload.queues[i].order },
		});
	}
	return true;
}
