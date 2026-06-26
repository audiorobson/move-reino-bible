const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const DEFAULT_ARTIST_ID = "7czExjeIM8OZlCEXla8UBY";

export interface SpotifyTrackDto {
  id: string;
  name: string;
  uri: string;
  previewUrl: string | null;
  albumImage: string | null;
  durationMs: number;
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;
let topTracksCache: { artistId: string; market: string; tracks: SpotifyTrackDto[]; expiresAt: number } | null =
  null;

const TOP_TRACKS_TTL_MS = 6 * 60 * 60 * 1000;

function getCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

async function getAccessToken(): Promise<string | null> {
  const creds = getCredentials();
  if (!creds) return null;

  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  const body = new URLSearchParams({ grant_type: "client_credentials" });
  const auth = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64");

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return tokenCache.token;
}

export function isSpotifyConfigured(): boolean {
  return getCredentials() !== null;
}

export async function getArtistTopTracks(
  artistId = process.env.SPOTIFY_ARTIST_ID?.trim() || DEFAULT_ARTIST_ID,
  market = "BR"
): Promise<SpotifyTrackDto[] | null> {
  const cached = topTracksCache;
  if (cached && cached.artistId === artistId && cached.market === market && Date.now() < cached.expiresAt) {
    return cached.tracks;
  }

  const token = await getAccessToken();
  if (!token) return null;

  const url = `${SPOTIFY_API_BASE}/artists/${artistId}/top-tracks?market=${encodeURIComponent(market)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    tracks: Array<{
      id: string;
      name: string;
      uri: string;
      preview_url: string | null;
      duration_ms: number;
      album?: { images?: Array<{ url: string }> };
    }>;
  };

  const tracks: SpotifyTrackDto[] = data.tracks.map((track) => ({
    id: track.id,
    name: track.name,
    uri: track.uri,
    previewUrl: track.preview_url,
    durationMs: track.duration_ms,
    albumImage: track.album?.images?.[0]?.url ?? null,
  }));

  topTracksCache = {
    artistId,
    market,
    tracks,
    expiresAt: Date.now() + TOP_TRACKS_TTL_MS,
  };

  return tracks;
}
