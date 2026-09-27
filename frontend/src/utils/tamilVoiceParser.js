// Tamil & Tanglish Voice Input Parsing Engine for UzhavanGo
// Extracts Crop Name, Quantity, and Unit from spoken Tamil/Tanglish/English phrases

export const TAMIL_CROP_DICTIONARY = [
  // Vegetables
  {
    target: 'Tomato',
    patterns: [
      'தக்காளி', 'நாட்டு தக்காளி', 'thakkali', 'nattu thakkali', 'tomato', 'tomatoes', 'tamatar'
    ]
  },
  {
    target: 'Onion',
    patterns: [
      'வெங்காயம்', 'சின்ன வெங்காயம்', 'பெரிய வெங்காயம்', 'சாம்பார் வெங்காயம்',
      'vengayam', 'chinna vengayam', 'periya vengayam', 'sambar vengayam', 'onion', 'onions', 'pyaz', 'shallot'
    ]
  },
  {
    target: 'Potato',
    patterns: [
      'உருளைக்கிழங்கு', 'உருளை', 'உருளை கிழங்கு',
      'urulaikizhangu', 'urulai kizhangu', 'urulai', 'potato', 'potatoes', 'aloo'
    ]
  },
  {
    target: 'Brinjal / Eggplant',
    patterns: [
      'கத்தரிக்காய்', 'கத்திரிக்காய்', 'கத்திரி', 'kathirikai', 'kathrikkai', 'kattirikai', 'brinjal', 'brinjals', 'eggplant', 'baingan'
    ]
  },
  {
    target: "Lady's Finger / Okra",
    patterns: [
      'வெண்டைக்காய்', 'வெண்டை', 'vendakkai', 'vendai', "lady's finger", 'lady finger', 'okra', 'bhindi'
    ]
  },
  {
    target: 'Green Chilli',
    patterns: [
      'பச்சை மிளகாய்', 'மிளகாய்', 'பச்சைமிளகாய்',
      'pachai milagai', 'pachamilagai', 'milagai', 'green chilli', 'green chili', 'chilli', 'mirchi'
    ]
  },
  {
    target: 'Capsicum / Bell Pepper',
    patterns: [
      'குடை மிளகாய்', 'குடைமிளகாய்', 'kuda milagai', 'kudamilagai', 'capsicum', 'bell pepper', 'shimla mirch'
    ]
  },
  {
    target: 'Carrot',
    patterns: [
      'கேரட்', 'கேரட்டு', 'carrot', 'carrots', 'gajar'
    ]
  },
  {
    target: 'Beetroot',
    patterns: [
      'பீட்ரூட்', 'பீட் ரூட்', 'beetroot', 'beet root', 'chukandar'
    ]
  },
  {
    target: 'Cabbage',
    patterns: [
      'முட்டைக்கோஸ்', 'முட்டைகோஸ்', 'கோஸ்', 'muttakose', 'muttagose', 'kose', 'cabbage', 'patta gobi'
    ]
  },
  {
    target: 'Cauliflower',
    patterns: [
      'காலிஃபிளவர்', 'காலிபிளவர்', 'பூக்கோசு', 'பூக்கோஸ்', 'cauliflower', 'gobi', 'phool gobi'
    ]
  },
  {
    target: 'Cucumber',
    patterns: [
      'வெள்ளரிக்காய்', 'வெள்ளரி', 'vellarikka', 'vellarikkai', 'cucumber', 'kheera'
    ]
  },
  {
    target: 'Beans',
    patterns: [
      'பீன்ஸ்', 'அவரைக்காய்', 'அவரை', 'beans', 'avarakkai', 'avarai', 'french beans'
    ]
  },
  {
    target: 'Drumstick',
    patterns: [
      'முருங்கைக்காய்', 'முருங்கை', 'murungakkai', 'murungai', 'drumstick', 'drumsticks', 'moringa'
    ]
  },
  {
    target: 'Garlic',
    patterns: [
      'பூண்டு', 'வெள்ளைப்பூண்டு', 'poondu', 'vellai poondu', 'garlic', 'lahsun'
    ]
  },
  {
    target: 'Ginger',
    patterns: [
      'இஞ்சி', 'inji', 'ginger', 'adrak'
    ]
  },
  {
    target: 'Bitter Gourd',
    patterns: [
      'பாகற்காய்', 'பாவற்காய்', 'பாகல்', 'pavakkai', 'pagarkai', 'bitter gourd', 'karela'
    ]
  },
  {
    target: 'Bottle Gourd',
    patterns: [
      'சுரைக்காய்', 'சுரக்காய்', 'sorakkai', 'surakkai', 'bottle gourd', 'lauki'
    ]
  },
  {
    target: 'Pumpkin',
    patterns: [
      'பூசணிக்காய்', 'பரங்கிக்காய்', 'மஞ்சள் பூசணி',
      'poosanikai', 'parangikai', 'pumpkin', 'kaddu'
    ]
  },
  {
    target: 'Radish',
    patterns: [
      'முள்ளங்கி', 'mullangi', 'radish', 'mooli'
    ]
  },
  {
    target: 'Spinach',
    patterns: [
      'கீரை', 'பசலைக்கீரை', 'பாலக்கீரை', 'keerai', 'spinach', 'palak'
    ]
  },
  {
    target: 'Peas',
    patterns: [
      'பட்டாணி', 'பச்சை பட்டாணி', 'pattani', 'peas', 'green peas', 'matar'
    ]
  },

  // Fruits
  {
    target: 'Banana',
    patterns: [
      'வாழைப்பழம்', 'வாழைக்காய்', 'வாழை', 'valapalam', 'vazhaipazham', 'vazhaikkai', 'banana', 'bananas', 'kela', 'plantain'
    ]
  },
  {
    target: 'Mango',
    patterns: [
      'மாம்பழம்', 'மாங்காய்', 'மாம்பழங்கள்', 'mambazham', 'maangai', 'mango', 'mangoes', 'aam', 'alphonso'
    ]
  },
  {
    target: 'Coconut',
    patterns: [
      'தேங்காய்', 'இளநீர்', 'கொப்பரை', 'thengai', 'elaneer', 'coconut', 'coconuts', 'tender coconut', 'nariyal'
    ]
  },
  {
    target: 'Watermelon',
    patterns: [
      'தர்பூசணி', 'தர்பூசணி பழம்', 'tharpoosani', 'watermelon', 'water melon', 'tarbuj'
    ]
  },
  {
    target: 'Papaya',
    patterns: [
      'பப்பாளி', 'பப்பாளி பழம்', 'pappali', 'papaya', 'papayas', 'papita'
    ]
  },
  {
    target: 'Pomegranate',
    patterns: [
      'மாதுளை', 'மாதுளம்பழம்', 'mathulai', 'madhulai', 'pomegranate', 'anar'
    ]
  },
  {
    target: 'Guava',
    patterns: [
      'கொய்யா', 'கொய்யாப்பழம்', 'koyya', 'koyyaka', 'guava', 'amrud'
    ]
  },
  {
    target: 'Lemon',
    patterns: [
      'எலுமிச்சை', 'எலுமிச்சம்பழம்', 'elumichai', 'elumichampazham', 'lemon', 'lemons', 'lime', 'nimbu'
    ]
  },
  {
    target: 'Apple',
    patterns: [
      'ஆப்பிள்', 'apple', 'apples', 'seb'
    ]
  },
  {
    target: 'Orange',
    patterns: [
      'ஆரஞ்சு', 'orange', 'oranges', 'santra'
    ]
  },
  {
    target: 'Grapes',
    patterns: [
      'திராட்சை', 'திராட்சை பழம்', 'drakshai', 'grapes', 'grape', 'angur'
    ]
  },
  {
    target: 'Pineapple',
    patterns: [
      'அன்னாசி', 'அன்னாசிப்பழம்', 'annasi', 'pineapple'
    ]
  },
  {
    target: 'Jackfruit',
    patterns: [
      'பலாப்பழம்', 'பலாக்காய்', 'பலா', 'palapazham', 'pala', 'jackfruit'
    ]
  },
  {
    target: 'Custard Apple',
    patterns: [
      'சீத்தாப்பழம்', 'சீதாப்பழம்', 'seethapazham', 'custard apple', 'sitaphal'
    ]
  },
  {
    target: 'Dragon Fruit',
    patterns: [
      'டிராகன் பழம்', 'டிராகன்', 'dragon fruit', 'dragonfruit'
    ]
  },
  {
    target: 'Sapota / Chikoo',
    patterns: [
      'சப்போட்டா', 'sapota', 'chikoo', 'chiku'
    ]
  },

  // Grains & Crops
  {
    target: 'Paddy / Rice',
    patterns: [
      'நெல்', 'அரிசி', 'பொன்னி அரிசி', 'பாசுமதி', 'nellu', 'nel', 'arisi', 'paddy', 'rice', 'chawal'
    ]
  },
  {
    target: 'Corn / Maize',
    patterns: [
      'மக்காச்சோளம்', 'சோளம்', 'corn', 'maize', 'makka cholam', 'solam', 'bhutta'
    ]
  },
  {
    target: 'Wheat',
    patterns: [
      'கோதுமை', 'godhumai', 'wheat', 'gehun'
    ]
  }
];

