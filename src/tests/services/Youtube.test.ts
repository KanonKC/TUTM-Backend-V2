import { searchPlaylist, searchVideo } from "../../services/Youtube.service";

searchVideo("avenger").then((data) => {
    console.log(data)
})

searchPlaylist("RDrjyvSyl5eEw").then((data) => {
    console.log(data)
})