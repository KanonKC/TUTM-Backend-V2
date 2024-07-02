import { searchYoutubePlaylist, searchYoutubeVideo } from "../services/Youtube.service"
import { YoutubeBaseAttributes } from "../types/youtube"

export async function searchYoutubeVideoAsBaseAttributes(query: string): Promise<YoutubeBaseAttributes[]> {
    const response = await searchYoutubeVideo(query)
    return response.items.map(item => (
        {
            title: item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium.url,
            url: item.id.videoId
        }
    ))
}

export async function searchYoutubePlaylistAsBaseAttributes(playlistId: string): Promise<YoutubeBaseAttributes[]> {
    const response = await searchYoutubePlaylist(playlistId)
    return response.items.map(item => (
        {
            title: item.snippet.title,
            channelTitle: item.snippet.videoOwnerChannelTitle,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium.url,
            url: item.snippet.resourceId.videoId
        }
    ))
}