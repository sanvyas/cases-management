import type { Category, SubType, Complaint } from '../types';

export const categories: Category[] = [
  { id: 'water_supply', icon: '💧', name: { en: 'Water Supply', hi: 'जल आपूर्ति' } },
  { id: 'garbage', icon: '🗑️', name: { en: 'Garbage & Sanitation', hi: 'कचरा और सफाई' } },
  { id: 'streetlights', icon: '💡', name: { en: 'Streetlights', hi: 'स्ट्रीटलाइट' } },
  { id: 'roads', icon: '🛣️', name: { en: 'Roads', hi: 'सड़कें' } },
  { id: 'sewerage', icon: '🚰', name: { en: 'Sewerage & Drains', hi: 'सीवर और नाले' } },
  { id: 'horticulture', icon: '🌳', name: { en: 'Horticulture', hi: 'बागवानी' } },
  { id: 'encroachment', icon: '🏗️', name: { en: 'Encroachment', hi: 'अतिक्रमण' } },
  { id: 'health', icon: '🏥', name: { en: 'Health', hi: 'स्वास्थ्य' } },
  { id: 'other', icon: '📋', name: { en: 'Other', hi: 'अन्य' } },
];

export const subTypes: Record<string, SubType[]> = {
  water_supply: [
    { id: 'no_water', categoryId: 'water_supply', name: { en: 'No water supply', hi: 'पानी नहीं आ रहा' } },
    { id: 'contaminated', categoryId: 'water_supply', name: { en: 'Contaminated water', hi: 'दूषित पानी' } },
    { id: 'pipeline_leak', categoryId: 'water_supply', name: { en: 'Pipeline leak', hi: 'पाइपलाइन लीक' } },
    { id: 'tanker_request', categoryId: 'water_supply', name: { en: 'Water tanker request', hi: 'टैंकर अनुरोध' } },
  ],
  garbage: [
    { id: 'no_collection', categoryId: 'garbage', name: { en: 'No garbage collection', hi: 'कचरा नहीं उठाया गया' } },
    { id: 'dump_site', categoryId: 'garbage', name: { en: 'Illegal dump site', hi: 'अवैध कचरा डंप' } },
    { id: 'drain_cleaning', categoryId: 'garbage', name: { en: 'Drain cleaning needed', hi: 'नाली सफाई जरूरी' } },
  ],
  streetlights: [
    { id: 'not_working', categoryId: 'streetlights', name: { en: 'Light not working', hi: 'लाइट खराब' } },
    { id: 'new_light', categoryId: 'streetlights', name: { en: 'New light needed', hi: 'नई लाइट चाहिए' } },
    { id: 'pole_damaged', categoryId: 'streetlights', name: { en: 'Pole damaged', hi: 'खंभा क्षतिग्रस्त' } },
  ],
  roads: [
    { id: 'pothole', categoryId: 'roads', name: { en: 'Pothole', hi: 'गड्ढा' } },
    { id: 'road_damage', categoryId: 'roads', name: { en: 'Road damaged', hi: 'सड़क क्षतिग्रस्त' } },
    { id: 'waterlogging', categoryId: 'roads', name: { en: 'Waterlogging', hi: 'जलभराव' } },
  ],
  sewerage: [
    { id: 'overflow', categoryId: 'sewerage', name: { en: 'Sewer overflow', hi: 'सीवर ओवरफ्लो' } },
    { id: 'blockage', categoryId: 'sewerage', name: { en: 'Drain blockage', hi: 'नाली अवरोध' } },
    { id: 'bad_smell', categoryId: 'sewerage', name: { en: 'Bad smell', hi: 'बदबू' } },
  ],
  horticulture: [
    { id: 'tree_fallen', categoryId: 'horticulture', name: { en: 'Tree fallen', hi: 'पेड़ गिरा' } },
    { id: 'tree_cutting', categoryId: 'horticulture', name: { en: 'Illegal tree cutting', hi: 'अवैध पेड़ कटाई' } },
    { id: 'park_maintenance', categoryId: 'horticulture', name: { en: 'Park maintenance', hi: 'पार्क रखरखाव' } },
  ],
  encroachment: [
    { id: 'road_encroach', categoryId: 'encroachment', name: { en: 'Road encroachment', hi: 'सड़क अतिक्रमण' } },
    { id: 'public_land', categoryId: 'encroachment', name: { en: 'Public land encroachment', hi: 'सार्वजनिक भूमि अतिक्रमण' } },
  ],
  health: [
    { id: 'mosquito', categoryId: 'health', name: { en: 'Mosquito breeding', hi: 'मच्छर प्रजनन' } },
    { id: 'stagnant_water', categoryId: 'health', name: { en: 'Stagnant water', hi: 'रुका हुआ पानी' } },
    { id: 'food_safety', categoryId: 'health', name: { en: 'Food safety issue', hi: 'खाद्य सुरक्षा समस्या' } },
  ],
  other: [
    { id: 'other_complaint', categoryId: 'other', name: { en: 'Other complaint', hi: 'अन्य शिकायत' } },
  ],
};