// Spoken Tamil numbers mapping
export const TAMIL_NUMBERS_MAP = {
  'ஒன்று': 1, 'ஒன்னு': 1, 'onnu': 1, 'one': 1,
  'இரண்டு': 2, 'ரெண்டு': 2, 'rendu': 2, 'two': 2,
  'மூன்று': 3, 'மூணு': 3, 'moonu': 3, 'three': 3,
  'நான்கு': 4, 'நாலு': 4, 'naalu': 4, 'four': 4,
  'ஐந்து': 5, 'அஞ்சு': 5, 'anju': 5, 'ainthu': 5, 'five': 5,
  'ஆறு': 6, 'aaru': 6, 'six': 6,
  'ஏழு': 7, 'ezhu': 7, 'seven': 7,
  'எட்டு': 8, 'ettu': 8, 'eight': 8,
  'ஒன்பது': 9, 'onbathu': 9, 'nine': 9,
  'பத்து': 10, 'pathu': 10, 'ten': 10,
  'பதினைந்து': 15, 'பதினஞ்சு': 15, 'pathinainthu': 15, 'fifteen': 15,
  'இருபது': 20, 'erubathu': 20, 'irubathu': 20, 'twenty': 20,
  'இருபத்தைந்து': 25, 'இருபத்தஞ்சு': 25, 'irubathainthu': 25, 'twenty five': 25,
  'முப்பது': 30, 'muppathu': 30, 'thirty': 30,
  'நாற்பது': 40, 'narpathu': 40, 'forty': 40,
  'ஐம்பது': 50, 'aimbathu': 50, 'aimpathu': 50, 'fifty': 50,
  'அறுபது': 60, 'arubathu': 60, 'sixty': 60,
  'எழுபது': 70, 'ezhubathu': 70, 'seventy': 70,
  'எண்பது': 80, 'enbahu': 80, 'enpathu': 80, 'eighty': 80,
  'தொண்ணூறு': 90, 'thonnooru': 90, 'ninety': 90,
  'நூறு': 100, 'nooru': 100, 'hundred': 100, 'one hundred': 100,
  'இருநூறு': 200, 'irunooru': 200, 'two hundred': 200,
  'முந்நூறு': 300, 'munnooru': 300, 'three hundred': 300,
  'நாநூறு': 400, 'naanooru': 400, 'four hundred': 400,
  'ஐந்நூறு': 500, 'ainooru': 500, 'five hundred': 500,
  'ஆயிரம்': 1000, 'aayiram': 1000, 'thousand': 1000, 'one thousand': 1000,
  'இரண்டாயிரம்': 2000, 'rendaayiram': 2000, 'two thousand': 2000,
  'ஐந்தாயிரம்': 5000, 'anjaayiram': 5000, 'five thousand': 5000
};

