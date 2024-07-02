import { configDotenv } from "dotenv"
import { YoutubeContentDetails, YoutubePlaylist, YoutubeSearch, YoutubeSnippet } from "../types/youtube"
import { youtubeTimeFormatToSecond } from "../utilities/Youtube"

configDotenv()

const CREDENTIAL = process.env.YOUTUBE_API_KEY

export async function searchYoutubeVideo(query:string) {
    const response = await fetch(`https://youtube.googleapis.com/youtube/v3/search?q=${query}&type=video&maxResults=10&part=snippet&key=${CREDENTIAL}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    
    return response.json() as Promise<YoutubeSearch>
}

export async function searchYoutubePlaylist(playlistId:string) {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${CREDENTIAL}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    return response.json() as Promise<YoutubePlaylist>
}

export async function getYoutubeVideoData(keyId:string) {
    console.log(keyId)
    const snippet = await (await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${keyId}&key=${CREDENTIAL}`)).json() as YoutubeSnippet
    const contentDetails = await (await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${keyId}&key=${CREDENTIAL}`)).json() as YoutubeContentDetails

    console.log(snippet)

    return {
        title: snippet.items[0].snippet.title,
        channel_title: snippet.items[0].snippet.channelTitle,
        description: snippet.items[0].snippet.description,
        thumbnail: snippet.items[0].snippet.thumbnails.medium.url,
        url: keyId,
        duration: youtubeTimeFormatToSecond(contentDetails.items[0].contentDetails.duration)
    }

}