// Interface strings in one place, so an Arabic (RTL) version can translate them later (QR-08).
// Station content lives in src/content/stations/; this file holds only the radio's own labels.

export const ui = {
  siteName: 'Ahmed Hamdan',
  siteRole: 'Cybersecurity · Full-stack',
  siteTagline: 'Cybersecurity graduate and full-stack developer',
  skipToContent: 'Skip to content',
  radio: 'Radio',
  stations: 'Stations',
  band: 'Band',
  tunedTo: 'Tuned to',
  tuningDial: 'Tuning dial',
  searching: 'SEARCHING',
  // LCD text for screen readers while the dial sits between stations.
  searchingText: 'Searching between stations',
  previousStation: 'Previous station',
  nextStation: 'Next station',
  // The LCD docked at the top of a phone screen: a press scrolls back up to the dial.
  backToDial: 'Back to the dial',
  tuning: 'TUNING',
  tuned: 'TUNED',
  afc: 'AFC',
  fm: 'FM',
  mhz: 'MHz',
  signal: 'SIGNAL',
  // Footer hint without JavaScript: the dial marks are plain links.
  hintStatic: { strong: 'Pick a station', rest: ' on the dial' },
  // Footer hint once the tuner script runs and the keyboard shortcuts work.
  hintLive: { strong: 'Turn the dial', rest: ' · 1–5 jump to a band · ← → next station' },
  // The same on a touch screen, where the dial window is dragged.
  hintTouch: { strong: 'Drag along the dial', rest: ' or tap a station' },
  // Panel between stations.
  idleKicker: 'BETWEEN STATIONS',
  idleHeading: 'Turn the dial',
  idleText: 'Or press 1 to 5 to jump to a band.',
  idleTextTouch: 'Let go near a station and it locks in.',
  placeholder: 'PLACEHOLDER',
  contactHeading: 'Reply on this frequency',
  contactAddress: 'ADDRESS',
  contactProfile: 'PROFILE',
  contactToConfirm: 'TO CONFIRM',
  // Music player (shown only when src/data/tracks.ts lists a track) and the volume knob.
  listen: 'What I listen to',
  track: 'Track',
  play: 'Play',
  pause: 'Pause',
  previousSong: 'Previous song',
  nextSong: 'Next song',
  playlist: 'Playlist',
  dialFx: 'DIAL FX',
  volume: 'Volume',
} as const;
