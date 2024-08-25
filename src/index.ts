import { configDotenv } from 'dotenv';
import server from './router'

configDotenv();

server.listen({ port: Number(process.env.BACKEND_PORT) }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  
  console.log(`Server listening at ${address}`)
})