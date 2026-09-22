import { MicrobizChannel, CreditOfficerRegistration, BranchInfo } from '../types';

export interface ChannelInfo {
  id: MicrobizChannel;
  name: string;
  shortName: string;
  code: 'MIC' | 'MFB' | 'PEC';
  tagline: string;
  description: string;
  focusArea: string;
  regulatoryStatus: string;
  tracingPrefix: string;
  officerPrefix: string;
  badgeClass: string;
  bgDarkClass: string;
  borderClass: string;
  iconType: 'inclusion' | 'bank' | 'empowerment';
}

export const BRANCHES_BY_ORGANISATION: Record<MicrobizChannel, string[]> = {
  MICROBIZ_INCLUSION_CENTRE: [
    'Head Office (Central Area)'
  ],
  MICROBIZ_MFB: [
    'HQ Mpape',
    'Bwari'
  ],
  PEAK_EMPOWERMENT_CENTRE: [
    'Suleja',
    'Lafia 1',
    'Lafia 2',
    'Kuje',
    'Keffi',
    'Makurdi',
    'Nasarawa-Toto',
    'Lifecamp',
    'Mararaba'
  ]
};

export const ALL_BRANCHES: BranchInfo[] = [
  // 1. Microbiz Inclusion Centre
  {
    id: 'MIC-HO',
    name: 'Head Office (Central Area)',
    shortName: 'Central Area HO',
    channel: 'MICROBIZ_INCLUSION_CENTRE',
    channelName: 'Microbiz Inclusion Centre',
    state: 'Abuja FCT',
    city: 'Central Business District',
    address: 'Plot 402 Constitution Avenue, Central Area, Abuja FCT',
    isHeadOffice: true
  },

  // 2. Microbiz MFB
  {
    id: 'MFB-HQ',
    name: 'HQ Mpape',
    shortName: 'HQ Mpape',
    channel: 'MICROBIZ_MFB',
    channelName: 'Microbiz MFB',
    state: 'Abuja FCT',
    city: 'Mpape',
    address: '14 Berger Quarry Road, New Mpape Commercial Plaza, Abuja FCT',
    isHeadOffice: true
  },
  {
    id: 'MFB-BWR',
    name: 'Bwari',
    shortName: 'Bwari',
    channel: 'MICROBIZ_MFB',
    channelName: 'Microbiz MFB',
    state: 'Abuja FCT',
    city: 'Bwari',
    address: 'Law School Road, Opposite Central Market, Bwari, Abuja FCT'
  },

  // 3. Peak Empowerment Centre
  {
    id: 'PEC-SUL',
    name: 'Suleja',
    shortName: 'Suleja',
    channel: 'PEAK_EMPOWERMENT_CENTRE',
    channelName: 'Peak Empowerment Centre',
    state: 'Niger State',
    city: 'Suleja',
    address: 'Commercial Layout, Minna Road, Suleja, Niger State'
  },
  {
    id: 'PEC-LF1',
    name: 'Lafia 1',
    shortName: 'Lafia 1',
    channel: 'PEAK_EMPOWERMENT_CENTRE',
    channelName: 'Peak Empowerment Centre',
    state: 'Nasarawa State',
    city: 'Lafia',
    address: 'Jos Road Commercial Corridor, Lafia 1, Nasarawa State'
  },
  {
    id: 'PEC-LF2',
    name: 'Lafia 2',
    shortName: 'Lafia 2',
    channel: 'PEAK_EMPOWERMENT_CENTRE',
    channelName: 'Peak Empowerment Centre',
    state: 'Nasarawa State',
    city: 'Lafia',
    address: 'Makurdi Highway Commercial Hub, Lafia 2, Nasarawa State'
  },
  {
    id: 'PEC-KUJ',
    name: 'Kuje',
    shortName: 'Kuje',
    channel: 'PEAK_EMPOWERMENT_CENTRE',
    channelName: 'Peak Empowerment Centre',
    state: 'Abuja FCT',
    city: 'Kuje',
    address: 'Kuje Central Market Road, Kuje Area Council, Abuja FCT'
  },
  {
    id: 'PEC-KEF',
    name: 'Keffi',
    shortName: 'Keffi',
    channel: 'PEAK_EMPOWERMENT_CENTRE',
    channelName: 'Peak Empowerment Centre',
    state: 'Nasarawa State',
    city: 'Keffi',
    address: 'Emir Palace Roundabout Commercial Complex, Keffi, Nasarawa State'
  },
  {
    id: 'PEC-MKD',
    name: 'Makurdi',
    shortName: 'Makurdi',
    channel: 'PEAK_EMPOWERMENT_CENTRE',
    channelName: 'Peak Empowerment Centre',
    state: 'Benue State',
    city: 'Makurdi',
    address: 'Bank Road / High Level Commercial District, Makurdi, Benue State'
  },
  {
    id: 'PEC-NST',
    name: 'Nasarawa-Toto',
    shortName: 'Nasarawa-Toto',
    channel: 'PEAK_EMPOWERMENT_CENTRE',
    channelName: 'Peak Empowerment Centre',
    state: 'Nasarawa State',
    city: 'Nasarawa-Toto',
    address: 'Main Market Axis, Toto Local Government, Nasarawa State'
  },
  {
    id: 'PEC-LFC',
    name: 'Lifecamp',
    shortName: 'Lifecamp',
    channel: 'PEAK_EMPOWERMENT_CENTRE',
    channelName: 'Peak Empowerment Centre',
    state: 'Abuja FCT',
    city: 'Lifecamp',
    address: 'Julius Berger Junction, Lifecamp Commercial Hub, Abuja FCT'
  },
  {
    id: 'PEC-MRB',
    name: 'Mararaba',
    shortName: 'Mararaba',
    channel: 'PEAK_EMPOWERMENT_CENTRE',
    channelName: 'Peak Empowerment Centre',
    state: 'Nasarawa State',
    city: 'Mararaba',
    address: 'Abuja-Keffi Expressway, Mararaba Commercial Strip, Nasarawa State'
  }
];

