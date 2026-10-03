import type { Category, LocationNode, MockComplaint } from '../types';

export const categories: Category[] = [
  {
    id: 'water', hi: 'पेयजल', en: 'Drinking water', icon: 'water_drop',
    bg: '#DDEBF5', fg: '#2F6690',
    subs: [
      { id: 'handpump', hi: 'हैंडपंप खराब', en: 'Handpump not working', icon: 'plumbing', sla: '48 घंटे', slaEn: '48 h' },
      { id: 'no_water', hi: 'नल में पानी नहीं', en: 'Tap not supplying water', icon: 'water_drop', sla: '48 घंटे', slaEn: '48 h' },
      { id: 'dirty_water', hi: 'गंदा पानी', en: 'Dirty water', icon: 'opacity', sla: '24 घंटे', slaEn: '24 h' },
      { id: 'pipe_leak', hi: 'पाइप लीक', en: 'Pipeline leakage', icon: 'water_damage', sla: '48 घंटे', slaEn: '48 h' },
      { id: 'tank_dirty', hi: 'टंकी साफ़ नहीं', en: 'Water tank not cleaned', icon: 'inventory_2', sla: '7 दिन', slaEn: '7 days' },
    ],
  },
  {
    id: 'sanitation', hi: 'सफ़ाई', en: 'Sanitation', icon: 'cleaning_services',
    bg: '#E4EAD9', fg: '#4F6B2E',
    subs: [
      { id: 'no_collection', hi: 'कूड़ा नहीं उठा', en: 'Garbage not collected', icon: 'delete', sla: '48 घंटे', slaEn: '48 h' },
      { id: 'drain_choked', hi: 'नाली जाम', en: 'Open drain choked', icon: 'water_damage', sla: '48 घंटे', slaEn: '48 h' },
      { id: 'stagnant', hi: 'रुका पानी, मच्छर', en: 'Stagnant water / mosquitoes', icon: 'pest_control', sla: '72 घंटे', slaEn: '72 h' },
      { id: 'toilet_dirty', hi: 'शौचालय गंदा', en: 'Community toilet dirty', icon: 'wc', sla: '48 घंटे', slaEn: '48 h' },
      { id: 'dead_animal', hi: 'मरा जानवर', en: 'Dead animal', icon: 'pets', sla: '24 घंटे', slaEn: '24 h' },
    ],
  },
  {
    id: 'streetlight', hi: 'बत्ती', en: 'Streetlight', icon: 'lightbulb',
    bg: '#FBEBC8', fg: '#9A6200',
    subs: [
      { id: 'light_off', hi: 'बत्ती नहीं जल रही', en: 'Streetlight not working', icon: 'lightbulb', sla: '72 घंटे', slaEn: '72 h' },
      { id: 'sparking', hi: 'तार से चिंगारी', en: 'Sparking wire — emergency', icon: 'bolt', sla: '12 घंटे', slaEn: '12 h' },
    ],
  },
  {
    id: 'roads', hi: 'सड़क व नाली', en: 'Roads & drains', icon: 'add_road',
    bg: '#E8E2EF', fg: '#5B4B8A',
    subs: [
      { id: 'broken_road', hi: 'टूटी सड़क', en: 'Damaged village road', icon: 'add_road', sla: '15 दिन', slaEn: '15 days' },
      { id: 'waterlogging', hi: 'जलभराव', en: 'Water-logging', icon: 'flood', sla: '72 घंटे', slaEn: '72 h' },
      { id: 'culvert', hi: 'पुलिया मरम्मत', en: 'Culvert / drain repair', icon: 'construction', sla: '15 दिन', slaEn: '15 days' },
    ],
  },
  {
    id: 'encroachment', hi: 'अतिक्रमण', en: 'Encroachment', icon: 'fence',
    bg: '#F5DEDA', fg: '#A13D2D',
    subs: [
      { id: 'land_grab', hi: 'पंचायत भूमि पर कब्ज़ा', en: 'On panchayat / common land', icon: 'fence', sla: '15 दिन', slaEn: '15 days' },
      { id: 'path_block', hi: 'रास्ते पर कब्ज़ा', en: 'On path', icon: 'fence', sla: '15 दिन', slaEn: '15 days' },
    ],
  },
  {
    id: 'welfare', hi: 'पेंशन, प्रमाणपत्र', en: 'Welfare & certificates', icon: 'badge',
    bg: '#F5E0EA', fg: '#94386A',
    subs: [
      { id: 'pension', hi: 'पेंशन नहीं मिली', en: 'Pension not received', icon: 'elderly', sla: '15 दिन', slaEn: '15 days' },
      { id: 'birth_death', hi: 'जन्म/मृत्यु पंजीकरण', en: 'Birth / death registration', icon: 'receipt_long', sla: '7 दिन', slaEn: '7 days' },
      { id: 'job_card', hi: 'जॉब कार्ड', en: 'Job card issue', icon: 'work', sla: '15 दिन', slaEn: '15 days' },
      { id: 'housing', hi: 'आवास किस्त', en: 'Housing installment', icon: 'house', sla: '30 दिन', slaEn: '30 days' },
    ],
  },
  {
    id: 'office', hi: 'पंचायत कार्यालय', en: 'Panchayat office', icon: 'account_balance',
    bg: '#E7E2DB', fg: '#5A4E44',
    subs: [
      { id: 'gram_sabha', hi: 'ग्राम सभा नहीं हुई', en: 'Gram Sabha not held', icon: 'groups', sla: '15 दिन', slaEn: '15 days' },
      { id: 'staff_absent', hi: 'कर्मचारी नहीं मिलते', en: 'Staff not available', icon: 'person_off', sla: '7 दिन', slaEn: '7 days' },
      { id: 'misbehaviour', hi: 'दुर्व्यवहार', en: 'Misbehaviour by staff', icon: 'gavel', sla: '7 दिन', slaEn: '7 days' },
    ],
  },
];

