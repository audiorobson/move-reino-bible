export const MOVE_REINO_ARTIST_ID = "7czExjeIM8OZlCEXla8UBY";

export const MOVE_REINO_ARTIST_URI = `spotify:artist:${MOVE_REINO_ARTIST_ID}`;

/** Faixas populares do Move Reino (catálogo Spotify). */
export const MOVE_REINO_TRACK_URIS = [
  "spotify:track:1Ec5DhjMCJUmOYStpHnv2l",
  "spotify:track:4AHBwGRLvUAXPrmA085PI5",
  "spotify:track:380JuomIT6pW33efftfkKN",
  "spotify:track:3TaP2DtOEXSHcdUzoLNFJD",
  "spotify:track:0uVozGBPep8p13P9cAiayl",
] as const;

export function pickRandomMoveReinoTrack(): string {
  const index = Math.floor(Math.random() * MOVE_REINO_TRACK_URIS.length);
  return MOVE_REINO_TRACK_URIS[index] ?? MOVE_REINO_ARTIST_URI;
}
