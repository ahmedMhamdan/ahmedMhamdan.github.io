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
  // Panel between stations.
  idleKicker: 'BETWEEN STATIONS',
  idleHeading: 'Turn the dial',
  idleText: 'Or press 1 to 5 to jump to a band.',
  placeholder: 'PLACEHOLDER',
  contactHeading: 'Reply on this frequency',
  contactAddress: 'ADDRESS',
  contactProfile: 'PROFILE',
  contactToConfirm: 'TO CONFIRM',
} as const;
