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

export async function getPlaylistById(playlistId: string) {
	const playlist = await prisma.playlist.findUniqueOrThrow({
		where: { id: playlistId },
		include: {
			queues: {
				where: { playlistId },
				orderBy: { order: "asc" },
                include: { youtubeVideo: true },
			},
			currentQueue: {
				include: { youtubeVideo: true },
			},
		},
	});

	if (!playlist) throw new Error("Playlist not found");

	return playlist;
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
			currentQueue: true,
			queues: {
				orderBy: { order: "asc" },
			},
		},
	});

	if (!playlist) throw new Error("Playlist not found");

	let nextQueueOrder = 0;
	if (playlist.currentQueue) {
		if (!playlist.currentQueue.order)
			throw new Error("Queue order not found");
		nextQueueOrder =
			(playlist.currentQueue.order + 1) % playlist.queues.length;
	}

	const nextQueue = await prisma.queue.findUniqueOrThrow({
		where: {
			playlistId_order: {
				playlistId: playlistId,
				order: nextQueueOrder,
			},
		},
	});

	return prisma.playlist.update({
		where: { id: playlistId },
		data: { currentQueueId: nextQueue.id },
	});
}

export async function playPrevious(playlistId: string) {
	const playlist = await prisma.playlist.findUnique({
		where: { id: playlistId },
		include: {
			currentQueue: true,
			queues: {
				orderBy: { order: "asc" },
			},
		},
	});

	if (!playlist) throw new Error("Playlist not found");

	let prevQueueOrder = playlist.queues.length - 1;
	if (playlist.currentQueue) {
		if (!playlist.currentQueue.order)
			throw new Error("Queue order not found");
		prevQueueOrder =
			(playlist.currentQueue.order - 1) % playlist.queues.length;
	}

	const prevQueue = await prisma.queue.findUniqueOrThrow({
		where: {
			playlistId_order: {
				playlistId: playlistId,
				order: prevQueueOrder,
			},
		},
	});

	return prisma.playlist.update({
		where: { id: playlistId },
		data: { currentQueueId: prevQueue.id },
	});
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