export const locations: LocationNode[] = [
  { id: 'rampur', hi: 'गाँव रामपुर', en: 'Village Rampur', landmark: 'शिव मंदिर के पास · Near Shiv Mandir' },
  { id: 'shivpur', hi: 'गाँव शिवपुर', en: 'Village Shivpur', landmark: 'स्कूल के सामने · Opp. school' },
  { id: 'nayagaon', hi: 'गाँव नयागाँव', en: 'Village Nayagaon', landmark: 'चौपाल के पास · Near chaupal' },
  { id: 'mohanpura', hi: 'गाँव मोहनपुरा', en: 'Village Mohanpura', landmark: 'तालाब के पास · Near pond' },
];

export const STEPS = [
  { hi: 'मिली', en: 'Received', icon: 'inbox' },
  { hi: 'भेजी गई', en: 'Assigned', icon: 'person' },
  { hi: 'काम पूरा', en: 'Work done', icon: 'task_alt' },
  { hi: 'बंद', en: 'Closed', icon: 'check_circle' },
];

export const STATUS_STYLES = [
  { hi: 'शिकायत मिली', en: 'Received', icon: 'inbox', bg: '#DDE9F3', fg: '#2F6690' },
  { hi: 'कर्मचारी को भेजी', en: 'Assigned', icon: 'person', bg: '#FBEBC8', fg: '#8A5A00' },
  { hi: 'काम पूरा', en: 'Work done', icon: 'task_alt', bg: '#DCEFE2', fg: '#2F7D4F' },
  { hi: 'बंद', en: 'Closed', icon: 'check_circle', bg: '#E9E3DB', fg: '#4A3E34' },
];

export const mockComplaints: MockComplaint[] = [
  {
    id: '1',
    caseNumber: 'DZP-26-000873',
    catIndex: 0,
    subIndex: 0,
    locIndex: 0,
    date: '30 Sep',
    step: 1,
    times: ['30 Sep, 9:10', '30 Sep, 9:12', '', ''],
    workerName: 'रमेश कुमार',
    workerRole: 'पंप ऑपरेटर · Pump operator',
    dueText: 'कल शाम 5 बजे तक · by tomorrow 5 pm',
  },
  {
    id: '2',
    caseNumber: 'DZP-26-000811',
    catIndex: 1,
    subIndex: 0,
    locIndex: 0,
    date: '27 Sep',
    step: 2,
    times: ['27 Sep, 8:02', '27 Sep, 8:05', '2 Oct, 11:20', ''],
    workerName: 'सीता देवी',
    workerRole: 'सफ़ाई कर्मी · Safai Karmi',
    dueText: 'समय पर पूरा · on time',
  },
  {
    id: '3',
    caseNumber: 'DZP-26-000640',
    catIndex: 2,
    subIndex: 0,
    locIndex: 1,
    date: '12 Sep',
    step: 3,
    times: ['12 Sep', '12 Sep', '14 Sep', '14 Sep'],
    workerName: 'बलवान सिंह',
    workerRole: 'लाइनमैन · Lineman',
    dueText: 'बंद · closed',
  },
];

export const TENANT = {
  name: 'डेमो ज़िला परिषद',
  nameEn: 'Demo Zila Parishad',
  prefix: 'DZP',
};
