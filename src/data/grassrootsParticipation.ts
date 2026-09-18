/**
 * Grassroots participation data released by the Philippine Sports Commission
 * under FOI request #PSC-206383709560 (filed 14 Aug 2025, released 10 Sep 2025).
 *
 * Source files: BP-PNG_DATA.xlsx, "BP & PNG NUMBER OF REGISTERED ATHLETES PER
 * SPORT.xlsx", PNPG_Athletes.pdf and PNPG_2024_PARTICIPANTS_BREAKDOWN.pdf,
 * obtained via foi.gov.ph. Figures are transcribed without adjustment.
 *
 * None of this is published on psc.gov.ph.
 *
 * CAVEAT: these figures were extracted from the released files by an AI
 * assistant, not by the PSC. Spreadsheet values were parsed programmatically;
 * the para games breakdown was read off a scanned PDF table on screen. Treat
 * them as indicative and verify against the source files before citing.
 */

export interface SportCount {
  sport: string;
  male: number;
  female: number;
  total: number;
}

export interface Delegation {
  lgu: string;
  male: number;
  female: number;
  total: number;
}

export interface ClusterTotal {
  male: number;
  female: number;
  total: number;
}

/** age -> [male, female] */
export type AgeCounts = Record<string, [number, number]>;

export interface GameData {
  sports: SportCount[];
  clusters: Record<string, ClusterTotal>;
  topLgus: Delegation[];
  lguCount: number;
  zeroLgus: string[];
  ages: AgeCounts;
}

/** Batang Pinoy 2023 — the children's games (ages 4-17). */
export const batangPinoy: GameData = {
  sports: [
    {
      sport: 'Swimming',
      male: 1083,
      female: 925,
      total: 2008,
    },
    {
      sport: 'Taekwondo',
      male: 942,
      female: 790,
      total: 1732,
    },
    {
      sport: 'Karatedo',
      male: 605,
      female: 489,
      total: 1094,
    },
    {
      sport: 'Athletics',
      male: 622,
      female: 406,
      total: 1028,
    },
    {
      sport: 'Arnis',
      male: 525,
      female: 438,
      total: 963,
    },
    {
      sport: 'Badminton',
      male: 538,
      female: 418,
      total: 956,
    },
    {
      sport: 'Chess',
      male: 536,
      female: 394,
      total: 930,
    },
    {
      sport: 'Table Tennis',
      male: 406,
      female: 335,
      total: 741,
    },
    {
      sport: 'Futsal',
      male: 346,
      female: 299,
      total: 645,
    },
    {
      sport: 'Gymnastics',
      male: 135,
      female: 411,
      total: 546,
    },
    {
      sport: 'Dancesport',
      male: 245,
      female: 253,
      total: 498,
    },
    {
      sport: 'Archery',
      male: 251,
      female: 227,
      total: 478,
    },
    {
      sport: 'Pencak Silat',
      male: 247,
      female: 191,
      total: 438,
    },
    {
      sport: 'Judo',
      male: 213,
      female: 133,
      total: 346,
    },
    {
      sport: 'Sepak Takraw',
      male: 256,
      female: 79,
      total: 335,
    },
    {
      sport: 'Boxing',
      male: 286,
      female: 27,
      total: 313,
    },
    {
      sport: 'Cycling',
      male: 246,
      female: 66,
      total: 312,
    },
    {
      sport: 'Wrestling',
      male: 200,
      female: 110,
      total: 310,
    },
    {
      sport: 'Wushu',
      male: 175,
      female: 133,
      total: 308,
    },
    {
      sport: 'Muaythai',
      male: 201,
      female: 80,
      total: 281,
    },
    {
      sport: 'Basketball (3x3)',
      male: 180,
      female: 0,
      total: 180,
    },
    {
      sport: 'Lawn Tennis',
      male: 90,
      female: 82,
      total: 172,
    },
    {
      sport: 'Weightlifting',
      male: 73,
      female: 66,
      total: 139,
    },
    {
      sport: 'Beach Volleyball',
      male: 120,
      female: 0,
      total: 120,
    },
    {
      sport: 'Kickboxing',
      male: 82,
      female: 36,
      total: 118,
    },
    {
      sport: 'E-Sports',
      male: 0,
      female: 0,
      total: 0,
    },
  ],
  clusters: {
    'NORTH LUZON': {
      male: 2218,
      female: 1494,
      total: 3712,
    },
    'SOUTH LUZON': {
      male: 1763,
      female: 1405,
      total: 3168,
    },
    NCR: {
      male: 1556,
      female: 1167,
      total: 2723,
    },
    VISAYAS: {
      male: 1533,
      female: 1194,
      total: 2727,
    },
    MINDANAO: {
      male: 1532,
      female: 1126,
      total: 2658,
    },
  },
  topLgus: [
    {
      lgu: 'City of Baguio',
      male: 308,
      female: 215,
      total: 523,
    },
    {
      lgu: 'City of Cebu',
      male: 215,
      female: 218,
      total: 433,
    },
    {
      lgu: 'City of Pasig',
      male: 219,
      female: 200,
      total: 419,
    },
    {
      lgu: 'Pangasinan',
      male: 219,
      female: 176,
      total: 395,
    },
    {
      lgu: 'Quezon City',
      male: 223,
      female: 168,
      total: 391,
    },
    {
      lgu: 'City of Davao',
      male: 150,
      female: 147,
      total: 297,
    },
    {
      lgu: 'City of Iloilo',
      male: 175,
      female: 121,
      total: 296,
    },
    {
      lgu: 'City of Mandaluyong',
      male: 154,
      female: 88,
      total: 242,
    },
    {
      lgu: 'City of Santa Rosa',
      male: 116,
      female: 111,
      total: 227,
    },
    {
      lgu: 'Laguna',
      male: 124,
      female: 103,
      total: 227,
    },
    {
      lgu: 'Cotabato',
      male: 121,
      female: 97,
      total: 218,
    },
    {
      lgu: 'City of Naga',
      male: 98,
      female: 110,
      total: 208,
    },
  ],
  lguCount: 189,
  zeroLgus: [
    'City of Alaminos',
    'Carmona City',
    'City of Sorsogon',
    'City of Escalante',
    'City of Lamitan',
  ],
  ages: {
    '4': [0, 1],
    '5': [1, 10],
    '6': [11, 17],
    '7': [40, 47],
    '8': [137, 160],
    '9': [259, 255],
    '10': [304, 335],
    '11': [509, 499],
    '12': [722, 662],
    '13': [840, 735],
    '14': [1149, 911],
    '15': [1486, 1043],
    '16': [1653, 976],
    '17': [1492, 737],
  },
} as GameData;

