import axios from 'axios';

// Base API instance. Supports hosted backend URL from environment variable or Vite proxy fallback
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
// Normalize base URL (strip trailing slash if present)
const apiBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

export const api = {
  // Check backend health and status
  checkHealth: async () => {
    try {
      const res = await apiClient.get('/health');
      return res.data;
    } catch (err) {
      console.warn('Backend health check error:', err);
      return { status: 'offline', has_api_key: false };
    }
  },

  // 1. Live Train Status (Only called on user action)
  getLiveTrainStatus: async (trainNumber) => {
    const res = await apiClient.get(`/trains/${encodeURIComponent(trainNumber)}/live`);
    return res.data;
  },

  // 2. Train Schedule & Route (Only called on user action)
  getTrainSchedule: async (trainNumber) => {
    const res = await apiClient.get(`/trains/${encodeURIComponent(trainNumber)}/schedule`);
    return res.data;
  },

  // 3. Trains Between Stations (Only called on user action)
  getTrainsBetween: async (source, destination) => {
    const res = await apiClient.get('/trains/between', {
      params: { source, destination },
    });
    return res.data;
  },

  // 4. Seat Availability (Only called on user action)
  getSeatAvailability: async (trainNumber, source, destination, journeyDate, classCode = '3A', quotaCode = 'GN') => {
    const res = await apiClient.get(`/trains/${encodeURIComponent(trainNumber)}/seats`, {
      params: {
        source,
        destination,
        journeyDate,
        classCode,
        quotaCode,
      },
    });
    return res.data;
  },

  // 5. Search Station (Explicit user query or local offline search)
  searchStations: async (query, limit = 10, useRemote = false) => {
    if (!query || query.trim().length === 0) return { data: [] };
    const q = query.trim().toLowerCase();

    // First filter locally to save API calls
    const localMatches = INDIAN_RAILWAY_STATIONS.filter(
      (s) =>
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.city && s.city.toLowerCase().includes(q)) ||
        (s.state && s.state.toLowerCase().includes(q))
    );

    if (localMatches.length > 0 || !useRemote) {
      return { data: localMatches.slice(0, limit) };
    }

    // Only call remote backend if explicit search is requested and local has 0 matches
    try {
      const res = await apiClient.get('/stations/search', {
        params: { q: query.trim(), limit },
      });
      return res.data;
    } catch {
      return { data: localMatches };
    }
  },

  // 6. Station Trains (Only called on user action)
  getStationTrains: async (stationCode) => {
    const res = await apiClient.get(`/stations/${encodeURIComponent(stationCode)}/trains`);
    return res.data;
  },

  // 7. Station Live Board (Only called on user action)
  getStationLiveBoard: async (stationCode, hours = 4) => {
    const res = await apiClient.get(`/stations/${encodeURIComponent(stationCode)}/live`, {
      params: { hours },
    });
    return res.data;
  },
};