export function getBranchesByChannel(channel: MicrobizChannel): string[] {
  return BRANCHES_BY_ORGANISATION[channel] || [];
}

export function getBranchByName(name: string): BranchInfo | undefined {
  return ALL_BRANCHES.find(b => b.name.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(b.name.toLowerCase()));
}

export const MICROBIZ_CHANNELS: Record<MicrobizChannel, ChannelInfo> = {
  MICROBIZ_INCLUSION_CENTRE: {
    id: 'MICROBIZ_INCLUSION_CENTRE',
    name: 'Microbiz Inclusion Centre',
    shortName: 'Inclusion Centre',
    code: 'MIC',
    tagline: 'Grassroots Inclusion, Nano-Credit & Market Co-ops',
    description: 'Financial inclusion and market outreach division serving unbanked micro-merchants, market stall clusters, informal artisans, and cooperative credit groups.',
    focusArea: 'Grassroots nano-credit, daily market thrift, financial literacy & cluster group lending',
    regulatoryStatus: 'Grassroots Financial Inclusion Outreach Division (Microbiz Group)',
    tracingPrefix: 'MIC-TRC',
    officerPrefix: 'REG/MIC/CO-',
    badgeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/70',
    bgDarkClass: 'bg-[#061A19]',
    borderClass: 'border-emerald-600/70',
    iconType: 'inclusion'
  },
  MICROBIZ_MFB: {
    id: 'MICROBIZ_MFB',
    name: 'Microbiz MFB',
    shortName: 'Microbiz MFB',
    code: 'MFB',
    tagline: 'Licensed Microfinance Bank & Core SME Commercial Banking',
    description: 'Flagship regulated Microfinance Banking institution providing formal SME commercial working capital, counter desk banking, NIBSS CBS direct settlement, and asset financing.',
    focusArea: 'Licensed core banking, structured SME credit, counter-desk deposits & mortgage finance',
    regulatoryStatus: 'CBN Licensed Microfinance Bank • NDIC Insured (RC-719401)',
    tracingPrefix: 'MFB-TRC',
    officerPrefix: 'REG/MFB/CO-',
    badgeClass: 'bg-blue-900/90 text-blue-200 border-blue-400',
    bgDarkClass: 'bg-[#091C36]',
    borderClass: 'border-blue-500',
    iconType: 'bank'
  },
  PEAK_EMPOWERMENT_CENTRE: {
    id: 'PEAK_EMPOWERMENT_CENTRE',
    name: 'Peak Empowerment Centre',
    shortName: 'Peak Empowerment',
    code: 'PEC',
    tagline: 'Enterprise Development, Youth & Women Empowerment',
    description: 'Developmental incubation and catalytic finance arm providing vocational empowerment capital, youth tech/trade loans, women enterprise grants, and capacity-building credit.',
    focusArea: 'Youth entrepreneurship, women-led MSMEs, vocational tooling & incubation credit',
    regulatoryStatus: 'Enterprise Incubation & Empowerment Division (Microbiz Group)',
    tracingPrefix: 'PEC-TRC',
    officerPrefix: 'REG/PEC/CO-',
    badgeClass: 'bg-amber-950/90 text-amber-300 border-amber-500/70',
    bgDarkClass: 'bg-[#1C1408]',
    borderClass: 'border-amber-600/70',
    iconType: 'empowerment'
  }
};

