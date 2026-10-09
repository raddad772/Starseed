// What's said, by whom (campaign/dialogue.js speaks them). Show, don't tell: the scene says where
// you are and what's happening; the lines are people talking. ids name the recordings
// (assets/voice/<id>.m4a). Names are provisional (STORY.md).
export const CAST = { daughter: 'Eleanor', you: '' };
export const PLACES = { galaxy: 'Vigil' };

// the opening: your own thoughts over the Sphere, before she breaks in (speaker '': narration)
export const PROLOGUE = [
  { id: 'prologue-1', speaker: CAST.you, text: `Four years since we arrived in ${PLACES.galaxy} and found the Sphere.` },
  { id: 'prologue-2', speaker: CAST.you, text: 'Four years of trying to crack it open, any way we can.' },
  { id: 'prologue-3', speaker: CAST.you, text: 'Four years of no progress… until today.' },
];

export const LINES = {
  // (Eleanor's out in her tender: she's on the radio)
  welcome: { id: 'intro-welcome', speaker: CAST.daughter, radio: true, text: 'Dad, stop daydreaming! Get in your ship and take a look at these readings.' },
  hurry: { id: 'intro-hurry', speaker: CAST.daughter, radio: true, text: 'Dad, hurry up and get in your ship!' },
};

// on the spacewalk before you're aboard: her first line, then a nudge if you're still outside after
// a while, and again less often after that
export const WELCOME_NUDGE = { first: 40, every: 75, max: 3 };
