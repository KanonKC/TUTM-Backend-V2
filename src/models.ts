import { DataTypes, ModelDefined, UUIDV4 } from "sequelize";
import { Playlist, PlaylistCreation, Queue, QueueCreation, YoutubeVideo, YoutubeVideoCreation } from "./types/model";
import sequelize from "./database";

export const PlaylistModel:ModelDefined<Playlist, PlaylistCreation> = sequelize.define('Playlist', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    current_index: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    }
})

export const YoutubeVideoModel:ModelDefined<YoutubeVideo, YoutubeVideoCreation> = sequelize.define('YoutubeVideo', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: UUIDV4,
    },
    youtube_id: {
        type: DataTypes.STRING,
    },
    title: {
        type: DataTypes.STRING,
    },
    channel_title: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
    },
    thumbnail: {
        type: DataTypes.STRING,
    },
    duration: {
        type: DataTypes.INTEGER,
    },
    is_cleared: {
        type: DataTypes.BOOLEAN,
    },
    total_played: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
})

export const QueueModel:ModelDefined<Queue, QueueCreation> = sequelize.define('Queue', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: UUIDV4,
    },
    video_id: {
        type: DataTypes.STRING,
    },
    playlist_id: {
        type: DataTypes.STRING,
    },
    played_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
})

PlaylistModel.hasMany(QueueModel, {
    foreignKey: 'playlist_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
})

// QueueModel.belongsTo(PlaylistModel, {
//     foreignKey: 'playlist_id',
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE',
// })

YoutubeVideoModel.hasMany(QueueModel, {
    foreignKey: 'video_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
})

// QueueModel.belongsTo(YoutubeVideoModel, {
//     foreignKey: 'video_id',
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE',
// })

sequelize.sync().then(() => {
    console.log('DB tables created successfully!');
}).catch((error) => {
    console.error('Unable to create table : ', error);
});