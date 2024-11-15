import { prisma } from "../prisma";
import { getSpotifyCurrentUserProfile } from "../services/Spotify.service";
import { SpotifyAuthorization } from "../types/spotify";

export interface CreateOrUpdateAccountBySpotifyAccountPayload
	extends SpotifyAuthorization {}

export async function createOrUpdateAccountBySpotifyAccount(
	payload: CreateOrUpdateAccountBySpotifyAccountPayload
) {
	const { data: spotifyUser } = await getSpotifyCurrentUserProfile(
		payload.access_token
	);

	return prisma.account.upsert({
		create: {
			username: spotifyUser.display_name,
			spotifyId: spotifyUser.id,
			spotifyAccessToken: payload.access_token,
			spotifyRefreshToken: payload.refresh_token,
			spotifyTokenExpiresAt: new Date(
				Date.now() + payload.expires_in * 1000
			),
		},
		update: {
			spotifyAccessToken: payload.access_token,
			spotifyRefreshToken: payload.refresh_token,
			spotifyTokenExpiresAt: new Date(
				Date.now() + payload.expires_in * 1000
			),
		},
		where: {
			spotifyId: spotifyUser.id,
		},
	});
}

export async function getAccountBySpotifyAccount(accessToken: string) {
	return prisma.account.findUnique({
		where: {
			spotifyAccessToken: accessToken,
		},
	});
}
