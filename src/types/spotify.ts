export interface SpotifyAuthorization {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

export interface SpotifyCurrentUserProfile {
	country: string;
	display_name: string;
	email: string;
	explicit_content: {
		filter_enabled: boolean;
		filter_locked: boolean;
	};
	external_urls: {
        spotify: string;
    };
	followers: {
        href: string;
        total: number;
    };
	href: string;
	id: string;
	images: {
        url: string;
        height: number;
        width: number;
    }[];
	product: string;
	type: string;
	uri: string;
}

export interface SpotifyArtist {
	external_urls: { spotify: string };
    href: string;
    id: string;
    name: string;
    type: "artist";
    uri: string;
}

export interface SpotifyAlbum {
	album_type: string;
	total_tracks: number;
	available_markets: string[];
	external_urls: { spotify: string };
	href: string;
	id: string;
	images: {
        url: string;
        height: number;
        width: number;
    }[];
	name: string;
	release_date: string;
	release_date_precision: string;
	restrictions: { reason: string };
	type: string;
	uri: string;
	artists: SpotifyArtist[];
}

export interface SpotifyTrack {
	album: SpotifyAlbum;
	artists: SpotifyArtist[];
	available_markets: string[];
	disc_number: number;
	duration_ms: number;
	explicit: boolean;
	external_ids: { isrc: string; ean: string; upc: string };
	external_urls: { spotify: string };
	href: string;
	id: string;
	is_playable: boolean;
	linked_from: {};
	restrictions: { reason: string };
	name: string;
	popularity: number;
	preview_url: string;
	track_number: number;
	type: "track";
	uri: string;
	is_local: boolean;
}

export interface SpotifySearchResult {
    tracks: {
        items: SpotifyTrack[]
    }
}