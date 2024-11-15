import { configDotenv } from "dotenv";
import { generateRandomString } from "../utilities/RandomString";
import { SpotifyAuthorization, SpotifyCurrentUserProfile, SpotifySearchResult, SpotifyTrack } from "../types/spotify";
import axios, { AxiosResponse } from "axios";

configDotenv();
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

const scopes = [
	"streaming",
	"user-read-email",
	"user-read-private",
	"user-read-playback-state",
	"user-modify-playback-state",
];

const spotifyAPI = axios.create({
	baseURL: "https://api.spotify.com/v1",
});

export function createSpotifyOAuthUrl() {
	const randomString = generateRandomString(16);
	return `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=${scopes.join(
		"%20"
	)}&redirect_uri=${
		window.location.origin
	}/spotify/callback&state=${randomString}`;
}

export async function getSpotifyUserLoginAccessToken(
	code: string
): Promise<AxiosResponse<SpotifyAuthorization>> {
	const authOptions = {
		url: "https://accounts.spotify.com/api/token",
		form: {
			code: code,
			redirect_uri: `${window.location.origin}/spotify/callback`,
			grant_type: "authorization_code",
		},
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization:
				"Basic " +
				Buffer.from(
					SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET
				).toString("base64"),
		},
		json: true,
	};

	return axios.post(authOptions.url, authOptions.form, {
		headers: authOptions.headers,
	});
}

export async function getSpotifyCurrentUserProfile(accessToken: string) {
    return spotifyAPI.get<SpotifyCurrentUserProfile>("/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

export async function searchTracks(query: string, accessToken: string): Promise<AxiosResponse<SpotifySearchResult>> {
    return spotifyAPI.get('/search', {
        params: {
            q: query,
            type: 'track',
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
}

export async function getTrack(trackId: string, accessToken: string): Promise<AxiosResponse<SpotifyTrack>> {

    return spotifyAPI.get(`/tracks/${trackId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
}