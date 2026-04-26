import Groq from 'groq-sdk';

export interface AISearchResult {
  keywords: string[];        // keywords to match against product names
  maxPrice?: number;         // extracted price limit in RWF
  categoryId?: string;       // matched category id
  explanation: string;       // human-readable explanation of what AI understood
  isAIQuery: boolean;        // true if AI was used
}

const CATEGORY_MAP: Record<string, string> = {
  'food': 'food-products',
  'food products': 'food-products',
  'groceries': 'food-products',
  'grocery': 'food-products',
  'drink': 'alcoholic-drinks',
  'drinks': 'alcoholic-drinks',
  'alcohol': 'alcoholic-drinks',
  'alcoholic': 'alcoholic-drinks',
  'beer': 'alcoholic-drinks',
  'wine': 'alcoholic-drinks',
  'baby': 'baby-products',
  'babies': 'baby-products',
  'children': 'baby-products',
  'kids': 'baby-products',
  'child': 'baby-products',
  'infant': 'baby-products',
  'toddler': 'baby-products',
  'personal care': 'personal-care',
  'cosmetics': 'personal-care',
  'beauty': 'personal-care',
  'hygiene': 'personal-care',
  'cleaning': 'cleaning-sanitary',
  'sanitary': 'cleaning-sanitary',
  'kitchen': 'kitchen-electronics',
  'kitchenware': 'kitchen-electronics',
  'electronics': 'kitchen-electronics',
  'storage': 'kitchen-storage',
  'pet': 'pet-care',
  'pets': 'pet-care',
  'sports': 'sports-wellness',
  'wellness': 'sports-wellness',
  'fitness': 'sports-wellness',
};

const SYSTEM_PROMPT = `You are a smart product search assistant for Simba Supermarket in Rwanda. 
Your job is to parse natural language shopping queries and extract structured search parameters.

The store sells products in these categories:
- food-products: milk, bread, rice, meat, snacks, beverages, cooking ingredients, etc.
- alcoholic-drinks: beer, wine, whisky, vodka, gin, rum, champagne, energy drinks, etc.
- baby-products: diapers, baby food, toys, wipes, baby care items, children's products
- personal-care: shampoo, soap, lotion, cream, deodorant, perfume, razors, etc.
- cleaning-sanitary: detergent, bleach, toilet paper, sponges, mops, cleaning products
- kitchen-electronics: pots, pans, kettles, blenders, irons, cups, plates, knives, etc.
- kitchen-storage: bottles, canisters, flasks, containers
- sports-wellness: sports equipment, fitness gear, yoga mats, dumbbells
- pet-care: dog food, cat food, pet accessories

Prices are in RWF (Rwandan Francs). Common price ranges: 500-200,000 RWF.

Respond ONLY with a valid JSON object (no markdown, no explanation outside JSON):
{
  "keywords": ["keyword1", "keyword2"],
  "maxPrice": 5000,
  "categoryId": "food-products",
  "explanation": "Searching for milk products under 5,000 RWF"
}

Rules:
- keywords: 1-4 most relevant product name keywords. For broad queries like "children products" use ["baby", "toy", "diaper", "wipes"]
- maxPrice: number in RWF if mentioned, otherwise omit the field
- categoryId: one of the category ids above if clearly implied, otherwise omit
- explanation: short friendly sentence describing what you understood
- If query mentions "cheap", "affordable", "budget" without a price, set maxPrice to 3000
- If query mentions "premium", "luxury", "best" without a price, omit maxPrice
- Always respond with valid JSON only`;

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY as string;
    groqClient = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return groqClient;
}

export async function parseSearchWithAI(query: string): Promise<AISearchResult> {
  // Detect if query is complex/natural language (not just a simple product name)
  const isNaturalLanguage = 
    /\b(less than|under|below|cheaper than|max|maximum|affordable|cheap|budget|good for|best for|for children|for kids|for baby|for babies|for pets|alcoholic|non-alcoholic|healthy|organic|premium|luxury)\b/i.test(query) ||
    /\d+/.test(query) || // contains numbers (likely a price)
    query.split(' ').length >= 3; // 3+ words suggests natural language

  if (!isNaturalLanguage) {
    // Simple single/double word query — skip AI, do direct search
    return {
      keywords: [query.toLowerCase()],
      isAIQuery: false,
      explanation: '',
    };
  }

  try {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query },
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';
    
    // Extract JSON even if there's extra text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [query],
      maxPrice: typeof parsed.maxPrice === 'number' ? parsed.maxPrice : undefined,
      categoryId: typeof parsed.categoryId === 'string' ? parsed.categoryId : undefined,
      explanation: typeof parsed.explanation === 'string' ? parsed.explanation : '',
      isAIQuery: true,
    };
  } catch (err) {
    console.error('AI search failed, falling back to text search:', err);
    // Fallback: try basic local parsing
    return localFallbackParse(query);
  }
}

function localFallbackParse(query: string): AISearchResult {
  const lower = query.toLowerCase();
  
  // Extract price
  const priceMatch = lower.match(/(?:less than|under|below|max|maximum|cheaper than)\s*(?:rwf\s*)?(\d[\d,]*)/i) ||
                     lower.match(/(\d[\d,]*)\s*(?:rwf|frw|francs?)?/i);
  const maxPrice = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : undefined;

  // Extract category
  let categoryId: string | undefined;
  for (const [keyword, catId] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) {
      categoryId = catId;
      break;
    }
  }

  // Extract keywords (remove price/filter words)
  const cleaned = lower
    .replace(/less than|under|below|max|maximum|cheaper than|affordable|cheap|budget|good for|best for|for\s+\w+/gi, '')
    .replace(/\d[\d,]*/g, '')
    .replace(/rwf|frw|francs?/gi, '')
    .trim();

  const keywords = cleaned.split(/\s+/).filter(w => w.length > 2);

  return {
    keywords: keywords.length > 0 ? keywords : [query],
    maxPrice,
    categoryId,
    explanation: '',
    isAIQuery: false,
  };
}
