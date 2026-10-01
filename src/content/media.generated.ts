/* GENERADO por scripts/optimize-media.py — no editar a mano. */

export interface MediaEntry {
  width: number;
  height: number;
  aspect: number;
  /** Anchos disponibles, de menor a mayor. */
  widths: number[];
}

export const media = {
  "hero": { width: 1200, height: 1600, aspect: 0.75, widths: [640, 960] },
  "hero-wide": { width: 1792, height: 1008, aspect: 1.7778, widths: [640, 960, 1280, 1600] },
  "about": { width: 1200, height: 1600, aspect: 0.75, widths: [640, 960] },
  "cap-broadcast": { width: 1600, height: 1200, aspect: 1.3333, widths: [640, 960, 1280, 1600] },
  "cap-transmission": { width: 1200, height: 1600, aspect: 0.75, widths: [640, 960] },
  "cap-antennas": { width: 1200, height: 1600, aspect: 0.75, widths: [640, 960] },
  "cap-rf": { width: 1200, height: 1600, aspect: 0.75, widths: [640, 960] },
  "cap-critical": { width: 1792, height: 1008, aspect: 1.7778, widths: [640, 960, 1280, 1600] },
  "proj-am": { width: 1200, height: 1600, aspect: 0.75, widths: [640, 960] },
  "proj-stl": { width: 1728, height: 1152, aspect: 1.5, widths: [640, 960, 1280, 1600] },
} as const satisfies Record<string, MediaEntry>;

export type MediaKey = keyof typeof media;
