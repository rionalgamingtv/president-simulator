import { DebateRound } from '../types/game';

export interface DebateMatchupPreset {
  id: string;
  opponentName: string;
  opponentParty: string;
  venueCity: string;
  rounds: DebateRound[];
}

export const DEBATE_MATCHUPS: DebateMatchupPreset[] = [
  {
    id: 'general_debate_1',
    opponentName: 'Sen. Arthur Sterling',
    opponentParty: 'Opposition Challenger',
    venueCity: 'Philadelphia, PA',
    rounds: [
      {
        topic: 'Economic Cost of Living & Inflation',
        category: 'economy',
        moderatorPrompt:
          'Mr. President, working families are struggling with cumulative price increases and elevated borrowing costs. Your challenger claims your fiscal policies fueled this inflation. How do you respond?',
        opponentAttack:
          'The administration wrote blank checks that drove inflation to painful heights, leaving hardworking Americans to pay the price at the grocery checkout and mortgage desk.',
        stances: [
          {
            id: 'econ_populist',
            title: 'Aggressive Populist Counter-Attack',
            stanceText:
              'Call out corporate price-gouging and oligopoly margins, pledging direct relief and antitrust enforcement for working-class households.',
            tone: 'aggressive',
            blocImpacts: {
              workingClass: 5,
              youngVoters: 4,
              techFinance: -3,
            },
            momentumDelta: 3,
            approvalDelta: 1.5,
            mediaReaction:
              'Working-class audiences roared at the direct attack on corporate profiteering.',
          },
          {
            id: 'econ_technocratic',
            title: 'Technocratic Defense & Supply-Side Growth',
            stanceText:
              'Highlight deficit reduction targets, supply chain investments, and Federal Reserve coordination that are bringing inflation back to target safely.',
            tone: 'technocratic',
            blocImpacts: {
              suburbanModerates: 4,
              seniors: 4,
              workingClass: 2,
            },
            momentumDelta: 2,
            approvalDelta: 1.0,
            mediaReaction:
              'Suburban moderates praised the calm reliance on macroeconomic data and deficit discipline.',
          },
          {
            id: 'econ_visionary',
            title: 'Bold Industrial Innovation Pivot',
            stanceText:
              'Pivot to domestic manufacturing and clean-grid reshoring, arguing that short-term price spikes are the necessary bridge to generational prosperity.',
            tone: 'visionary',
            blocImpacts: {
              youngVoters: 5,
              techFinance: 3,
              suburbanModerates: 1,
            },
            momentumDelta: 4,
            approvalDelta: 1.2,
            mediaReaction:
              'Young voters and tech innovators applauded the forward-looking industrial roadmap.',
          },
        ],
      },
      {
        topic: 'National Security & Alliance Deterrence',
        category: 'defense',
        moderatorPrompt:
          'Global flashpoints are proliferating from Eastern Europe to the Indo-Pacific. Critics argue American deterrence has eroded under your watch. What is your strategy?',
        opponentAttack:
          'Our adversaries no longer fear our resolve or respect our alliances. Weakness abroad invites aggression everywhere.',
        stances: [
          {
            id: 'def_deterrence',
            title: 'Peace Through Strength & Allied Unity',
            stanceText:
              'Emphasize robust defense rearmament, unbreakable NATO/Indo-Pacific pacts, and decisive readiness upgrades across all military branches.',
            tone: 'technocratic',
            blocImpacts: {
              seniors: 5,
              suburbanModerates: 4,
              techFinance: 2,
            },
            momentumDelta: 3,
            approvalDelta: 1.4,
            mediaReaction:
              'Defense analysts lauded the firm commitment to allied coalition deterrence.',
          },
          {
            id: 'def_populist',
            title: 'America First Strategic Focus',
            stanceText:
              'Argue that burden-sharing by wealthy allies and securing our own borders is the true foundation of national security.',
            tone: 'aggressive',
            blocImpacts: {
              workingClass: 4,
              seniors: 3,
              youngVoters: -2,
            },
            momentumDelta: 2,
            approvalDelta: 1.0,
            mediaReaction:
              'Nationalists welcomed the insistence on allied burden-sharing.',
          },
          {
            id: 'def_visionary',
            title: 'Modern Cyber & Multilateral Diplomacy',
            stanceText:
              'Pledge cutting-edge cyber shield defense, AI intelligence integration, and proactive diplomatic summits to neutralize conflicts before they escalate.',
            tone: 'visionary',
            blocImpacts: {
              youngVoters: 5,
              techFinance: 4,
              suburbanModerates: 2,
            },
            momentumDelta: 4,
            approvalDelta: 1.5,
            mediaReaction:
              'Tech and youth focus groups gave high marks for modernizing defense around cyber and intelligence.',
          },
        ],
      },
      {
        topic: 'Closing Vision & The American Future',
        category: 'domestic',
        moderatorPrompt:
          'Final question. Why should voters entrust you with the Oval Office for another term over your opponent?',
        opponentAttack:
          'The country is heading in the wrong direction and needs a complete change in leadership, ethics, and economic direction.',
        stances: [
          {
            id: 'close_results',
            title: 'Proven Results & Steady Leadership',
            stanceText:
              'Recount concrete legislative achievements, jobs created, and stability restored during turbulent times, asking voters to keep moving forward.',
            tone: 'technocratic',
            blocImpacts: {
              suburbanModerates: 5,
              seniors: 5,
              workingClass: 3,
            },
            momentumDelta: 4,
            approvalDelta: 1.8,
            mediaReaction:
              'Polling dials jumped among undecided voters responding to the steady stewardship message.',
          },
          {
            id: 'close_reform',
            title: 'Anti-Establishment Reform Mission',
            stanceText:
              'Position yourself as the people’s champion fighting entrenched interests, career politicians, and special lobbies in Washington.',
            tone: 'aggressive',
            blocImpacts: {
              workingClass: 6,
              youngVoters: 4,
              techFinance: -2,
            },
            momentumDelta: 4,
            approvalDelta: 1.6,
            mediaReaction:
              'Populist base enthusiasm surged following the sharp anti-establishment closing pitch.',
          },
          {
            id: 'close_unity',
            title: 'Bipartisan Unity & Generational Hope',
            stanceText:
              'Pledge to bridge partisan divides, heal national friction, and unite Americans behind a generational moonshot of growth and freedom.',
            tone: 'visionary',
            blocImpacts: {
              suburbanModerates: 5,
              youngVoters: 5,
              techFinance: 3,
            },
            momentumDelta: 5,
            approvalDelta: 2.0,
            mediaReaction:
              'Post-debate focus groups declared the closing call for unity the defining moment of the night.',
          },
        ],
      },
    ],
  },
];