// Unit dictionary
export const UNIT_MAPPINGS = [
  {
    unit: 'tonnes',
    patterns: ['டன்', 'டன்ஸ்', 'ton', 'tons', 'tonne', 'tonnes', 'டன்கள்']
  },
  {
    unit: 'quintals',
    patterns: ['குவிண்டால்', 'குவிண்டால்கள்', 'quintal', 'quintals']
  },
  {
    unit: 'bunches',
    patterns: ['கட்டு', 'கட்டுகள்', 'தாறு', 'தாறுகள்', 'bunch', 'bunches', 'kattu']
  },
  {
    unit: 'crates',
    patterns: ['கிரேட்', 'கிரேட்டுகள்', 'பெட்டி', 'பெட்டிகள்', 'கூடை', 'கூடைகள்', 'மூட்டை', 'மூட்டைகள்', 'பை', 'பைகள்', 'crate', 'crates', 'box', 'boxes', 'bag', 'bags', 'mootai', 'petti']
  },
  {
    unit: 'kg',
    patterns: ['கிலோ', 'கிலோகிராம்', 'கிலோக்கள்', 'kg', 'kgs', 'kilo', 'kilogram', 'kilograms']
  }
];

/**
 * Parse Tamil / Tanglish / English spoken sentence
 * @param {string} text - Spoken transcript
 * @returns {object} { productName, quantity, unit, rawTranscript }
 */
