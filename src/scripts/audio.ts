// The radio's sound (FR-09): the music plays through the radio, with static, a heterodyne whistle and a
// lock click that follow the signal. Graph and numbers: docs/design/direction.md, "Sound".
//   <audio> → MediaElementSource → highpass → lowpass → music gain → analyser (fft 256) → volume → output
//   white noise (2 s loop) → bandpass 2200 Hz, Q 0.5 → noise gain → volume
//   sine oscillator (whistle) → whistle gain → volume
// Nothing exists before the first press of play or DIAL FX (no autoplay, QR-07). Every change glides
// (setTargetAtTime) so the filters never click, and a parameter is sent only when its target moves,
// so a radio at rest costs nothing. The context sleeps while there is neither music nor DIAL FX.
import { SOUND, movingFrom, soundTargets, type SoundTargets } from '../lib/sound';
import { FRAME_MS } from '../lib/tuning';
import type { RadioState } from './state';

type Key = keyof SoundTargets | 'volume';

/** Glide time constants in seconds (the mock's). */
const GLIDE: Record<Key, number> = {
  noise: 0.04,
  whistleHz: 0.03,
  whistle: 0.05,
  highpass: 0.06,
  lowpass: 0.06,
  music: 0.08,
  volume: 0.05,
};
const SPEED_KEEP = 0.85; // per 60 Hz frame: dial speed smoothing (mock)
const CONE_FALL = 0.85; // per 60 Hz frame: the cone falls back after a peak

export interface Sound {
  /** Makes the graph on the first call (inside a click), wakes it afterwards. */
  start(): void;
  /** Sleeps while there is neither music nor DIAL FX, wakes when there is. */
  sync(): void;
  render(dt: number, now: number): boolean;
}

export function createAudio(media: HTMLAudioElement, s: RadioState): Sound {
  const a = s.audio;
  let ac: AudioContext | null = null;
  let params: Record<Key, AudioParam> | null = null;
  let out: GainNode | null = null;
  let analyser: AnalyserNode | null = null;
  let wave = new Uint8Array(0);
  const sent: Partial<Record<Key, number>> = {};
  let speed = 0; // MHz per 60 Hz frame, smoothed
  let locked = s.locked;

  function build(ctx: AudioContext) {
    const volume = ctx.createGain();
    volume.gain.value = a.volume;
    volume.connect(ctx.destination);

    const buf = ctx.createBuffer(1, ctx.sampleRate * SOUND.noiseSeconds, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = SOUND.noiseHz;
    band.Q.value = SOUND.noiseQ;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    noise.connect(band).connect(noiseGain).connect(volume);
    noise.start();

    const whistle = ctx.createOscillator();
    whistle.type = 'sine';
    const whistleGain = ctx.createGain();
    whistleGain.gain.value = 0;
    whistle.connect(whistleGain).connect(volume);
    whistle.start();

    const high = ctx.createBiquadFilter();
    high.type = 'highpass';
    high.frequency.value = 20;
    const low = ctx.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 18500;
    const music = ctx.createGain();
    analyser = ctx.createAnalyser();
    analyser.fftSize = SOUND.fftSize;
    ctx.createMediaElementSource(media).connect(high).connect(low).connect(music).connect(analyser).connect(volume);

    a.bins = new Uint8Array(analyser.frequencyBinCount);
    wave = new Uint8Array(analyser.fftSize);
    out = volume;
    params = {
      noise: noiseGain.gain,
      whistleHz: whistle.frequency,
      whistle: whistleGain.gain,
      highpass: high.frequency,
      lowpass: low.frequency,
      music: music.gain,
      volume: volume.gain,
    };
  }

  /** Glide a parameter to v, unless it already heads there. */
  function send(key: Key, v: number, t: number) {
    const prev = sent[key];
    if (prev !== undefined && Math.abs(v - prev) <= Math.abs(prev) * 1e-3 + 1e-5) return;
    sent[key] = v;
    params![key].setTargetAtTime(v, t, GLIDE[key]);
  }

  /** The lock click: a short square-wave tick that fades out in 35 ms. */
  function click(ctx: AudioContext) {
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = SOUND.click.hz;
    g.gain.setValueAtTime(SOUND.click.gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + SOUND.click.ms / 1000);
    o.connect(g).connect(out!);
    o.start(t);
    o.stop(t + 0.05);
  }

  const wakeContext = () => {
    if (ac && ac.state !== 'running') ac.resume().catch(() => undefined);
  };

  return {
    start() {
      if (!ac) {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        // Without Web Audio the music still plays, straight from the <audio> element.
        if (!AC) return;
        ac = new AC();
        build(ac);
        locked = s.locked;
        a.ready = true;
      }
      wakeContext();
    },

    sync() {
      if (!ac) return;
      if (a.playing || a.fx) wakeContext();
      else if (ac.state === 'running') ac.suspend().catch(() => undefined);
    },

    render(dt: number): boolean {
      if (!ac || !params) return false;

      // Dial speed, as the mock measures it (MHz per 60 Hz frame), at any frame rate.
      const keep = Math.pow(SPEED_KEEP, dt / FRAME_MS);
      speed = speed * keep + (dt > 0 ? (Math.abs(s.df) * FRAME_MS) / dt : 0) * (1 - keep);
      if (speed < 1e-5) speed = 0;

      if (s.locked !== locked) {
        locked = s.locked;
        if (locked && a.fx && ac.state === 'running') click(ac);
      }

      const t = ac.currentTime;
      const targets = soundTargets({
        strength: s.strength,
        dist: s.dist,
        locked: !!s.locked,
        moving: movingFrom(speed),
        fx: a.fx,
      });
      for (const key of Object.keys(targets) as (keyof SoundTargets)[]) send(key, targets[key], t);
      send('volume', a.volume, t);

      // The cone and the wall's spectrum follow the music, only while it plays and motion is allowed.
      const listen = a.playing && !s.reduceMotion && !!analyser;
      const fall = Math.pow(CONE_FALL, dt / FRAME_MS);
      if (listen) {
        analyser!.getByteFrequencyData(a.bins);
        analyser!.getByteTimeDomainData(wave);
        let peak = 0;
        for (let i = 0; i < wave.length; i++) peak = Math.max(peak, Math.abs(wave[i] - 128));
        a.level = Math.max(peak / 128, a.level * fall);
      } else if (a.level > 0) {
        a.level = a.level < 0.002 ? 0 : a.level * fall;
      }
      return speed > 0 || listen || a.level > 0;
    },
  };
}
