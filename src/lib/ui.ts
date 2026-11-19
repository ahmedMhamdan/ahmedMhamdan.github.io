// Interface strings in one place, so an Arabic (RTL) version can translate them later (QR-08).
// Station content lives in src/content/stations/; this file holds only the radio's own labels.

export const ui = {
  siteName: 'Ahmed Hamdan',
  siteRole: 'Cybersecurity · Full-stack',
  skipToContent: 'Skip to content',
  radio: 'Radio',
  stations: 'Stations',
  band: 'Band',
  tunedTo: 'Tuned to',
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
  placeholder: 'PLACEHOLDER',
  contactHeading: 'Reply on this frequency',
  contactAddress: 'ADDRESS',
  contactProfile: 'PROFILE',
  contactToConfirm: 'TO CONFIRM',
} as const;
