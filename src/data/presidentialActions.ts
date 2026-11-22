export type PresidentialActionCategory =
  | 'sports'
  | 'lifestyle'
  | 'wildcard'
  | 'stunts';

export interface PresidentialActionPreset {
  id: string;
  category: PresidentialActionCategory;
  title: string;
  tag: string;
  riskLevel: 'Low Risk' | 'Mixed Reaction' | 'High Controversy';
  actionDraft: string;
  speechDraft: string;
}

export const ACTION_CATEGORIES: {
  id: PresidentialActionCategory;
  label: string;
}[] = [
  { id: 'sports', label: 'Sports & Arenas' },
  { id: 'lifestyle', label: 'Lifestyle & Pop Culture' },
  { id: 'wildcard', label: 'Scandals & High-Risk' },
  { id: 'stunts', label: 'Unorthodox Stunts' },
];

export const PRESIDENTIAL_ACTION_PRESETS: PresidentialActionPreset[] = [
  {
    id: 'mlb_baseball',
    category: 'sports',
    title: 'MLB Baseball Game & First Pitch',
    tag: 'Sports',
    riskLevel: 'Low Risk',
    actionDraft:
      'Skip evening policy prep to attend a packed Major League Baseball game, throw out the ceremonial first pitch, sit in front-row seats behind home plate, and buy hot dogs for nearby fans.',
    speechDraft:
      'Nothing brings Americans together like nine innings under the stadium lights—glad to be out here with real baseball fans tonight.',
  },
  {
    id: 'nba_courtside',
    category: 'sports',
    title: 'NBA Basketball Courtside',
    tag: 'Sports',
    riskLevel: 'Low Risk',
    actionDraft:
      'Take Marine One to sit courtside at a prime-time NBA basketball game, shake hands with players and coaches at halftime, and appear on the arena jumbotron.',
    speechDraft:
      'Incredible energy in the arena tonight—great to celebrate world-class athletes and connect directly with fans.',
  },
  {
    id: 'ufc_fight_night',
    category: 'sports',
    title: 'UFC Fight Night Ringside',
    tag: 'Sports',
    riskLevel: 'Mixed Reaction',
    actionDraft:
      'Make a dramatic walkout into the arena to sit cageside for a sold-out UFC championship fight night, greeting fighters and soaking in the roaring crowd on live pay-per-view.',
    speechDraft:
      'Great fighters, electric crowd, and zero filters—honored to be ringside for an unforgettable main event.',
  },
  {
    id: 'football_tailgate',
    category: 'sports',
    title: 'Football Tailgate & Stadium Flyover',
    tag: 'Sports',
    riskLevel: 'Low Risk',
    actionDraft:
      'Crash a packed weekend football stadium tailgate in a battleground state, flip burgers with fans and veterans, and watch kickoff from the sidelines.',
    speechDraft:
      'Before any partisan speech in Washington, you have to listen to folks out here in the parking lot.',
  },
  {
    id: 'live_podcast',
    category: 'lifestyle',
    title: 'Unscripted 3-Hour Live Podcast',
    tag: 'Media',
    riskLevel: 'Mixed Reaction',
    actionDraft:
      'Ignore Press Secretary talking points and sit down for an unedited three-hour live video podcast covering everything from foreign crises to conspiracy theories and pop culture.',
    speechDraft:
      'No teleprompters, no pre-screened reporters—let’s just talk plainly for a few hours.',
  },
  {
    id: 'diner_tour',
    category: 'lifestyle',
    title: 'Roadside Diner & BBQ Tour',
    tag: 'Populist',
    riskLevel: 'Low Risk',
    actionDraft:
      'Break away from the formal motorcade schedule for an unannounced diner and roadside barbecue crawl, dining with truckers, retirees, and small-business owners.',
    speechDraft:
      'Best economic briefing in America happens over coffee and brisket outside the Beltway.',
  },
  {
    id: 'golf_yacht',
    category: 'lifestyle',
    title: '4-Day Golf & Yacht Retreat',
    tag: 'Leisure',
    riskLevel: 'Mixed Reaction',
    actionDraft:
      'Clear the White House calendar for a four-day private golf tournament and coastal yacht weekend with business executives and old friends while aides handle Capitol Hill.',
    speechDraft:
      'Taking a short working weekend to clear my head and strategize with trusted voices outside Washington.',
  },
  {
    id: 'music_festival',
    category: 'lifestyle',
    title: 'Surprise Music Festival Drop-In',
    tag: 'Culture',
    riskLevel: 'Mixed Reaction',
    actionDraft:
      'Drop in backstage at a massive weekend music festival, step onstage between headliners to greet tens of thousands of attendees, and post candid clips online.',
    speechDraft:
      'Good music, loud crowds, and the next generation of voters—appreciate the warm welcome tonight!',
  },
  {
    id: 'escort_scandal',
    category: 'wildcard',
    title: 'Discreet After-Hours Escort Liaison',
    tag: 'Tabloid Risk',
    riskLevel: 'High Controversy',
    actionDraft:
      'Slip away from the official evening schedule to hire private escorts at an off-the-record luxury hotel suite—attempting to keep Secret Service logs, staff aides, and tabloid reporters in the dark.',
    speechDraft:
      'My private schedule outside official duties is nobody’s business, and the press ought to focus on legislation instead of gossip.',
  },
  {
    id: 'midnight_casino',
    category: 'wildcard',
    title: 'Midnight High-Roller Casino VIP Table',
    tag: 'Nightlife',
    riskLevel: 'High Controversy',
    actionDraft:
      'Fly incognito after midnight to a luxury casino VIP room to play high-stakes blackjack and drink with celebrity high-rollers until 4 a.m.',
    speechDraft:
      'A president is still a human being—working hard all week means unwinding on my own time.',
  },
  {
    id: 'hot_mic_rant',
    category: 'wildcard',
    title: 'Unfiltered Hot-Mic Rant at Rivals',
    tag: 'Outburst',
    riskLevel: 'High Controversy',
    actionDraft:
      'Deliver an unvarnished, profanity-laced tirade mocking congressional leadership and cable pundits right in front of open press microphones.',
    speechDraft:
      'People are tired of fake Washington politeness—someone finally had to say what everyone is thinking.',
  },
  {
    id: 'midnight_pardon',
    category: 'wildcard',
    title: 'Surprise Midnight Celebrity & Crony Pardon',
    tag: 'Clemency',
    riskLevel: 'High Controversy',
    actionDraft:
      'Bypass the Justice Department clemency office to issue a sweeping midnight pardon for a polarizing entertainment star and a wealthy political donor.',
    speechDraft:
      'Constitutional pardon power belongs solely to the President, and I am exercising it tonight without apology.',
  },
  {
    id: 'declassify_ufo',
    category: 'stunts',
    title: 'Declassify All UFO & UAP Files',
    tag: 'Transparency',
    riskLevel: 'Mixed Reaction',
    actionDraft:
      'Overrule intelligence agency objections and order the immediate public release of every classified Pentagon UAP/UFO sighting dossier, radar log, and hangar memo.',
    speechDraft:
      'The American people can handle the truth—starting today, the classified vault doors are open.',
  },
  {
    id: 'federal_holiday',
    category: 'stunts',
    title: 'Proclaim Spontaneous National Holiday',
    tag: 'Executive Stunt',
    riskLevel: 'Mixed Reaction',
    actionDraft:
      'Sign a surprise proclamation giving federal workers and markets a spontaneous nationwide day off to celebrate a major national sports triumph and boost morale.',
    speechDraft:
      'America works hard enough—take the day off, fire up the grill, and celebrate together.',
  },
];
