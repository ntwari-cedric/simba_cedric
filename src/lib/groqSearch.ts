import Groq from 'groq-sdk';
import { MergedProduct } from '../context/ProductContext';

export interface AISearchResult {
  matchedIds: string[];      // exact product IDs matched by AI
  maxPrice?: number;         // extracted price limit in RWF
  categoryId?: string;       // matched category id (only for pure category queries)
  explanation: string;       // human-readable explanation
  isAIQuery: boolean;
}

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

// Detect if query needs AI (natural language) or is a plain product name search
function isNaturalLanguageQuery(query: string): boolean {
  return (
    /\b(less than|under|below|cheaper than|max|maximum|affordable|cheap|budget|good for|best for|for children|for kids|for baby|for babies|for pets|alcoholic|non-alcoholic|healthy|organic|premium|luxury|recommend|suggest|show me|find me|i need|i want)\b/i.test(query) ||
    /\d{3,}/.test(query) || // contains a number with 3+ digits (likely a price)
    query.trim().split(/\s+/).length >= 3 // 3+ words = natural language
  );
}

export async function searchWithAI(
  query: string,
  products: MergedProduct[]
): Promise<AISearchResult> {
  const trimmed = query.trim();

  if (!trimmed) {
    return { matchedIds: [], explanation: '', isAIQuery: false };
  }

  // Simple 1-2 word query: skip AI, do fast local keyword match
  if (!isNaturalLanguageQuery(trimmed)) {
    const lower = trimmed.toLowerCase();
    const matched = products.filter((p) => {
      const name =
        typeof p.name === 'string'
          ? p.name
          : [p.name.EN, p.name.FR, p.name.KIN].filter(Boolean).join(' ');
      return name.toLowerCase().includes(lower);
    });
    return {
      matchedIds: matched.map((p) => p.id),
      explanation: '',
      isAIQuery: false,
    };
  }

  // Build a compact product catalog for the AI
  // Format: "ID|Name|Price|Category"
  const catalog = products
    .map((p) => {
      const name =
        typeof p.name === 'string' ? p.name : p.name.EN || '';
      return `${p.id}|${name}|${p.price}|${p.categoryId}`;
    })
    .join('\n');

  const systemPrompt = `You are a product search engine for Simba Supermarket in Rwanda.
You receive a natural language query and a product catalog, and you return ONLY the IDs of matching products.

CATALOG FORMAT: ID|ProductName|PriceRWF|CategoryID

CATEGORIES:
- food-products: milk, bread, rice, meat, snacks, coffee, tea, cooking ingredients
- alcoholic-drinks: beer, wine, whisky, vodka, gin, rum, champagne
- baby-products: diapers, baby food, toys, wipes, baby care
- personal-care: shampoo, soap, lotion, cream, deodorant, perfume
- cleaning-sanitary: detergent, bleach, toilet paper, sponges, mops
- kitchen-electronics: pots, pans, kettles, blenders, irons, cups, plates
- kitchen-storage: bottles, canisters, flasks, containers
- sports-wellness: sports equipment, fitness gear, dumbbells
- pet-care: dog food, cat food, pet accessories

RULES:
1. Match products by NAME relevance to the query — be STRICT. "milk" should only match products with "milk" in the name, NOT bread or baguette.
2. Apply price filter: if query says "less than X" or "under X", only include products where Price <= X
3. For broad queries like "baby products" or "cleaning products", match all products in that category
4. For "good for children" / "for kids" → match baby-products category
5. For "alcoholic drinks" → match alcoholic-drinks category
6. Prices are in RWF (Rwandan Francs)
7. Return maximum 60 most relevant product IDs

Respond ONLY with this JSON (no markdown):
{
  "ids": ["id1", "id2", ...],
  "maxPrice": 5000,
  "explanation": "Found X milk products under 5,000 RWF"
}`;

  try {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Query: "${trimmed}"\n\nCATALOG:\n${catalog}`,
        },
      ],
      temperature: 0.0,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const parsed = JSON.parse(jsonMatch[0]);
    const ids: string[] = Array.isArray(parsed.ids)
      ? parsed.ids.map(String)
      : [];

    return {
      matchedIds: ids,
      maxPrice: typeof parsed.maxPrice === 'number' ? parsed.maxPrice : undefined,
      explanation: typeof parsed.explanation === 'string' ? parsed.explanation : '',
      isAIQuery: true,
    };
  } catch (err) {
    console.error('AI search failed, falling back to local search:', err);
    return localFallback(trimmed, products);
  }
}

// Local fallback when AI is unavailable
function localFallback(query: string, products: MergedProduct[]): AISearchResult {
  const lower = query.toLowerCase();

  // Extract price
  const priceMatch =
    lower.match(/(?:less than|under|below|max|maximum|cheaper than)\s*(?:rwf\s*)?(\d[\d,]*)/i) ||
    lower.match(/(\d{3,}[\d,]*)\s*(?:rwf|frw|francs?)?/i);
  const maxPrice = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : undefined;

  // Strip price/filter words to get core keywords
  const cleaned = lower
    .replace(/less than|under|below|max|maximum|cheaper than|affordable|cheap|budget|good for|best for|for\s+\w+/gi, '')
    .replace(/\d[\d,]*/g, '')
    .replace(/rwf|frw|francs?/gi, '')
    .trim();

  const keywords = cleaned.split(/\s+/).filter((w) => w.length > 2);

  const matched = products.filter((p) => {
    const name =
      typeof p.name === 'string'
        ? p.name
        : [p.name.EN, p.name.FR, p.name.KIN].filter(Boolean).join(' ');
    const nameLower = name.toLowerCase();
    const priceOk = maxPrice ? p.price <= maxPrice : true;
    const nameMatch = keywords.some((kw) => nameLower.includes(kw));
    return priceOk && nameMatch;
  });

  return {
    matchedIds: matched.map((p) => p.id),
    maxPrice,
    explanation: '',
    isAIQuery: false,
  };
}
