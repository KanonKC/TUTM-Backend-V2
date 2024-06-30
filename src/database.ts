import { configDotenv } from "dotenv";
import { Dialect, Sequelize } from "sequelize";

configDotenv();

const sequelize = new Sequelize(
	process.env.DATABASE_NAME as string,
	process.env.DATABASE_USER as string,
	process.env.DATABASE_PASSWORD as string,
	{
		host: process.env.DATABASE_HOST as string,
		dialect: process.env.DATABASE_DIALECT as Dialect,
	}
);

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});

export default sequelize;