// Helper: Format minutes into HH:MM (matching CLI logic)
export function formatMinutesToTime(minutes) {
  if (minutes === null || minutes === undefined || isNaN(minutes)) return '--:--';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Popular train presets for quick reference
export const POPULAR_TRAINS = [
  { number: '22436', name: 'Vande Bharat Exp', route: 'NDLS ➔ BSB' },
  { number: '12952', name: 'Mumbai Rajdhani', route: 'NDLS ➔ MMCT' },
  { number: '12002', name: 'Bhopal Shatabdi', route: 'NDLS ➔ RKMP' },
  { number: '12302', name: 'Howrah Rajdhani', route: 'NDLS ➔ HWH' },
  { number: '12626', name: 'Kerala Express', route: 'NDLS ➔ TVC' },
];

// Offline comprehensive station directory (100% free of API calls)
export const INDIAN_RAILWAY_STATIONS = [
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi', state: 'Delhi' },
  { code: 'DLI', name: 'Old Delhi Jn', city: 'Delhi', state: 'Delhi' },
  { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'Delhi', state: 'Delhi' },
  { code: 'ANVT', name: 'Anand Vihar Terminal', city: 'Delhi', state: 'Delhi' },
  { code: 'DEC', name: 'Delhi Cantt', city: 'Delhi', state: 'Delhi' },
  { code: 'DEE', name: 'Delhi Sarai Rohilla', city: 'Delhi', state: 'Delhi' },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'BDTS', name: 'Bandra Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'LTT', name: 'Lokmanya Tilak Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'DR', name: 'Dadar', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'KYN', name: 'Kalyan Jn', city: 'Kalyan', state: 'Maharashtra' },
  { code: 'PUNE', name: 'Pune Jn', city: 'Pune', state: 'Maharashtra' },
  { code: 'NGP', name: 'Nagpur Jn', city: 'Nagpur', state: 'Maharashtra' },
  { code: 'HWH', name: 'Howrah Jn', city: 'Kolkata', state: 'West Bengal' },
  { code: 'SDAH', name: 'Sealdah', city: 'Kolkata', state: 'West Bengal' },
  { code: 'KOAA', name: 'Kolkata Chitpur', city: 'Kolkata', state: 'West Bengal' },
  { code: 'SHM', name: 'Shalimar', city: 'Howrah', state: 'West Bengal' },
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
  { code: 'MS', name: 'Chennai Egmore', city: 'Chennai', state: 'Tamil Nadu' },
  { code: 'CBE', name: 'Coimbatore Jn', city: 'Coimbatore', state: 'Tamil Nadu' },
  { code: 'MDU', name: 'Madurai Jn', city: 'Madurai', state: 'Tamil Nadu' },
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'YPR', name: 'Yesvantpur Jn', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'MYS', name: 'Mysuru Jn', city: 'Mysuru', state: 'Karnataka' },
  { code: 'BSB', name: 'Varanasi Jn', city: 'Varanasi', state: 'Uttar Pradesh' },
  { code: 'BNRS', name: 'Banaras', city: 'Varanasi', state: 'Uttar Pradesh' },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh' },
  { code: 'PRYJ', name: 'Prayagraj Jn (Allahabad)', city: 'Prayagraj', state: 'Uttar Pradesh' },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh' },
  { code: 'LJN', name: 'Lucknow Jn NER', city: 'Lucknow', state: 'Uttar Pradesh' },
  { code: 'GKP', name: 'Gorakhpur Jn', city: 'Gorakhpur', state: 'Uttar Pradesh' },
  { code: 'AGC', name: 'Agra Cantt', city: 'Agra', state: 'Uttar Pradesh' },
  { code: 'MTJ', name: 'Mathura Jn', city: 'Mathura', state: 'Uttar Pradesh' },
  { code: 'MTC', name: 'Meerut City', city: 'Meerut', state: 'Uttar Pradesh' },
  { code: 'MB', name: 'Moradabad Jn', city: 'Moradabad', state: 'Uttar Pradesh' },
  { code: 'BE', name: 'Bareilly Jn', city: 'Bareilly', state: 'Uttar Pradesh' },
  { code: 'ALJN', name: 'Aligarh Jn', city: 'Aligarh', state: 'Uttar Pradesh' },
  { code: 'ADI', name: 'Ahmedabad Jn', city: 'Ahmedabad', state: 'Gujarat' },
  { code: 'BRC', name: 'Vadodara Jn', city: 'Vadodara', state: 'Gujarat' },
  { code: 'ST', name: 'Surat', city: 'Surat', state: 'Gujarat' },
  { code: 'RJT', name: 'Rajkot Jn', city: 'Rajkot', state: 'Gujarat' },
  { code: 'PNBE', name: 'Patna Jn', city: 'Patna', state: 'Bihar' },
  { code: 'GAYA', name: 'Gaya Jn', city: 'Gaya', state: 'Bihar' },
  { code: 'PPTA', name: 'Patliputra', city: 'Patna', state: 'Bihar' },
  { code: 'MFP', name: 'Muzaffarpur Jn', city: 'Muzaffarpur', state: 'Bihar' },
  { code: 'DBG', name: 'Darbhanga Jn', city: 'Darbhanga', state: 'Bihar' },
  { code: 'KIR', name: 'Katihar Jn', city: 'Katihar', state: 'Bihar' },
  { code: 'BPL', name: 'Bhopal Jn', city: 'Bhopal', state: 'Madhya Pradesh' },
  { code: 'RKMP', name: 'Rani Kamalapati', city: 'Bhopal', state: 'Madhya Pradesh' },
  { code: 'INDB', name: 'Indore Jn', city: 'Indore', state: 'Madhya Pradesh' },
  { code: 'JBP', name: 'Jabalpur', city: 'Jabalpur', state: 'Madhya Pradesh' },
  { code: 'GWL', name: 'Gwalior Jn', city: 'Gwalior', state: 'Madhya Pradesh' },
  { code: 'UJN', name: 'Ujjain Jn', city: 'Ujjain', state: 'Madhya Pradesh' },
  { code: 'JP', name: 'Jaipur Jn', city: 'Jaipur', state: 'Rajasthan' },
  { code: 'JU', name: 'Jodhpur Jn', city: 'Jodhpur', state: 'Rajasthan' },
  { code: 'AII', name: 'Ajmer Jn', city: 'Ajmer', state: 'Rajasthan' },
  { code: 'KOTA', name: 'Kota Jn', city: 'Kota', state: 'Rajasthan' },
  { code: 'BKN', name: 'Bikaner Jn', city: 'Bikaner', state: 'Rajasthan' },
  { code: 'UDZ', name: 'Udaipur City', city: 'Udaipur', state: 'Rajasthan' },
  { code: 'HYB', name: 'Hyderabad Deccan (Nampally)', city: 'Hyderabad', state: 'Telangana' },
  { code: 'SC', name: 'Secunderabad Jn', city: 'Secunderabad', state: 'Telangana' },
  { code: 'KCG', name: 'Kacheguda', city: 'Hyderabad', state: 'Telangana' },
  { code: 'BZA', name: 'Vijayawada Jn', city: 'Vijayawada', state: 'Andhra Pradesh' },
  { code: 'VSKP', name: 'Visakhapatnam', city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { code: 'TPTY', name: 'Tirupati', city: 'Tirupati', state: 'Andhra Pradesh' },
  { code: 'GNT', name: 'Guntur Jn', city: 'Guntur', state: 'Andhra Pradesh' },
  { code: 'TVC', name: 'Thiruvananthapuram Central', city: 'Thiruvananthapuram', state: 'Kerala' },
  { code: 'ERS', name: 'Ernakulam Jn (South)', city: 'Kochi', state: 'Kerala' },
  { code: 'ERN', name: 'Ernakulam Town (North)', city: 'Kochi', state: 'Kerala' },
  { code: 'CLT', name: 'Kozhikode', city: 'Kozhikode', state: 'Kerala' },
  { code: 'TCR', name: 'Thrissur', city: 'Thrissur', state: 'Kerala' },
  { code: 'GHY', name: 'Guwahati', city: 'Guwahati', state: 'Assam' },
  { code: 'DBRG', name: 'Dibrugarh', city: 'Dibrugarh', state: 'Assam' },
  { code: 'BBS', name: 'Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha' },
  { code: 'PURI', name: 'Puri', city: 'Puri', state: 'Odisha' },
  { code: 'CTC', name: 'Cuttack', city: 'Cuttack', state: 'Odisha' },
  { code: 'ROU', name: 'Rourkela', city: 'Rourkela', state: 'Odisha' },
  { code: 'R', name: 'Raipur Jn', city: 'Raipur', state: 'Chhattisgarh' },
  { code: 'BSP', name: 'Bilaspur Jn', city: 'Bilaspur', state: 'Chhattisgarh' },
  { code: 'DURG', name: 'Durg Jn', city: 'Durg', state: 'Chhattisgarh' },
  { code: 'JAT', name: 'Jammu Tawi', city: 'Jammu', state: 'Jammu and Kashmir' },
  { code: 'SVDK', name: 'Shri Mata Vaishno Devi Katra', city: 'Katra', state: 'Jammu and Kashmir' },
  { code: 'ASR', name: 'Amritsar Jn', city: 'Amritsar', state: 'Punjab' },
  { code: 'LDH', name: 'Ludhiana Jn', city: 'Ludhiana', state: 'Punjab' },
  { code: 'CDG', name: 'Chandigarh', city: 'Chandigarh', state: 'Chandigarh' },
  { code: 'UMB', name: 'Ambala Cantt', city: 'Ambala', state: 'Haryana' },
  { code: 'HW', name: 'Haridwar Jn', city: 'Haridwar', state: 'Uttarakhand' },
  { code: 'DDN', name: 'Dehradun', city: 'Dehradun', state: 'Uttarakhand' },
  { code: 'KGM', name: 'Kathgodam', city: 'Kathgodam', state: 'Uttarakhand' },
  { code: 'RNC', name: 'Ranchi', city: 'Ranchi', state: 'Jharkhand' },
  { code: 'DHN', name: 'Dhanbad Jn', city: 'Dhanbad', state: 'Jharkhand' },
  { code: 'TATA', name: 'Tatanagar Jn', city: 'Jamshedpur', state: 'Jharkhand' },
  { code: 'MAQ', name: 'Mangaluru Central', city: 'Mangaluru', state: 'Karnataka' },
  { code: 'UBL', name: 'SSS Hubballi Jn', city: 'Hubballi', state: 'Karnataka' },
  { code: 'BSL', name: 'Bhusaval Jn', city: 'Bhusaval', state: 'Maharashtra' },
  { code: 'NK', name: 'Nashik Road', city: 'Nashik', state: 'Maharashtra' },
  { code: 'MMR', name: 'Manmad Jn', city: 'Manmad', state: 'Maharashtra' },
  { code: 'SNSI', name: 'Sainagar Shirdi', city: 'Shirdi', state: 'Maharashtra' },
];

export const POPULAR_STATIONS = INDIAN_RAILWAY_STATIONS.slice(0, 10);

export const TRAVEL_CLASSES = [
  { code: 'CC', name: 'AC Chair Car (CC)' },
  { code: 'EC', name: 'Executive Chair Car (EC)' },
  { code: '3A', name: 'AC 3 Tier (3A)' },
  { code: '2A', name: 'AC 2 Tier (2A)' },
  { code: '1A', name: 'First AC (1A)' },
  { code: '3E', name: 'AC 3 Economy (3E)' },
  { code: 'SL', name: 'Sleeper Class (SL)' },
  { code: '2S', name: 'Second Sitting (2S)' },
  { code: 'EA', name: 'Anubhuti Executive (EA)' },
];

export const QUOTAS = [
  { code: 'GN', name: 'General Quota (GN)' },
  { code: 'TQ', name: 'Tatkal Quota (TQ)' },
  { code: 'PT', name: 'Premium Tatkal (PT)' },
  { code: 'LD', name: 'Ladies Quota (LD)' },
  { code: 'SS', name: 'Senior Citizen (SS)' },
];
