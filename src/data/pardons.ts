export interface ClemencyPetition {
  id: string;
  applicantName: string;
  category: 'White-Collar & Financial' | 'National Security & Whistleblower' | 'Federal Drug Sentencing' | 'Political & Public Corruption';
  summary: string;
  backgroundNote: string;
  options: {
    id: string;
    actionLabel: string;
    description: string;
    approvalDelta: number;
    congressDelta: number;
    justiceLoyaltyDelta: number;
    blocImpacts: {
      workingClass?: number;
      suburbanModerates?: number;
      techFinance?: number;
      seniors?: number;
      youngVoters?: number;
    };
    mediaHeadline: string;
    newsTone: 'positive' | 'neutral' | 'critical';
  }[];
}

export const CLEMENCY_PETITIONS: ClemencyPetition[] = [
  {
    id: 'pardon_whistleblower',
    applicantName: 'Julian Thorne (Classified Data Leak Case)',
    category: 'National Security & Whistleblower',
    summary:
      'A former defense contractor intelligence analyst serving an 18-year sentence for releasing unredacted surveillance memos to oversight journalists.',
    backgroundNote:
      'Civil liberties groups hail Thorne as a transparency hero; intelligence agencies and military leadership warn it compromises ongoing HUMINT sources.',
    options: [
      {
        id: 'grant_commutation',
        actionLabel: 'Grant Full Sentence Commutation',
        description:
          'Release Thorne immediately on time served, citing public oversight service while acknowledging unauthorized disclosure.',
        approvalDelta: 3.5,
        congressDelta: -4.0,
        justiceLoyaltyDelta: -12,
        blocImpacts: {
          youngVoters: 7,
          workingClass: 2,
          seniors: -4,
        },
        mediaHeadline: 'President Commutes Intelligence Analyst Sentence, Eliciting Bipartisan Debate',
        newsTone: 'neutral',
      },
      {
        id: 'deny_clemency',
        actionLabel: 'Deny Petition (Uphold Judicial Sentence)',
        description:
          'Decline clemency to maintain strict chain-of-custody protocols for classified military and intelligence information.',
        approvalDelta: -1.0,
        congressDelta: 3.0,
        justiceLoyaltyDelta: 8,
        blocImpacts: {
          seniors: 3,
          techFinance: 2,
          youngVoters: -4,
        },
        mediaHeadline: 'White House Rejects Clemency Petition for Intelligence Leaker',
        newsTone: 'neutral',
      },
    ],
  },
  {
    id: 'pardon_drug_reform',
    applicantName: 'Federal Non-Violent Drug Offender Coalition (1,240 Cases)',
    category: 'Federal Drug Sentencing',
    summary:
      'A blanket review petition for non-violent federal marijuana and low-level narcotics offenders serving mandatory minimum sentences enacted during the 1990s.',
    backgroundNote:
      'Criminal justice reform advocates urge sweeping executive clemency; prosecutors and certain state attorneys general caution against premature sentence reduction.',
    options: [
      {
        id: 'grant_blanket',
        actionLabel: 'Grant Executive Clemency & Sentence Reductions',
        description:
          'Sign a sweeping executive order commuting federal sentences for non-violent drug offenses and directing DOJ toward rehabilitation programs.',
        approvalDelta: 4.5,
        congressDelta: -2.5,
        justiceLoyaltyDelta: -6,
        blocImpacts: {
          youngVoters: 8,
          workingClass: 4,
          suburbanModerates: 2,
        },
        mediaHeadline: 'President Issues Historic Clemency Wave for Non-Violent Drug Offenses',
        newsTone: 'positive',
      },
      {
        id: 'refer_parole',
        actionLabel: 'Refer to U.S. Parole Commission Case-by-Case',
        description:
          'Decline blanket executive intervention, directing families to file individual petitions through traditional administrative channels.',
        approvalDelta: -1.5,
        congressDelta: 1.0,
        justiceLoyaltyDelta: 4,
        blocImpacts: {
          seniors: 1,
          suburbanModerates: 1,
          youngVoters: -2,
        },
        mediaHeadline: 'White House Mandates Case-by-Case Review for Federal Clemency Bids',
        newsTone: 'neutral',
      },
    ],
  },
  {
    id: 'pardon_corporate',
    applicantName: 'Arthur Vance (Silicon Valley Fintech Executive)',
    category: 'White-Collar & Financial',
    summary:
      'A prominent tech financier convicted of wire fraud and securities misrepresentation during a 2021 market liquidity panic, seeking a pardon.',
    backgroundNote:
      'Tech & finance donors argue the conviction was an overzealous prosecution; labor groups and consumer advocates warn a pardon rewards elite white-collar crime.',
    options: [
      {
        id: 'grant_pardon',
        actionLabel: 'Grant Presidential Pardon',
        description:
          'Issue an official pardon citing rehabilitation and prosecutorial overreach in complex financial markets.',
        approvalDelta: -5.0,
        congressDelta: -3.0,
        justiceLoyaltyDelta: -15,
        blocImpacts: {
          techFinance: 8,
          workingClass: -7,
          youngVoters: -5,
        },
        mediaHeadline: 'Outcry Follows Presidential Pardon of Tech Financier Convicted in Market Fraud',
        newsTone: 'critical',
      },
      {
        id: 'deny_pardon',
        actionLabel: 'Deny Pardon Outright',
        description:
          'Refuse the pardon to demonstrate equal justice under law for white-collar financial crimes.',
        approvalDelta: 3.0,
        congressDelta: 2.0,
        justiceLoyaltyDelta: 10,
        blocImpacts: {
          workingClass: 4,
          youngVoters: 3,
          techFinance: -6,
        },
        mediaHeadline: 'White House Denies Executive Pardon to Imprisoned Tech Executive',
        newsTone: 'positive',
      },
    ],
  },
];
