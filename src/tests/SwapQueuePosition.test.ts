import { createPlaylist } from "../controllers/playlist"
import { addVideoToQueue } from "../controllers/queue"

beforeEach(async () => {
    try {
        await createPlaylist({ id: "000000"})
    } catch (error) {}

    addVideoToQueue("000000", "1")
})

describe('SwapQueuePosition', () => {
    
})