export function parseTamilVoiceInput(text) {
  if (!text || typeof text !== 'string') {
    return { productName: '', quantity: '', unit: 'kg', rawTranscript: '' };
  }

  const raw = text.trim();
  const lower = text.toLowerCase().replace(/[,.!?;:]/g, ' ');

  let extractedCrop = '';
  let extractedQuantity = '';
  let extractedUnit = 'kg';

  // 1. Extract Crop Name (matching longest patterns first)
  const allCropRules = [];
  for (const crop of TAMIL_CROP_DICTIONARY) {
    for (const pat of crop.patterns) {
      allCropRules.push({
        target: crop.target,
        pattern: pat.toLowerCase().trim(),
        length: pat.length
      });
    }
  }
  allCropRules.sort((a, b) => b.length - a.length);

  for (const rule of allCropRules) {
    if (lower.includes(rule.pattern)) {
      extractedCrop = rule.target;
      break;
    }
  }

  // 2. Extract Unit
  for (const u of UNIT_MAPPINGS) {
    let matched = false;
    for (const pat of u.patterns) {
      if (lower.includes(pat)) {
        extractedUnit = u.unit;
        matched = true;
        break;
      }
    }
    if (matched) break;
  }

  // 3. Extract Quantity
  // A. Check for Arabic numeric digits first (e.g., '100', '50.5')
  const digitMatch = lower.match(/(\d+(?:\.\d+)?)/);
  if (digitMatch) {
    extractedQuantity = digitMatch[1];
  } else {
    // B. Check for spoken Tamil/English numbers
    for (const [word, numVal] of Object.entries(TAMIL_NUMBERS_MAP)) {
      const wordRegex = new RegExp(`(^|\\s)${word}(\\s|$)`, 'i');
      if (wordRegex.test(lower)) {
        extractedQuantity = String(numVal);
        break;
      }
    }
  }

  return {
    productName: extractedCrop,
    quantity: extractedQuantity,
    unit: extractedUnit,
    rawTranscript: raw
  };
}
