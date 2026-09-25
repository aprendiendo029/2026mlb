/**
 * Quiniela Béisbol MLB 2026 - Constantes Estáticas de la Aplicación
 */

export const TEAMS = {
  // AL East
  "139": { id: '139', code: 'TB', name: 'Tampa Bay Rays', logo: 'https://www.mlbstatic.com/team-logos/139.svg', zone: 'AL' },
  "147": { id: '147', code: 'NYY', name: 'New York Yankees', logo: 'https://www.mlbstatic.com/team-logos/147.svg', zone: 'AL' },
  "110": { id: '110', code: 'BAL', name: 'Baltimore Orioles', logo: 'https://www.mlbstatic.com/team-logos/110.svg', zone: 'AL' },
  "111": { id: '111', code: 'BOS', name: 'Boston Red Sox', logo: 'https://www.mlbstatic.com/team-logos/111.svg', zone: 'AL' },
  "141": { id: '141', code: 'TOR', name: 'Toronto Blue Jays', logo: 'https://www.mlbstatic.com/team-logos/141.svg', zone: 'AL' },

  // AL Central
  "145": { id: '145', code: 'CWS', name: 'Chicago White Sox', logo: 'https://www.mlbstatic.com/team-logos/145.svg', zone: 'AL' },
  "116": { id: '116', code: 'DET', name: 'Detroit Tigers', logo: 'https://www.mlbstatic.com/team-logos/116.svg', zone: 'AL' },
  "118": { id: '118', code: 'KC', name: 'Kansas City Royals', logo: 'https://www.mlbstatic.com/team-logos/118.svg', zone: 'AL' },
  "142": { id: '142', code: 'MIN', name: 'Minnesota Twins', logo: 'https://www.mlbstatic.com/team-logos/142.svg', zone: 'AL' },
  "114": { id: '114', code: 'CLE', name: 'Cleveland Guardians', logo: 'https://www.mlbstatic.com/team-logos/114.svg', zone: 'AL' },

  // AL West
  "117": { id: '117', code: 'HOU', name: 'Houston Astros', logo: 'https://www.mlbstatic.com/team-logos/117.svg', zone: 'AL' },
  "140": { id: '140', code: 'TEX', name: 'Texas Rangers', logo: 'https://www.mlbstatic.com/team-logos/140.svg', zone: 'AL' },
  "108": { id: '108', code: 'LAA', name: 'Los Angeles Angels', logo: 'https://www.mlbstatic.com/team-logos/108.svg', zone: 'AL' },
  "133": { id: '133', code: 'ATH', name: 'Oakland Athletics', logo: 'https://www.mlbstatic.com/team-logos/133.svg', zone: 'AL' },
  "136": { id: '136', code: 'SEA', name: 'Seattle Mariners', logo: 'https://www.mlbstatic.com/team-logos/136.svg', zone: 'AL' },

  // NL East
  "144": { id: '144', code: 'ATL', name: 'Atlanta Braves', logo: 'https://www.mlbstatic.com/team-logos/144.svg', zone: 'NL' },
  "143": { id: '143', code: 'PHI', name: 'Philadelphia Phillies', logo: 'https://www.mlbstatic.com/team-logos/143.svg', zone: 'NL' },
  "121": { id: '121', code: 'NYM', name: 'New York Mets', logo: 'https://www.mlbstatic.com/team-logos/121.svg', zone: 'NL' },
  "146": { id: '146', code: 'MIA', name: 'Miami Marlins', logo: 'https://www.mlbstatic.com/team-logos/146.svg', zone: 'NL' },
  "120": { id: '120', code: 'WSH', name: 'Washington Nationals', logo: 'https://www.mlbstatic.com/team-logos/120.svg', zone: 'NL' },

  // NL Central
  "158": { id: '158', code: 'MIL', name: 'Milwaukee Brewers', logo: 'https://www.mlbstatic.com/team-logos/158.svg', zone: 'NL' },
  "112": { id: '112', code: 'CHC', name: 'Chicago Cubs', logo: 'https://www.mlbstatic.com/team-logos/112.svg', zone: 'NL' },
  "113": { id: '113', code: 'CIN', name: 'Cincinnati Reds', logo: 'https://www.mlbstatic.com/team-logos/113.svg', zone: 'NL' },
  "134": { id: '134', code: 'PIT', name: 'Pittsburgh Pirates', logo: 'https://www.mlbstatic.com/team-logos/134.svg', zone: 'NL' },
  "138": { id: '138', code: 'STL', name: 'St. Louis Cardinals', logo: 'https://www.mlbstatic.com/team-logos/138.svg', zone: 'NL' },

  // NL West
  "119": { id: '119', code: 'LAD', name: 'Los Angeles Dodgers', logo: 'https://www.mlbstatic.com/team-logos/119.svg', zone: 'NL' },
  "135": { id: '135', code: 'SD', name: 'San Diego Padres', logo: 'https://www.mlbstatic.com/team-logos/135.svg', zone: 'NL' },
  "109": { id: '109', code: 'ARI', name: 'Arizona Diamondbacks', logo: 'https://www.mlbstatic.com/team-logos/109.svg', zone: 'NL' },
  "115": { id: '115', code: 'COL', name: 'Colorado Rockies', logo: 'https://www.mlbstatic.com/team-logos/115.svg', zone: 'NL' },
  "137": { id: '137', code: 'SF', name: 'San Francisco Giants', logo: 'https://www.mlbstatic.com/team-logos/137.svg', zone: 'NL' }
};

export const PARTICIPANTS = [
  { id: 'gori', name: 'Gori', themeHex: '#38bdf8', bgClass: 'bg-sky-100/90', borderClass: ' border-sky-300' },
  { id: 'mm', name: 'MM', themeHex: '#4ade80', bgClass: 'bg-emerald-100/90', borderClass: ' border-emerald-300' },
  { id: 'tm', name: 'TM', themeHex: '#818cf8', bgClass: 'bg-indigo-100/90', borderClass: ' border-indigo-300' }
];

export const STAT_VARS = [
  { key: 'R', label: 'R', desc: 'Carreras' },
  { key: 'H', label: 'H', desc: 'Hits' },
  { key: 'E', label: 'E', desc: 'Errores' },
  { key: 'BB', label: 'BB', desc: 'Bases por Bola' },
  { key: 'HR', label: 'HR', desc: 'Home Runs' },
  { key: 'K', label: 'K', desc: 'Strikeouts (Ponches)' }
];

export const DEFAULT_SCHEDULE = [];
export const STORAGE_KEY = 'quiniela_mlb_2026_data_v1';
export const DEVICE_ID = 'dev_' + Math.random().toString(36).substr(2, 9);