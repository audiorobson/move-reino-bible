import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getArtistTopTracks, isSpotifyConfigured } from "../services/spotify.js";

const querySchema = z.object({
  artistId: z.string().optional(),
  market: z.string().length(2).default("BR"),
});

export async function spotifyRoutes(app: FastifyInstance) {
  app.get("/top-tracks", async (req, reply) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Parâmetros inválidos" });
    }

    const { artistId, market } = parsed.data;

    if (!isSpotifyConfigured()) {
      return {
        configured: false,
        fallback: true,
        tracks: [],
        message: "Spotify API não configurada (SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET).",
      };
    }

    const tracks = await getArtistTopTracks(artistId, market);
    if (!tracks) {
      return reply.status(502).send({
        configured: true,
        fallback: true,
        tracks: [],
        error: "Falha ao buscar faixas no Spotify.",
      });
    }

    return {
      configured: true,
      fallback: false,
      count: tracks.length,
      tracks,
    };
  });
}
