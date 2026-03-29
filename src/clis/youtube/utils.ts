/**
 * Shared YouTube utilities — URL parsing, video ID extraction, etc.
 */
import type { IPage } from '../../types.js';

/**
 * Extract a YouTube video ID from a URL or bare video ID string.
 * Supports: watch?v=, youtu.be/, /shorts/, /embed/, /live/, /v/
 */
export function parseVideoId(input: string): string {
  if (!input.startsWith('http')) return input;

  try {
    const parsed = new URL(input);
    if (parsed.searchParams.has('v')) {
      return parsed.searchParams.get('v')!;
    }
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1).split('/')[0];
    }
    // Handle /shorts/xxx, /embed/xxx, /live/xxx, /v/xxx
    const pathMatch = parsed.pathname.match(/^\/(shorts|embed|live|v)\/([^/?]+)/);
    if (pathMatch) return pathMatch[2];
  } catch {
    // Not a valid URL — treat entire input as video ID
  }

  return input;
}

export function buildQuietPlaybackJs(): string {
  return `
    (async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const deadline = Date.now() + 5000;

      while (Date.now() < deadline) {
        let quieted = false;

        try {
          const player = window.movie_player;
          if (player?.mute) {
            player.mute();
            quieted = true;
          }
          if (player?.pauseVideo) {
            player.pauseVideo();
            quieted = true;
          }
        } catch {}

        try {
          const media = document.querySelector('video');
          if (media) {
            media.muted = true;
            media.pause();
            quieted = true;
          }
        } catch {}

        if (quieted) return true;
        await wait(100);
      }

      return false;
    })()
  `;
}

export async function quietWatchPlayback(page: IPage): Promise<void> {
  try {
    await page.evaluate(buildQuietPlaybackJs());
  } catch {
    // Best-effort only — metadata/transcript extraction should continue.
  }
}
