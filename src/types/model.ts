export interface Playlist {
    id: string;
    // code: string;
    current_index: number | null;
}

export interface PlaylistCreation {
    // code: string;
    id: string;
    current_index: number | null;
}

export interface YoutubeVideo {
    id: string;
    youtube_id: string;
    title: string;
    channel_title: string;
    description: string;
    thumbnail: string;
    duration: number;
    is_cleared: boolean;
    total_played: number;
}

export interface YoutubeVideoCreation {
    youtube_id: string;
    title: string;
    channel_title: string;
    description: string;
    thumbnail: string;
    duration: number;
}

export interface Queue {
    id: string;
    video_id: string;
    playlist_id: string;
    played_count: number;
}

export interface QueueCreation {
    video_id: string;
    playlist_id: string;
}

export interface ListAPIResponse<T> {
    data: T;
    total: number;
}