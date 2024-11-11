import { Queue, YoutubeVideo } from "@prisma/client";
import { prisma } from "../prisma";
import { getYoutubeVideoData } from "../services/Youtube.service";

export async function getAllQueuesInPlaylist(playlistId: string): Promise<
	{
		id: string;
		createdAt: Date;
		youtubeVideoId: string;
		playlistId: string;
		playedCount: number;
		nextQueueId: string | null;
		updateAt: Date;
		youtubeVideo: {
			id: string;
			createdAt: Date;
			youtubeId: string;
			title: string;
			channelTitle: string;
			description: string | null;
			thumbnail: string;
			duration: number;
			isCleared: boolean;
			totalPlayed: number;
		};
	}[]
> {
	const playlist = await prisma.playlist.findUniqueOrThrow({
		where: { id: playlistId },
	});

	const queues = await prisma.queue.findMany({
		where: { playlistId },
		include: { youtubeVideo: true },
	});

	const orderedQueues = [];
	const storedQueueIds: string[] = [];
	let currentQueueId = playlist.firstQueueId;

	while (currentQueueId !== null) {
		const queue = queues.find((q) => q.id === currentQueueId);
		if (queue && !storedQueueIds.includes(queue.id)) {
			orderedQueues.push(queue);
			storedQueueIds.push(queue.id);
			currentQueueId = queue.nextQueueId;
		} else {
			break;
		}
	}

	return orderedQueues;
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

	const video = videoModel;

	const queue = await prisma.queue.create({
		data: {
			playlistId,
			youtubeVideoId: video.id,
		},
	});

	if (playlist.lastQueueId) {
		await prisma.queue.update({
			where: { id: playlist.lastQueueId },
			data: {
				nextQueueId: queue.id,
			},
		});
	}

	await prisma.playlist.update({
		where: { id: playlistId },
		data: {
			firstQueueId: playlist.firstQueueId || queue.id,
			currentQueueId: playlist.currentQueueId || queue.id,
			lastQueueId: queue.id,
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
			firstQueueId: null,
			lastQueueId: null,
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
	const queue = await prisma.queue.findUnique({
		where: { id: queueId },
		include: { prevQueue: true },
	});
	if (!queue) throw new Error("Queue not found");

	const playlist = await prisma.playlist.findUnique({
		where: { id: queue.playlistId },
	});
	if (!playlist) throw new Error("Playlist not found");

	if (
		playlist.currentQueueId === playlist.firstQueueId &&
		playlist.currentQueueId === playlist.lastQueueId
	) {
		await prisma.playlist.update({
			where: { id: playlist.id },
			data: {
				currentQueueId: null,
				firstQueueId: null,
				lastQueueId: null,
			},
		});
	} else if (playlist.currentQueueId === playlist.firstQueueId) {
		await prisma.playlist.update({
			where: { id: playlist.id },
			data: {
				currentQueueId: queue.nextQueueId,
				firstQueueId: queue.nextQueueId,
			},
		});
	} else if (playlist.currentQueueId === playlist.lastQueueId) {
		await prisma.playlist.update({
			where: { id: playlist.id },
			data: {
				currentQueueId: queue.prevQueue?.id,
				lastQueueId: queue.prevQueue?.id,
			},
		});
	} else {
		await prisma.playlist.update({
			where: { id: playlist.id },
			data: {
				currentQueueId: queue.nextQueueId,
			},
		});
	}

	await prisma.queue.delete({ where: { id: queueId } });
	return true;
}

export async function increaseQueuePlayedCount(queueId: string) {
	return await prisma.queue.update({
		where: { id: queueId },
		data: { playedCount: { increment: 1 } },
	});
}

export async function swapQueuePosition(
	playlistId: string,
	index1: number,
	index2: number
) {
	if (index1 === index2) {
		return {
			queue1: null,
			queue2: null,
		};
	}

	const playlist = await prisma.playlist.findUniqueOrThrow({
		where: { id: playlistId },
	});

	const queues = await prisma.queue.findMany({
		where: { playlistId: playlist.id },
	});

	let minIndex = -1;
	let maxIndex = -1;

	let queue: Queue | undefined;
	let targetQueue: Queue | undefined;

	let currentIndex = 0;
	let currentQueueId = playlist.firstQueueId;

	if (index1 < index2) {
		minIndex = index1;
		maxIndex = index2;

		while (currentQueueId !== null) {
			const currentQueue = queues.find((q) => q.id === currentQueueId);
			if (!currentQueue) {
				break;
			}

			if (currentIndex === minIndex) {
				queue = currentQueue;
			} else if (currentIndex === maxIndex) {
				targetQueue = currentQueue;
				break;
			}

			currentIndex++;
			currentQueueId = currentQueue.nextQueueId;
		}
	} else {
		minIndex = index2-1;
		maxIndex = index1;

		while (currentQueueId !== null) {
			const currentQueue = queues.find((q) => q.id === currentQueueId);
			if (!currentQueue) {
				break;
			}

			if (currentIndex === minIndex) {
				targetQueue = currentQueue;
			} else if (currentIndex === maxIndex) {
				queue = currentQueue;
				break;
			}

			currentIndex++;
			currentQueueId = currentQueue.nextQueueId;
		}
	}

	// const targetQueue = queues.find((q) => q.id === currentQueueId);
	// const prevQueue = queue.prevQueue;

	if (!queue || !targetQueue) {
		throw new Error("Queue not found");
	}

	console.log("queue", queue.id, "targetQueue", targetQueue.id);

	const prevQueue = queues.find((q) => q.nextQueueId === queue.id);
    
    console.log(`Change ${queue.id} nextQueueId to null`);
	await prisma.queue.update({
		where: { id: queue.id },
		data: { nextQueueId: null },
	});

    console.log(`Change ${targetQueue?.id} nextQueueId to null`);

	await prisma.queue.update({
		where: { id: targetQueue?.id },
		data: { nextQueueId: null },
	});

    console.log(`Change ${prevQueue?.id} nextQueueId to ${queue.nextQueueId}`);

	await prisma.queue.update({
		where: { id: prevQueue?.id },
		data: { nextQueueId: queue.nextQueueId },
	});

    console.log(`Change ${queue.id} nextQueueId to ${targetQueue?.nextQueueId}`);

	const updateQueue1 = await prisma.queue.update({
		where: { id: queue.id },
		data: { nextQueueId: targetQueue?.nextQueueId },
	});

    console.log(`Change ${targetQueue?.id} nextQueueId to ${queue.id}`);

	const updateQueue2 = await prisma.queue.update({
		where: { id: targetQueue?.id },
		data: { nextQueueId: queue.id },
	});


	return {
		queue1: updateQueue1,
		queue2: updateQueue2,
	};

	// const updateQueue2 = await prisma.queue.update({
	// 	where: { id: queueId2 },
	// 	data: { youtubeVideoId: queue1.youtubeVideoId },
	// 	include: { youtubeVideo: true },
	// });

	// const updateQueue1 = await prisma.queue.update({
	// 	where: { id: queueId1 },
	// 	data: { youtubeVideoId: queue2.youtubeVideoId },
	// 	include: { youtubeVideo: true },
	// });

	// return {
	// 	queue1: updateQueue1,
	// 	queue2: updateQueue2,
	// };
}
