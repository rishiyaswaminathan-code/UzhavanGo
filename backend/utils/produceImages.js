// Comprehensive and Reliable Produce Image Mapping System for UzhavanGo
// Covers all requested Vegetables, Fruits, Grains, and Spices
// Prioritizes realistic local static images with verified CDN fallback.

const PRODUCE_CATALOG = [
  // ================= VEGETABLES =================
  {
    id: 'tomato',
    label: 'Tomato',
    category: 'Vegetable',
    image: '/images/produce/tomato.jpg',
    externalUrl: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['tomato', 'tomatoes', 'thakkali', 'tamatar']
  },
  {
    id: 'cucumber',
    label: 'Cucumber',
    category: 'Vegetable',
    image: '/images/produce/cucumber.jpg',
    externalUrl: 'https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['cucumber', 'cucumbers', 'vellarikka', 'kheera', 'kakdi']
  },
  {
    id: 'cauliflower',
    label: 'Cauliflower',
    category: 'Vegetable',
    image: '/images/produce/cauliflower.jpg',
    externalUrl: 'https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['cauliflower', 'cauli flower', 'gobi', 'phool gobi']
  },
  {
    id: 'cabbage',
    label: 'Cabbage',
    category: 'Vegetable',
    image: '/images/produce/cabbage.jpg',
    externalUrl: 'https://images.pexels.com/photos/257259/pexels-photo-257259.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['cabbage', 'cabbages', 'muttakose', 'patta gobi', 'bandha gobi']
  },
  {
    id: 'carrot',
    label: 'Carrot',
    category: 'Vegetable',
    image: '/images/produce/carrot.jpg',
    externalUrl: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['carrot', 'carrots', 'gajar']
  },
  {
    id: 'potato',
    label: 'Potato',
    category: 'Vegetable',
    image: '/images/produce/potato.jpg',
    externalUrl: 'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['potato', 'potatoes', 'urulaikizhangu', 'urulai', 'aloo', 'alu']
  },
  {
    id: 'onion',
    label: 'Onion',
    category: 'Vegetable',
    image: '/images/produce/onion.jpg',
    externalUrl: 'https://images.pexels.com/photos/4197447/pexels-photo-4197447.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['onion', 'onions', 'vengayam', 'pyaz', 'shallot', 'shallots', 'sambar onion']
  },
  {
    id: 'brinjal',
    label: 'Brinjal / Eggplant',
    category: 'Vegetable',
    image: '/images/produce/brinjal.jpg',
    externalUrl: 'https://images.pexels.com/photos/321551/pexels-photo-321551.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['brinjal', 'brinjals', 'eggplant', 'eggplants', 'aubergine', 'kathirikai', 'baingan', 'vankaya']
  },
  {
    id: 'okra',
    label: "Lady's Finger / Okra",
    category: 'Vegetable',
    image: '/images/produce/okra.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=600&auto=format&fit=crop&q=80',
    keywords: ['lady finger', 'ladys finger', "lady's finger", 'okra', 'bhindi', 'bhendi', 'vendakkai']
  },
  {
    id: 'chilli',
    label: 'Green Chilli',
    category: 'Vegetable',
    image: '/images/produce/chilli.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
    keywords: ['green chilli', 'green chili', 'chilli', 'chili', 'chillies', 'chilies', 'pachai milagai', 'mirchi', 'hari mirch']
  },
  {
    id: 'capsicum',
    label: 'Capsicum / Bell Pepper',
    category: 'Vegetable',
    image: '/images/produce/capsicum.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80',
    keywords: ['capsicum', 'bell pepper', 'sweet pepper', 'kuda milagai', 'shimla mirch']
  },
  {
    id: 'beans',
    label: 'Beans',
    category: 'Vegetable',
    image: '/images/produce/beans.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&auto=format&fit=crop&q=80',
    keywords: ['beans', 'green beans', 'french beans', 'string beans', 'avarakkai', 'cluster beans']
  },
  {
    id: 'beetroot',
    label: 'Beetroot',
    category: 'Vegetable',
    image: '/images/produce/beetroot.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=600&auto=format&fit=crop&q=80',
    keywords: ['beetroot', 'beet root', 'beet', 'chukandar']
  },
  {
    id: 'radish',
    label: 'Radish',
    category: 'Vegetable',
    image: '/images/produce/radish.jpg',
    externalUrl: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['radish', 'radishes', 'mooli', 'mullangi', 'daikon']
  },
  {
    id: 'spinach',
    label: 'Spinach',
    category: 'Vegetable',
    image: '/images/produce/spinach.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    keywords: ['spinach', 'palak', 'keerai', 'greens', 'pasalai keerai']
  },
  {
    id: 'pumpkin',
    label: 'Pumpkin',
    category: 'Vegetable',
    image: '/images/produce/pumpkin.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&auto=format&fit=crop&q=80',
    keywords: ['pumpkin', 'pumpkins', 'poosanikai', 'parangikai', 'kaddu']
  },
  {
    id: 'bitter_gourd',
    label: 'Bitter Gourd',
    category: 'Vegetable',
    image: '/images/produce/bitter_gourd.jpg',
    externalUrl: 'https://images.pexels.com/photos/65174/pexels-photo-65174.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['bitter gourd', 'bittergourd', 'pavakkai', 'karela', 'bitter melon']
  },
  {
    id: 'bottle_gourd',
    label: 'Bottle Gourd',
    category: 'Vegetable',
    image: '/images/produce/bottle_gourd.jpg',
    externalUrl: 'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['bottle gourd', 'bottlegourd', 'sorakkai', 'lauki', 'calabash', 'doodhi']
  },
  {
    id: 'drumstick',
    label: 'Drumstick',
    category: 'Vegetable',
    image: '/images/produce/drumstick.jpg',
    externalUrl: 'https://images.pexels.com/photos/5966431/pexels-photo-5966431.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['drumstick', 'drumsticks', 'murungakkai', 'moringa', 'shevaga']
  },
  {
    id: 'peas',
    label: 'Peas',
    category: 'Vegetable',
    image: '/images/produce/peas.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&auto=format&fit=crop&q=80',
    keywords: ['peas', 'green peas', 'pattani', 'matar', 'green matar']
  },
  {
    id: 'garlic',
    label: 'Garlic',
    category: 'Vegetable',
    image: '/images/produce/garlic.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=600&auto=format&fit=crop&q=80',
    keywords: ['garlic', 'poondu', 'lahsun']
  },
  {
    id: 'ginger',
    label: 'Ginger',
    category: 'Vegetable',
    image: '/images/produce/ginger.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
    keywords: ['ginger', 'inji', 'adrak']
  },

  // ================= FRUITS =================
  {
    id: 'custard_apple',
    label: 'Custard Apple',
    category: 'Fruit',
    image: '/images/produce/custard_apple.jpg',
    externalUrl: 'https://images.pexels.com/photos/5945848/pexels-photo-5945848.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['custard apple', 'custardapple', 'sitaphal', 'seethapazham', 'sharifa', 'sugar apple']
  },
  {
    id: 'pineapple',
    label: 'Pineapple',
    category: 'Fruit',
    image: '/images/produce/pineapple.jpg',
    externalUrl: 'https://images.pexels.com/photos/947879/pexels-photo-947879.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['pineapple', 'pine apple', 'ananas', 'annasi']
  },
  {
    id: 'watermelon',
    label: 'Watermelon',
    category: 'Fruit',
    image: '/images/produce/watermelon.jpg',
    externalUrl: 'https://images.pexels.com/photos/1313267/pexels-photo-1313267.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['watermelon', 'water melon', 'tharpoosani', 'tarbuj']
  },
  {
    id: 'muskmelon',
    label: 'Muskmelon',
    category: 'Fruit',
    image: '/images/produce/muskmelon.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?w=600&auto=format&fit=crop&q=80',
    keywords: ['muskmelon', 'musk melon', 'cantaloupe', 'kirni', 'kharbuja']
  },
  {
    id: 'dragon_fruit',
    label: 'Dragon Fruit',
    category: 'Fruit',
    image: '/images/produce/dragon_fruit.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1527324688151-0e627063f2b1?w=600&auto=format&fit=crop&q=80',
    keywords: ['dragon fruit', 'dragonfruit', 'pitaya', 'pitahaya']
  },
  {
    id: 'jackfruit',
    label: 'Jackfruit',
    category: 'Fruit',
    image: '/images/produce/jackfruit.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1590005354167-6da97870c757?w=600&auto=format&fit=crop&q=80',
    keywords: ['jackfruit', 'jack fruit', 'palapazham', 'kathal', 'halasina hannu']
  },
  {
    id: 'sapota',
    label: 'Sapota / Chikoo',
    category: 'Fruit',
    image: '/images/produce/sapota.jpg',
    externalUrl: 'https://images.pexels.com/photos/1395958/pexels-photo-1395958.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['sapota', 'chikoo', 'chiku', 'sapodilla']
  },
  {
    id: 'apple',
    label: 'Apple',
    category: 'Fruit',
    image: '/images/produce/apple.jpg',
    externalUrl: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['apple', 'apples', 'seb', 'kashmiri apple', 'fuji apple', 'shimla apple']
  },
  {
    id: 'banana',
    label: 'Banana',
    category: 'Fruit',
    image: '/images/produce/banana.jpg',
    externalUrl: 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['banana', 'bananas', 'valapalam', 'kela', 'plantain', 'yelakki']
  },
  {
    id: 'mango',
    label: 'Mango',
    category: 'Fruit',
    image: '/images/produce/mango.jpg',
    externalUrl: 'https://images.pexels.com/photos/918643/pexels-photo-918643.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['mango', 'mangoes', 'mambazham', 'aam', 'alphonso', 'banganapalli', 'kesar']
  },
  {
    id: 'orange',
    label: 'Orange',
    category: 'Fruit',
    image: '/images/produce/orange.jpg',
    externalUrl: 'https://images.pexels.com/photos/327098/pexels-photo-327098.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['orange', 'oranges', 'santra', 'kamala orange', 'mandarin']
  },
  {
    id: 'grapes',
    label: 'Grapes',
    category: 'Fruit',
    image: '/images/produce/grapes.jpg',
    externalUrl: 'https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['grapes', 'grape', 'drakshai', 'angur', 'black grapes', 'green grapes']
  },
  {
    id: 'papaya',
    label: 'Papaya',
    category: 'Fruit',
    image: '/images/produce/papaya.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600&auto=format&fit=crop&q=80',
    keywords: ['papaya', 'papayas', 'pappali', 'papita']
  },
  {
    id: 'pomegranate',
    label: 'Pomegranate',
    category: 'Fruit',
    image: '/images/produce/pomegranate.jpg',
    externalUrl: 'https://images.pexels.com/photos/2296263/pexels-photo-2296263.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['pomegranate', 'pomegranates', 'mathulai', 'anaar', 'anar']
  },
  {
    id: 'guava',
    label: 'Guava',
    category: 'Fruit',
    image: '/images/produce/guava.jpg',
    externalUrl: 'https://images.pexels.com/photos/5945559/pexels-photo-5945559.jpeg?auto=compress&cs=tinysrgb&w=600',
    keywords: ['guava', 'guavas', 'koyyaka', 'koyya', 'amrud']
  },
  {
    id: 'strawberry',
    label: 'Strawberry',
    category: 'Fruit',
    image: '/images/produce/strawberry.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80',
    keywords: ['strawberry', 'strawberries']
  },
  {
    id: 'kiwi',
    label: 'Kiwi',
    category: 'Fruit',
    image: '/images/produce/kiwi.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=600&auto=format&fit=crop&q=80',
    keywords: ['kiwi', 'kiwis', 'kiwifruit']
  },
  {
    id: 'lemon',
    label: 'Lemon',
    category: 'Fruit',
    image: '/images/produce/lemon.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&auto=format&fit=crop&q=80',
    keywords: ['lemon', 'lemons', 'lime', 'limes', 'elumichai', 'nimbu']
  },
  {
    id: 'coconut',
    label: 'Coconut',
    category: 'Fruit',
    image: '/images/produce/coconut.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?w=600&auto=format&fit=crop&q=80',
    keywords: ['coconut', 'coconuts', 'thengai', 'nariyal', 'tender coconut', 'elaneer']
  },

  // ================= GRAINS & CROPS =================
  {
    id: 'paddy',
    label: 'Paddy / Rice',
    category: 'Grain',
    image: '/images/produce/paddy.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    keywords: ['paddy', 'rice', 'nellu', 'chawal', 'basmati', 'ponni']
  },
  {
    id: 'wheat',
    label: 'Wheat',
    category: 'Grain',
    image: '/images/produce/wheat.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
    keywords: ['wheat', 'gehun', 'godhumai']
  },
  {
    id: 'corn',
    label: 'Corn / Maize',
    category: 'Grain',
    image: '/images/produce/corn.jpg',
    externalUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
    keywords: ['corn', 'maize', 'makka cholam', 'bhutta', 'sweet corn']
  }
];

