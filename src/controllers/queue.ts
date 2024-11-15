import { Queue, YoutubeVideo } from "@prisma/client";
import { prisma } from "../prisma";
import { getYoutubeVideoData } from "../services/Youtube.service";
import { playNext } from "./playlist";
import { getTrack } from "../services/Spotify.service";

export async function getAllQueuesInPlaylist(playlistId: string) {
	const queues = await prisma.queue.findMany({
		where: { playlistId },
		include: { youtubeVideo: true },
		orderBy: { order: "asc" },
	});

	return queues;
}

export async function getNextQueueOrder(playlistId: string) {
	const queues = await getAllQueuesInPlaylist(playlistId);
	return queues.length === 0
		? 0
		: Math.max(...queues.map((q) => q.order ?? -1)) + 1;
}

export async function addYoutubeVideoToQueue(
	playlistId: string,
	videoId: string
) {
	const playlist = await prisma.playlist.findUnique({
		where: { id: playlistId },
	});

	if (!playlist) {
		throw new Error("Playlist not found");
	}

	const videoData = await getYoutubeVideoData(videoId);
	const nextOrder = await getNextQueueOrder(playlistId);

	const queue = await prisma.queue.create({
		data: {
			playlistId,
			order: nextOrder,
			youtubeVideo: {
				create: {
					youtubeId: videoData.url,
					title: videoData.title,
					channelTitle: videoData.channel_title,
					description: videoData.description.slice(0, 255),
					thumbnail: videoData.thumbnail,
					duration: videoData.duration,
				},
			},
		},
		include: { youtubeVideo: true },
	});

	return {
		...queue,
		video: queue.youtubeVideo,
	};
}

export async function addSpotifyTrackToQueue(
	playlistId: string,
	trackId: string
) {

    const playlist = await prisma.playlist.findUnique({
		where: { id: playlistId },
		include: { owner: true },
	});

    if (!playlist) {
		throw new Error("Playlist not found");
	}


    if (!playlist.owner?.spotifyAccessToken) {
		throw new Error("Playlist owner has not connected Spotify");
	}

    const { data: track } = await getTrack(
		trackId,
		playlist.owner.spotifyAccessToken
	);

    const nextOrder = await getNextQueueOrder(playlistId);

    return prisma.queue.create({
        data: {
            type: 'spotify-track',
            playlistId,
            order: nextOrder,
            spotifyTrack: {
                create: {
                    spotifyUri: track.uri,
                    title: track.name,
                    artist: track.artists.map(a => a.name).join(', '),
                    thumbnail: track.album.images[0].url,
                    duration: Math.ceil(track.duration_ms/1000),
                }
            }
        },
        include: { spotifyTrack: true }
    })
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