export const mockComplaints: Complaint[] = [
  {
    id: '1',
    caseNumber: 'GMD-26-004512',
    categoryId: 'water_supply',
    subTypeId: 'no_water',
    status: 'ASSIGNED',
    location: { en: 'Ward 12, Nehru Nagar, Gwalior', hi: 'वार्ड 12, नेहरू नगर, ग्वालियर' },
    description: {
      en: 'No water supply for the past 3 days in our area. Hand pump also not working.',
      hi: 'हमारे क्षेत्र में पिछले 3 दिनों से पानी नहीं आ रहा। हैंडपंप भी खराब है।',
    },
    dateCreated: '2026-09-28',
    officer: { name: 'JE Ramesh Sharma', phone: '98XX-XXX-432' },
    timeline: [
      {
        id: 't1',
        date: '2026-09-28 10:15',
        title: { en: 'Complaint Received', hi: 'शिकायत प्राप्त' },
        description: {
          en: 'Your complaint has been registered successfully.',
          hi: 'आपकी शिकायत सफलतापूर्वक दर्ज हो गई है।',
        },
      },
      {
        id: 't2',
        date: '2026-09-28 14:30',
        title: { en: 'Assigned to Officer', hi: 'अधिकारी को सौंपा गया' },
        description: {
          en: 'Assigned to JE Ramesh Sharma, Water Supply Division.',
          hi: 'JE रमेश शर्मा, जल आपूर्ति विभाग को सौंपा गया।',
        },
      },
      {
        id: 't3',
        date: '2026-09-29 09:00',
        title: { en: 'Site Visit Scheduled', hi: 'स्थल निरीक्षण निर्धारित' },
        description: {
          en: 'Officer has scheduled a site visit for today.',
          hi: 'अधिकारी ने आज के लिए स्थल निरीक्षण निर्धारित किया है।',
        },
      },
    ],
  },
  {
    id: '2',
    caseNumber: 'GMD-26-004498',
    categoryId: 'streetlights',
    subTypeId: 'not_working',
    status: 'RESOLVED',
    location: { en: 'Ward 8, MG Road, Gwalior', hi: 'वार्ड 8, एमजी रोड, ग्वालियर' },
    description: {
      en: '3 streetlights not working near the main market for 1 week.',
      hi: 'मुख्य बाजार के पास 1 हफ्ते से 3 स्ट्रीटलाइट खराब हैं।',
    },
    dateCreated: '2026-09-20',
    officer: { name: 'JE Priya Patel', phone: '97XX-XXX-891' },
    timeline: [
      {
        id: 't1',
        date: '2026-09-20 11:00',
        title: { en: 'Complaint Received', hi: 'शिकायत प्राप्त' },
        description: { en: 'Complaint registered via phone call.', hi: 'फोन कॉल द्वारा शिकायत दर्ज।' },
      },
      {
        id: 't2',
        date: '2026-09-21 10:00',
        title: { en: 'Assigned to Officer', hi: 'अधिकारी को सौंपा गया' },
        description: { en: 'Assigned to JE Priya Patel, Electrical Division.', hi: 'JE प्रिया पटेल, विद्युत विभाग को सौंपा गया।' },
      },
      {
        id: 't3',
        date: '2026-09-23 16:00',
        title: { en: 'Work Completed', hi: 'कार्य पूर्ण' },
        description: { en: 'All 3 streetlights repaired and tested.', hi: 'सभी 3 स्ट्रीटलाइट ठीक कर दी गईं।' },
      },
      {
        id: 't4',
        date: '2026-09-25 10:00',
        title: { en: 'Resolved', hi: 'समाधान' },
        description: { en: 'Complaint resolved. Awaiting citizen feedback.', hi: 'शिकायत समाधान। नागरिक प्रतिक्रिया की प्रतीक्षा।' },
      },
    ],
  },
  {
    id: '3',
    caseNumber: 'GMD-26-004523',
    categoryId: 'garbage',
    subTypeId: 'no_collection',
    status: 'IN_PROGRESS',
    location: { en: 'Ward 15, Lashkar, Gwalior', hi: 'वार्ड 15, लश्कर, ग्वालियर' },
    description: {
      en: 'Garbage not collected for 5 days. Piling up near the community park.',
      hi: '5 दिनों से कचरा नहीं उठाया गया। सामुदायिक पार्क के पास जमा हो रहा है।',
    },
    dateCreated: '2026-09-30',
    officer: { name: 'Sanitary Inspector Vijay Kumar', phone: '99XX-XXX-123' },
    timeline: [
      {
        id: 't1',
        date: '2026-09-30 08:00',
        title: { en: 'Complaint Received', hi: 'शिकायत प्राप्त' },
        description: { en: 'Complaint registered via WhatsApp.', hi: 'व्हाट्सएप द्वारा शिकायत दर्ज।' },
      },
      {
        id: 't2',
        date: '2026-09-30 12:00',
        title: { en: 'Assigned to Officer', hi: 'अधिकारी को सौंपा गया' },
        description: { en: 'Assigned to Sanitary Inspector Vijay Kumar.', hi: 'स्वच्छता निरीक्षक विजय कुमार को सौंपा गया।' },
      },
      {
        id: 't3',
        date: '2026-10-01 09:30',
        title: { en: 'Work In Progress', hi: 'कार्य प्रगति पर' },
        description: { en: 'Cleaning crew dispatched to the area.', hi: 'सफाई दल क्षेत्र में भेजा गया।' },
      },
    ],
  },
  {
    id: '4',
    caseNumber: 'GMD-26-004450',
    categoryId: 'roads',
    subTypeId: 'pothole',
    status: 'CLOSED',
    location: { en: 'Ward 5, Morar, Gwalior', hi: 'वार्ड 5, मुरार, ग्वालियर' },
    description: {
      en: 'Large pothole on main road causing accidents.',
      hi: 'मुख्य सड़क पर बड़ा गड्ढा दुर्घटनाएं पैदा कर रहा है।',
    },
    dateCreated: '2026-09-10',
    officer: { name: 'JE Anil Verma', phone: '98XX-XXX-765' },
    timeline: [
      {
        id: 't1',
        date: '2026-09-10 09:00',
        title: { en: 'Complaint Received', hi: 'शिकायत प्राप्त' },
        description: { en: 'Complaint registered.', hi: 'शिकायत दर्ज।' },
      },
      {
        id: 't2',
        date: '2026-09-11 11:00',
        title: { en: 'Assigned to Officer', hi: 'अधिकारी को सौंपा गया' },
        description: { en: 'Assigned to JE Anil Verma, Roads Division.', hi: 'JE अनिल वर्मा, सड़क विभाग को सौंपा गया।' },
      },
      {
        id: 't3',
        date: '2026-09-14 15:00',
        title: { en: 'Work Completed', hi: 'कार्य पूर्ण' },
        description: { en: 'Pothole repaired with hot-mix.', hi: 'गड्ढा हॉट-मिक्स से भरा गया।' },
      },
      {
        id: 't4',
        date: '2026-09-16 10:00',
        title: { en: 'Closed', hi: 'बंद' },
        description: { en: 'Complaint closed after positive citizen feedback.', hi: 'नागरिक की सकारात्मक प्रतिक्रिया के बाद शिकायत बंद।' },
      },
    ],
  },
];
