import { ExternalLink } from "lucide-react";



const SPOTIFY_ARTIST_URL =

  "https://open.spotify.com/intl-pt/artist/7czExjeIM8OZlCEXla8UBY?si=MbnECaoBR5KiGsMvPx63Sg";



function SpotifyIcon({ size = 20 }: { size?: number }) {

  return (

    <svg

      width={size}

      height={size}

      viewBox="0 0 24 24"

      fill="currentColor"

      aria-hidden

      className="sidebar-spotify__icon"

    >

      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />

    </svg>

  );

}



async function openSpotifyChannel() {

  if (window.mrb?.openExternal) {

    await window.mrb.openExternal(SPOTIFY_ARTIST_URL);

    return;

  }

  window.open(SPOTIFY_ARTIST_URL, "_blank", "noopener,noreferrer");

}



interface SpotifySidebarCardProps {

  collapsed: boolean;

}



export function SpotifySidebarCard({ collapsed }: SpotifySidebarCardProps) {

  if (collapsed) {

    return (

      <button

        type="button"

        className="sidebar-spotify sidebar-spotify--collapsed"

        onClick={openSpotifyChannel}

        title="Ouça Move Reino no Spotify"

        aria-label="Abrir canal Move Reino no Spotify"

      >

        <SpotifyIcon size={22} />

      </button>

    );

  }



  return (

    <section className="sidebar-spotify" aria-label="Move Reino no Spotify">

      <div className="sidebar-spotify__body">

        <div className="sidebar-spotify__art" aria-hidden>

          <SpotifyIcon size={26} />

        </div>

        <div className="sidebar-spotify__copy">

          <p className="sidebar-spotify__name">Move Reino</p>

          <p className="sidebar-spotify__tagline">Louvor & adoração</p>

          <p className="sidebar-spotify__hint">Ouça nossas músicas no Spotify</p>

        </div>

      </div>



      <button type="button" className="sidebar-spotify__play" onClick={openSpotifyChannel}>

        <ExternalLink size={15} strokeWidth={2} aria-hidden />

        <span>Ouça no Spotify</span>

      </button>

    </section>

  );

}