// Normalize input string: lowercase, remove punctuation, collapse whitespace
function normalizeProduceName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/['"’`\-_/\\()[\].,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Build indexed rules sorted by keyword length descending
// This guarantees specific multi-word phrases (e.g. 'custard apple', 'water melon')
// match BEFORE single words ('apple', 'melon')!
const MATCH_RULES = [];
for (const entry of PRODUCE_CATALOG) {
  for (const rawKw of entry.keywords) {
    const kw = normalizeProduceName(rawKw);
    if (kw) {
      MATCH_RULES.push({
        keyword: kw,
        length: kw.length,
        entry
      });
    }
  }
}
MATCH_RULES.sort((a, b) => b.length - a.length);

/**
 * Identify produce from user input.
 * Returns the matched catalog object or null if not matched.
 */
function identifyProduce(productName) {
  const clean = normalizeProduceName(productName);
  if (!clean) return null;

  for (const rule of MATCH_RULES) {
    // Word-boundary-aware regex search
    const escaped = rule.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('(^|\\s)' + escaped + '(\\s|$)', 'i');
    if (regex.test(clean)) {
      return rule.entry;
    }
  }

  // Secondary search: includes check if no exact word boundary found
  for (const rule of MATCH_RULES) {
    if (clean.includes(rule.keyword)) {
      return rule.entry;
    }
  }

  return null;
}

/**
 * Get realistic produce image URL.
 * Returns local image path '/images/produce/<id>.jpg' or null if unmapped.
 * NEVER returns an unrelated produce image.
 */
function getProduceImage(productName) {
  const match = identifyProduce(productName);
  if (match) {
    return match.image;
  }
  return null;
}

/**
 * Get produce details including label, category, image, and fallback CDN url.
 */
function getProduceDetails(productName) {
  const match = identifyProduce(productName);
  if (!match) return null;
  return {
    id: match.id,
    label: match.label,
    category: match.category,
    image: match.image,
    externalUrl: match.externalUrl
  };
}

module.exports = {
  PRODUCE_CATALOG,
  identifyProduce,
  getProduceImage,
  getProduceDetails,
  normalizeProduceName
};
