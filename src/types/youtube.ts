export interface YoutubeSearch {
    kind: string;
    etag: string;
    nextPageToken: string;
    regionCode: string;
    pageInfo: {
        totalResults: number;
        resultsPerPage: number;
    }
    items: {
        kind: string;
        etag: string;
        id: {
            kind: string;
            videoId: string;
        }
        snippet: {
            publishedAt: string;
            channelId: string;
            title: string;
            description: string;
            thumbnails: {
                default: {
                    url: string;
                    width: number;
                    height: number;
                }
                medium: {
                    url: string;
                    width: number;
                    height: number;
                }
                high: {
                    url: string;
                    width: number;
                    height: number;
                }
            }
            channelTitle: string;
            liveBroadcastContent: string;
        }
    }[]
}

export interface YoutubeSnippet {
    items: {
        id: string;
        snippet: {
            title: string;
            channelTitle: string;
            description: string;
            thumbnails: {
                default: {
                    url: string;
                },
                medium: {
                    url: string;
                }
            }
        }
    }[]
}

export interface YoutubeContentDetails {
    items: {
        contentDetails: {
            duration: string;
        }
    }[]
}