export const REGISTERED_CREDIT_OFFICERS: CreditOfficerRegistration[] = [
  {
    officerId: 'OFF-3392',
    officerName: 'Folasade Adebayo',
    registrationNumber: 'REG/MFB/CO-3392',
    channel: 'MICROBIZ_MFB',
    channelName: 'Microbiz MFB',
    branch: 'HQ Mpape',
    role: 'Head of Credit & Senior Underwriting Desk Officer',
    licensedSince: '2021-03-15',
    status: 'ACTIVE_REGISTERED'
  },
  {
    officerId: 'OFF-1088',
    officerName: 'Chijioke Nwachukwu',
    registrationNumber: 'REG/MIC/CO-1088',
    channel: 'MICROBIZ_INCLUSION_CENTRE',
    channelName: 'Microbiz Inclusion Centre',
    branch: 'Head Office (Central Area)',
    role: 'Cluster Inclusion Lead & Cooperative Credit Registrar',
    licensedSince: '2022-07-22',
    status: 'ACTIVE_REGISTERED'
  },
  {
    officerId: 'OFF-5514',
    officerName: 'Halima Abubakar',
    registrationNumber: 'REG/PEC/CO-5514',
    channel: 'PEAK_EMPOWERMENT_CENTRE',
    channelName: 'Peak Empowerment Centre',
    branch: 'Suleja',
    role: 'Enterprise Development & Youth Empowerment Specialist',
    licensedSince: '2023-01-10',
    status: 'ACTIVE_REGISTERED'
  },
  {
    officerId: 'OFF-2041',
    officerName: 'Babajide Ogundimu',
    registrationNumber: 'REG/MFB/CO-2041',
    channel: 'MICROBIZ_MFB',
    channelName: 'Microbiz MFB',
    branch: 'Bwari',
    role: 'Commercial SME Portfolio Appraiser',
    licensedSince: '2022-11-04',
    status: 'ACTIVE_REGISTERED'
  },
  {
    officerId: 'OFF-4419',
    officerName: 'Blessing Okon',
    registrationNumber: 'REG/MIC/CO-4419',
    channel: 'MICROBIZ_INCLUSION_CENTRE',
    channelName: 'Microbiz Inclusion Centre',
    branch: 'Head Office (Central Area)',
    role: 'Market Cluster Field Originator (Central Area & Outreaches)',
    licensedSince: '2023-05-18',
    status: 'ACTIVE_REGISTERED'
  },
  {
    officerId: 'OFF-6202',
    officerName: 'Tariq Al-Mansoor',
    registrationNumber: 'REG/PEC/CO-6202',
    channel: 'PEAK_EMPOWERMENT_CENTRE',
    channelName: 'Peak Empowerment Centre',
    branch: 'Lafia 1',
    role: 'Vocational Tooling & Women Seed Grant Coordinator',
    licensedSince: '2023-09-01',
    status: 'ACTIVE_REGISTERED'
  }
];

export function getChannelInfo(channel?: MicrobizChannel): ChannelInfo {
  if (!channel || !MICROBIZ_CHANNELS[channel]) {
    return MICROBIZ_CHANNELS.MICROBIZ_MFB;
  }
  return MICROBIZ_CHANNELS[channel];
}

export function generateChannelTracingRef(channel: MicrobizChannel, loanId: string): string {
  const prefix = MICROBIZ_CHANNELS[channel]?.tracingPrefix || 'MB-TRC';
  const cleanId = loanId.replace(/[^0-9]/g, '').slice(-4) || Math.floor(1000 + Math.random() * 9000).toString();
  return `${prefix}-${cleanId}`;
}

export function getOfficerByRegistration(regNo: string): CreditOfficerRegistration | undefined {
  return REGISTERED_CREDIT_OFFICERS.find(o => o.registrationNumber === regNo);
}

export function getOfficersByChannel(channel: MicrobizChannel): CreditOfficerRegistration[] {
  return REGISTERED_CREDIT_OFFICERS.filter(o => o.channel === channel);
}
