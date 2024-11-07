import { YoutubeVideo } from "@prisma/client";
import { prisma } from "../prisma";

export async function getAllPlaylists() {
	const playlists = await prisma.playlist.findMany();
	return playlists;
}

export async function createPlaylist(body: { id: string }) {
	const playlist = await prisma.playlist.create({
		data: {
			// slug: body.id,
			id: body.id,
			type: "linear",
		},
	});
	return playlist;
}

export async function getPlaylistWithCurrentVideoById(playlistId: string) {
	const playlist = await prisma.playlist.findUniqueOrThrow({
		where: { id: playlistId },
		include: {
			queues: {
				where: { playlistId },
				orderBy: { createdAt: "asc" },
			},
			currentQueue: {
				include: { youtubeVideo: true },
			},
		},
	});

	if (!playlist) throw new Error("Playlist not found");

	return { ...playlist, video: playlist.currentQueue?.youtubeVideo || null };
}

// export async function playIndex(playlistId: string, index: number) {
// 	const playlist = await prisma.playlist.findUnique({
// 		where: { id: playlistId },
// 	});

// 	if (!playlist) throw new Error("Playlist not found");

// 	await prisma.playlist.update({
// 		where: { id: playlistId },
// 		data: { currentIndex: index },
// 	});
// 	return playlist;
// }

export async function playByQueueId(playlistId: string, queueId: string) {
	const playlist = await prisma.playlist.findUnique({
		where: { id: playlistId },
	});

	if (!playlist) throw new Error("Playlist not found");

	const queue = await prisma.queue.findUnique({
		where: { id: queueId },
	});

	if (queue?.playlistId !== playlistId)
		throw new Error("Queue not found in playlist");

	return prisma.playlist.update({
		where: { id: playlistId },
		data: { currentQueueId: queueId },
	});
}

export async function playNext(playlistId: string) {
	const playlist = await prisma.playlist.findUnique({
		where: { id: playlistId },
		include: {
			firstQueue: true,
			lastQueue: true,
			currentQueue: true,
		},
	});

	if (!playlist) throw new Error("Playlist not found");

    let nextCurrentQueueId;

	// Current queue is null -> be first one
	if (!playlist.currentQueueId || !playlist.currentQueue) {
        nextCurrentQueueId = playlist.firstQueue?.id;
	}
	// Current queue is not null: (Last index)
	else if (playlist.currentQueueId === playlist.lastQueueId) {
		nextCurrentQueueId = playlist.firstQueue?.id;
	}
	// Current queue is not null: (Not last index)
	else {
		nextCurrentQueueId = playlist.currentQueue.nextQueueId;
	}

    return prisma.playlist.update({
        where: { id: playlistId },
        data: { currentQueueId: nextCurrentQueueId },
    })
}

export async function playPrevious(playlistId: string) {
	const playlist = await prisma.playlist.findUnique({
		where: { id: playlistId },
		include: {
			firstQueue: true,
			lastQueue: true,
			currentQueue: {
                include: { prevQueue: true },
            },
		},
	});

	if (!playlist) throw new Error("Playlist not found");

    let nextCurrentQueueId;

	// Current queue is null -> be first one
	if (!playlist.currentQueueId || !playlist.currentQueue) {
        nextCurrentQueueId = playlist.firstQueue?.id;
	}
	// Current queue is not null: (First index)
	else if (playlist.currentQueueId === playlist.firstQueueId) {
		nextCurrentQueueId = playlist.lastQueue?.id;
	}
	// Current queue is not null: (Not first index)
	else {
		nextCurrentQueueId = playlist.currentQueue.prevQueue?.id;
	}

    return prisma.playlist.update({
        where: { id: playlistId },
        data: { currentQueueId: nextCurrentQueueId },
    })
}

export async function playAlgorithm(playlistId: string) {
    throw new Error("Not implemented yet");
	// const playlist = await prisma.playlist.findUnique({
	// 	where: { id: playlistId },
	// });
	// const queues = await prisma.queue.findMany({
	// 	where: { playlistId },
	// 	orderBy: { createdAt: "asc" },
	// });

	// queues.forEach((queue) => console.log(queue));

	// if (!playlist) throw new Error("Playlist not found");

	// const start = playlist.currentIndex;
	// const queueCount = queues.length;
	// const minimumPlayedCount = Math.min(
	// 	...queues.map((queue) => queue.playedCount)
	// );

	// for (let i = 1; i < queueCount; i++) {
	// 	const index = ((start ?? 0) + i) % queueCount;
	// 	const queue = queues[index];
	// 	// console.log(index,queue.playedCount,minimumPlayedCount,queue.id)
	// 	if (queue.playedCount === minimumPlayedCount) {
	// 		await prisma.playlist.update({
	// 			where: { id: playlistId },
	// 			data: { currentIndex: index },
	// 		});
	// 		return playlist;
	// 	}
	// }
}
