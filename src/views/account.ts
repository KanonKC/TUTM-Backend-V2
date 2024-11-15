import { FastifyReply, FastifyRequest } from "fastify";
import { createOrUpdateAccountBySpotifyAccount, getAccountBySpotifyAccount } from "../controllers/account";
import { SpotifyAuthorization } from "../types/spotify";

export async function createOrUpdateAccountBySpotifyAccountView(
	request: FastifyRequest<{
        Body: SpotifyAuthorization
    }>,
	reply: FastifyReply
) {
	const account = await createOrUpdateAccountBySpotifyAccount(request.body);
	return reply.send(account);
}

export async function getAccountBySpotifyAccountView(
	request: FastifyRequest<{
        Headers: { 'authorization': string }
    }>,
	reply: FastifyReply
) {
    const auth = request.headers['authorization'];
    if (!auth) {
        return reply.code(401).send({ message: 'Unauthorized' });
    }
    const accessToken = String(auth).split(' ')[1];
	const account = await getAccountBySpotifyAccount(accessToken);
	return reply.send(account);
}