/** Philippine National Games — open age. The release carries no year. */
export const nationalGames: GameData = {
  sports: [
    {
      sport: 'Athletics',
      male: 444,
      female: 208,
      total: 652,
    },
    {
      sport: 'Arnis',
      male: 339,
      female: 225,
      total: 564,
    },
    {
      sport: 'Taekwondo',
      male: 240,
      female: 150,
      total: 390,
    },
    {
      sport: 'Karatedo',
      male: 194,
      female: 125,
      total: 319,
    },
    {
      sport: 'Badminton',
      male: 171,
      female: 118,
      total: 289,
    },
    {
      sport: 'Swimming',
      male: 184,
      female: 78,
      total: 262,
    },
    {
      sport: 'Pencak Silat',
      male: 125,
      female: 95,
      total: 220,
    },
    {
      sport: 'Boxing',
      male: 190,
      female: 15,
      total: 205,
    },
    {
      sport: 'Table Tennis',
      male: 129,
      female: 69,
      total: 198,
    },
    {
      sport: 'Archery',
      male: 132,
      female: 57,
      total: 189,
    },
    {
      sport: 'Cycling',
      male: 143,
      female: 42,
      total: 185,
    },
    {
      sport: 'Sepak Takraw',
      male: 160,
      female: 6,
      total: 166,
    },
    {
      sport: 'Basketball (3x3)',
      male: 81,
      female: 70,
      total: 151,
    },
    {
      sport: 'Dancesport',
      male: 67,
      female: 64,
      total: 131,
    },
    {
      sport: 'Chess',
      male: 79,
      female: 49,
      total: 128,
    },
    {
      sport: 'Football',
      male: 123,
      female: 0,
      total: 123,
    },
    {
      sport: 'Judo',
      male: 79,
      female: 31,
      total: 110,
    },
    {
      sport: 'Lawn Tennis',
      male: 44,
      female: 42,
      total: 86,
    },
    {
      sport: 'Muaythai',
      male: 63,
      female: 17,
      total: 80,
    },
    {
      sport: 'Wrestling',
      male: 58,
      female: 18,
      total: 76,
    },
    {
      sport: 'Weightlifting',
      male: 41,
      female: 30,
      total: 71,
    },
    {
      sport: 'Wushu',
      male: 49,
      female: 13,
      total: 62,
    },
    {
      sport: 'Kickboxing',
      male: 46,
      female: 12,
      total: 58,
    },
    {
      sport: 'Gymnastics',
      male: 21,
      female: 35,
      total: 56,
    },
    {
      sport: 'Beach Volleyball',
      male: 4,
      female: 36,
      total: 40,
    },
    {
      sport: 'E-Sports',
      male: 0,
      female: 0,
      total: 0,
    },
  ],
  clusters: {
    'NORTH LUZON': {
      male: 965,
      female: 428,
      total: 1393,
    },
    'SOUTH LUZON': {
      male: 441,
      female: 202,
      total: 643,
    },
    NCR: {
      male: 687,
      female: 411,
      total: 1098,
    },
    VISAYAS: {
      male: 487,
      female: 241,
      total: 728,
    },
    MINDANAO: {
      male: 563,
      female: 270,
      total: 833,
    },
  },
  topLgus: [
    {
      lgu: 'City of Baguio',
      male: 195,
      female: 104,
      total: 299,
    },
    {
      lgu: 'City of Mandaluyong',
      male: 129,
      female: 86,
      total: 215,
    },
    {
      lgu: 'City of Cebu',
      male: 132,
      female: 79,
      total: 211,
    },
    {
      lgu: 'City of Pasig',
      male: 115,
      female: 86,
      total: 201,
    },
    {
      lgu: 'Pangasinan',
      male: 132,
      female: 67,
      total: 199,
    },
    {
      lgu: 'City of Davao',
      male: 110,
      female: 60,
      total: 170,
    },
    {
      lgu: 'Tarlac',
      male: 97,
      female: 43,
      total: 140,
    },
    {
      lgu: 'City of Zamboanga',
      male: 84,
      female: 39,
      total: 123,
    },
    {
      lgu: 'La Union',
      male: 76,
      female: 37,
      total: 113,
    },
    {
      lgu: 'City of Makati',
      male: 73,
      female: 40,
      total: 113,
    },
    {
      lgu: 'City of Santa Rosa',
      male: 62,
      female: 40,
      total: 102,
    },
    {
      lgu: 'Benguet',
      male: 63,
      female: 38,
      total: 101,
    },
  ],
  lguCount: 166,
  zeroLgus: [
    'City of Batac',
    'City of Cabanatuan',
    'City of Ilagan',
    'City of Malolos',
    'Isabela',
    'City of Calaca',
    'City of Sorsogon',
    'City of Borongan',
    'City of Catbalogan',
    'City of Victorias',
    'Leyte',
    'Northern Samar',
    'City of Bislig',
    'City of Panabo',
    'Zamboanga del Sur',
  ],
  ages: {
    '16': [1, 10],
    '17': [45, 15],
    '18': [546, 277],
    '19': [488, 287],
    '20': [405, 266],
    '21': [435, 230],
    '22': [339, 159],
    '23': [265, 111],
    '24': [168, 76],
    '25': [100, 39],
    '26': [69, 37],
    '27': [53, 11],
    '28': [40, 13],
    '29': [37, 20],
    '30': [30, 8],
    '31': [31, 9],
    '32': [23, 6],
    '33': [20, 4],
    '34': [6, 2],
    '35': [9, 2],
    '36': [10, 3],
    '37': [5, 2],
    '38': [3, 2],
    '39': [5, 0],
    '40': [11, 0],
    '41': [5, 0],
    '42': [9, 3],
    '43': [6, 4],
    '44': [2, 2],
    '45': [3, 0],
    '46': [1, 0],
    '47': [3, 1],
    '48': [2, 0],
    '49': [4, 0],
    '50': [2, 0],
    '51': [3, 1],
    '52': [2, 0],
    '53': [3, 0],
    '54': [1, 0],
    '55': [3, 1],
    '56': [3, 1],
    '60': [0, 1],
    '61': [1, 1],
    '64': [1, 0],
    '65': [2, 0],
    '68': [2, 0],
    '69': [1, 0],
    '70': [3, 0],
  },
} as GameData;

