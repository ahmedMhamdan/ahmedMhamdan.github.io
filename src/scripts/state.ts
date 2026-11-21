// The one state object. The tuner writes the signal once per frame; the player and the audio write
// `audio`; every other module only reads it.
import type { StationInfo } from '../lib/dial';
import { SOUND } from '../lib/sound';

export interface AudioState {
  /** The Web Audio graph exists (made on the first press of play or DIAL FX, never before). */
  ready: boolean;
  /** The music is playing. */
  playing: boolean;
  /** DIAL FX: static, whistle, filters and the lock click follow the dial. */
  fx: boolean;
  /** 0..1 */
  volume: number;
  /** Music level 0..1 for the speaker cone (0 with reduced motion). */
  level: number;
  /** Analyser bins 0..255, low to high, for the wall's spectrum (empty until the graph exists). */
  bins: Uint8Array<ArrayBuffer>;
}

export interface RadioState {
  /** All stations in dial order. */
  stations: StationInfo[];
  /** Frequency on the dial (MHz) and where it is heading. */
  f: number;
  target: number;
  /** The knob is being dragged: f follows the hand directly. */
  dragging: boolean;
  /** performance.now() of the last tuning input (AFC waits for the dial to rest). */
  lastMove: number;

  // Derived by the tuner each frame.
  near: StationInfo;
  /** MHz from f to the nearest station. */
  dist: number;
  /** 0..1 */
  strength: number;
  /** Station inside the lock window this frame, or null between stations. */
  locked: StationInfo | null;
  /** AFC lamp. */
  afc: boolean;
  /** Band row under the needle, 0–4. */
  row: number;
  /** MHz the dial moved this frame (drives the antenna). */
  df: number;
  /** Station the dial has come to rest on; its page is the one in the address bar. */
  current: StationInfo;

  reduceMotion: boolean;

  audio: AudioState;
}

export function createState(stations: StationInfo[], currentId: string, reduceMotion: boolean): RadioState {
  const current = stations.find((s) => s.id === currentId) ?? stations[0];
  return {
    stations,
    f: current.freq,
    target: current.freq,
    dragging: false,
    lastMove: 0,
    near: current,
    dist: 0,
    strength: 1,
    locked: current,
    afc: false,
    row: current.row,
    df: 0,
    current,
    reduceMotion,
    audio: { ready: false, playing: false, fx: false, volume: SOUND.volume, level: 0, bins: new Uint8Array(0) },
  };
}

/** Required element inside `root`; a missing hook stops the script and leaves the static page working. */
export function need<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Radio: missing ${selector}`);
  return el;
}
