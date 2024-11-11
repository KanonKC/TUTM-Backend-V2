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
    console.log("index1", index1, "index2", index2);
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

	let isChangeFirstIndex = false;
    let isBackwardSwap = false;

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
        isBackwardSwap = true;
		if (index2 === 0) {
			isChangeFirstIndex = true;
			minIndex = 0;
		} else {
			minIndex = index2 - 1;
		}

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

	if (!isChangeFirstIndex) {
		console.log(`Change ${targetQueue?.id} nextQueueId to null`);

		await prisma.queue.update({
			where: { id: targetQueue?.id },
			data: { nextQueueId: null },
		});
	}

	console.log(`Change ${prevQueue?.id} nextQueueId to ${queue.nextQueueId}`);

	if (prevQueue) {
		await prisma.queue.update({
			where: { id: prevQueue.id },
			data: { nextQueueId: queue.nextQueueId },
		});
	} else {
		await prisma.queue.update({
			where: { id: targetQueue.id },
			data: { nextQueueId: queue.nextQueueId },
		});
	}

	if (isChangeFirstIndex) {
		console.log(`Change ${queue.id} nextQueueId to ${targetQueue.id}`);
		await prisma.queue.update({
			where: { id: queue.id },
			data: { nextQueueId: targetQueue.id },
		});
	} else {
		console.log(
			`Change ${queue.id} nextQueueId to ${targetQueue?.nextQueueId}`
		);
		await prisma.queue.update({
			where: { id: queue.id },
			data: { nextQueueId: targetQueue.nextQueueId },
		});
	}

	if (!isChangeFirstIndex) {
		console.log(`Change ${targetQueue?.id} nextQueueId to ${queue.id}`);
		await prisma.queue.update({
			where: { id: targetQueue.id },
			data: { nextQueueId: queue.id },
		});
	}

    console.log('-------------------------------------')

	const { firstQueueId, lastQueueId } = playlist;
	if (firstQueueId === queue.id) {
        console.log("Change first queue id to targetQueue.id", targetQueue.id);
		await prisma.playlist.update({
			where: { id: playlist.id },
			data: { firstQueueId: queue.nextQueueId },
		});
	} else if (firstQueueId === targetQueue.id && isChangeFirstIndex) {
        console.log("Change first queue id to queue.id", queue.id);
		await prisma.playlist.update({
			where: { id: playlist.id },
			data: { firstQueueId: queue.id },
		});
	}

	if (lastQueueId === queue.id) {
        if (isBackwardSwap && !isChangeFirstIndex) {
            console.log("Change last queue id to targetQueue.nextQueueId", targetQueue.nextQueueId);
            await prisma.playlist.update({
                where: { id: playlist.id },
                data: { lastQueueId: targetQueue.nextQueueId },
            });
        } else {

            console.log("Change last queue id to targetQueue.id", targetQueue.id);
            await prisma.playlist.update({
                where: { id: playlist.id },
                data: { lastQueueId: targetQueue.id },
            });
        }
	} else if (lastQueueId === targetQueue.id) {
        console.log("Change last queue id to queue.id", queue.id);
		await prisma.playlist.update({
			where: { id: playlist.id },
			data: { lastQueueId: queue.id },
		});
	}

	return {};

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
