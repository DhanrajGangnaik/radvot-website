// A single, reversible scroll coordinate controls every visual system.
export const chapters = [
  { title: 'Two Teams, One Mission', kicker: '01 / TWO PERSPECTIVES', heading: 'The same world.\nTwo lines of sight.', text: 'Red investigates how systems could fail. Blue watches how defenses respond. Both protect the same infrastructure.', cue: 'Risk begins where the evidence is incomplete.' },
  { title: 'The Disconnect', kicker: '02 / FRAGMENTED INTELLIGENCE', heading: 'More tools.\nMore findings.\nMore questions.', text: 'What can an attacker actually do—and would our defenses stop them?', cue: 'Signals cross. Context does not.' },
  { title: 'The Silence', kicker: '03 / A DIFFERENT QUESTION', heading: 'What if offense and defense shared the same intelligence?', text: 'For a moment, the noise stops.', cue: 'Keep scrolling. Something is taking shape.' },
  { title: "RADVOT’s Arrival", kicker: '04 / THE THIRD FORCE', heading: 'Not another signal.\nA shared intelligence.', text: 'Separate fragments are drawn into one point of understanding.', dialogue: [['Red Team', 'Who are you?'], ['RADVOT', 'I am RADVOT.'], ['Blue Team', 'And whose side are you on?'], ['RADVOT', 'Yours. Both of you.'], ['RADVOT', "You don’t need more noise. You need proof."]] },
  { title: 'The Orchestration', kicker: '05 / AUTHORIZED BY DESIGN', heading: 'One objective.\nA coordinated response.', text: 'RADVOT connects approved agents with supported assessment procedures. Offensive questions meet defensive observations inside an explicit boundary.', cue: 'Only designated systems participate. All activity here is illustrative.' },
  { title: 'The Revelation', kicker: '06 / EVIDENCE, CONNECTED', heading: 'From isolated findings\nto shared understanding.', text: 'Severity describes impact. Evidence describes what was observed. Neither erases uncertainty.', dialogue: [['Red Team', 'This is the weakness we were investigating.'], ['Blue Team', 'And now we can see how our defenses responded.'], ['RADVOT', 'Now we know what was observed, what remains uncertain, and where to focus.']] },
  { title: 'The Human Decision', kicker: '07 / REVIEW · REMEDIATE · RETEST', heading: 'The intelligence supports.\nThe humans decide.', text: 'Select the exposure. Review a targeted change. Applying a change is a claim; a subsequent retest supplies new evidence.', cue: 'Try each verification outcome. A fix is never assumed.' },
  { title: 'The Third Force', kicker: '08 / WORK AS ONE', heading: 'Two teams.\nOne intelligence.', text: 'The threats will evolve. Your defenses must evolve with them.', dialogue: [['RADVOT', 'I was never here to replace you.'], ['RADVOT', 'I was here to help you work as one.']], cue: 'The core departs. The connection remains.' },
  { title: 'RADVOT', kicker: 'THE SIX PARTS BECOME ONE', heading: 'Know Your Weaknesses.\nProve Your Defenses.', text: 'Risk Assessment · Defense Validation · Orchestrated Testing', cue: 'Six orbital structures assemble into one geometric identity.' },
  { title: 'Your System', kicker: 'THE NEXT SYSTEM IS YOURS.', heading: 'Your environment.\nYour next move.', text: 'Step into the interactive workspace. Create an agent, approve an assessment, inspect the evidence, and simulate a retest.', cue: 'Interactive Simulation — No real systems are assessed.' },
];
export const parts = ['Risk', 'Assessment', 'Defense', 'Validation', 'Orchestrated', 'Testing'];
export const activation = [0.18, 4.18, 4.58, 5.12, 5.55, 6.35];
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const smooth = (a, b, p) => { const v = clamp((p - a) / (b - a)); return v * v * (3 - 2 * v); };
export function storyState(p) {
  let active=0;
  for(const boundary of activation) if(p>=boundary)active++;
  return {
    chapter: Math.min(9, Math.floor(p)),
    active,
    fragment: smooth(.8, 1.8, p) * (1 - smooth(3, 3.9, p)),
    darkness: smooth(1.8, 2.3, p) * (1 - smooth(3.1, 4, p)),
    portal: smooth(3.04, 3.5, p) * (1 - smooth(4.05, 4.65, p)) + smooth(7.35, 7.8, p) * (1 - smooth(8.08, 8.45, p)),
    core: smooth(3.45, 3.95, p) * (1 - smooth(7.7, 8.25, p)),
    evidence: smooth(4.85, 5.45, p) * (1 - smooth(7.05, 7.55, p)),
    approved: smooth(4.05, 4.5, p),
    word: smooth(8.1, 8.85, p),
    handoff: smooth(9.05, 9.65, p),
  };
}
// Procedural voxel letterforms. These are geometry destinations, not text overlays.
export const glyphs = [
  ['11110','10001','10001','11110','10100','10010','10001'],
  ['01110','10001','10001','11111','10001','10001','10001'],
  ['11110','10001','10001','10001','10001','10001','11110'],
  ['10001','10001','10001','10001','10001','01010','00100'],
  ['01110','10001','10001','10001','10001','10001','01110'],
  ['11111','00100','00100','00100','00100','00100','00100'],
];
