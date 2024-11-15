import { createPlaylist } from "../controllers/playlist"
import { addYoutubeVideoToQueue } from "../controllers/queue"

beforeEach(async () => {
    try {
        await createPlaylist({ id: "000000"})
    } catch (error) {}

    addYoutubeVideoToQueue("000000", "1")
})

describe('SwapQueuePosition', () => {
    
})