/** Philippine National Para Games 2024. No gender breakdown was released. */
export const paraGames = {
  total: 860,
  sports: [
    ['Athletics', 357],
    ['Wheelchair Basketball', 101],
    ['Chess', 94],
    ['Table Tennis', 83],
    ['Swimming', 70],
    ['Badminton', 44],
    ['Archery', 40],
    ['Boccia', 38],
    ['Powerlifting', 33],
  ] as [string, number][],
  topDelegations: [
    ['Pasig', 119],
    ['Antipolo', 49],
    ['PDAO Baguio', 43],
    ['Quezon City PDAO', 39],
    ['Pangasinan', 36],
    ['Mandaue Movers', 32],
    ['Olongapo City', 32],
    ['Taguig City', 30],
    ['PNSB Pasay', 27],
    ['Philspada NTP', 26],
  ] as [string, number][],
};

/** Headline totals used across the site. */
export const totals = {
  allAthletes: 20662,
  batangPinoy: 14991,
  nationalGames: 4811,
  paraGames: 860,
  batangPinoyMale: 8603,
  batangPinoyFemale: 6388,
  nationalGamesMale: 3206,
  nationalGamesFemale: 1605,
};

export const source = {
  trackingNo: '#PSC-206383709560',
  filed: '14 August 2025',
  released: '10 September 2025',
  url: 'https://www.foi.gov.ph/agencies/psc/sports-data/',
};
