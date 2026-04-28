import Groq from 'groq-sdk';
import { MergedProduct } from '../context/ProductContext';
import { branches } from '../data/mockData';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  products?: MergedProduct[]; // products to display as cards
  timestamp: Date;
}

let groqClient: Groq | null = null;

function getClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: import.meta.env.VITE_GROQ_API_KEY as string,
      dangerouslyAllowBrowser: true,
    });
  }
  return groqClient;
}

// Build the full product catalog string for the AI
function buildCatalog(products: MergedProduct[]): string {
  return products
    .map((p) => {
      const name = typeof p.name === 'string' ? p.name : p.name.EN || '';
      const inStock = p.inStock !== false && p.stock > 0 ? 'in_stock' : 'out_of_stock';
      return `${p.id}|${name}|${p.price}RWF|${p.categoryId}|${inStock}|rating:${(p.rating || 4).toFixed(1)}`;
    })
    .join('\n');
}

// Build branch list
function buildBranches(): string {
  return branches
    .map((b) => {
      const name = typeof b.name === 'string' ? b.name : b.name.EN;
      const city = typeof b.city === 'string' ? b.city : b.city.EN;
      const address = typeof b.address === 'string' ? b.address : b.address.EN;
      return `${name} — ${address}, ${city}`;
    })
    .join('\n');
}

function buildSystemPrompt(products: MergedProduct[]): string {
  const catalog = buildCatalog(products);
  const branchList = buildBranches();
  const totalProducts = products.length;
  const categories = [
    'food-products (milk, bread, rice, meat, snacks, coffee, tea, cooking ingredients)',
    'alcoholic-drinks (beer, wine, whisky, vodka, gin, rum, champagne)',
    'baby-products (diapers, baby food, toys, wipes, baby care)',
    'personal-care (shampoo, soap, lotion, cream, deodorant, perfume)',
    'cleaning-sanitary (detergent, bleach, toilet paper, sponges, mops)',
    'kitchen-electronics (pots, pans, kettles, blenders, irons, cups, plates)',
    'kitchen-storage (bottles, canisters, flasks, containers)',
    'sports-wellness (sports equipment, fitness gear, dumbbells)',
    'pet-care (dog food, cat food, pet accessories)',
    'general (miscellaneous items)',
  ].join('\n  ');

  return `You are Simba AI, the friendly and knowledgeable shopping assistant for Simba Supermarket — Rwanda's largest supermarket chain.

You have FULL ACCESS to the live product database with ${totalProducts} products. Prices are in RWF (Rwandan Francs).

CATEGORIES:
  ${categories}

STORE BRANCHES (${branches.length} locations across Rwanda):
${branchList}

PRODUCT DATABASE (format: ID|Name|Price|Category|Stock|Rating):
${catalog}

YOUR CAPABILITIES:
1. Find products by name, category, price range, or description
2. Compare products and prices
3. Recommend products based on needs (e.g., "good for babies", "cheap cleaning products")
4. Answer questions about store locations, branches, hours
5. Help with shopping lists and budgets
6. Suggest alternatives when a product is out of stock
7. Answer in English, French, or Kinyarwanda based on what the user writes

RESPONSE FORMAT RULES:
- Be conversational, warm, and helpful
- When showing products, ALWAYS include their IDs in a special tag so the UI can display product cards
- Format product lists like this: [PRODUCTS:id1,id2,id3,id4,id5]
- Put the [PRODUCTS:...] tag at the END of your message, after your text
- Show maximum 8 products at a time
- For price comparisons, mention the cheapest option first
- Keep responses concise but complete
- If asked about something unrelated to Simba Supermarket, politely redirect to shopping topics
- Always mention prices in RWF
- If a product is out of stock, say so and suggest alternatives

EXAMPLES:
User: "show me milk under 5000"
You: "Here are the milk products available under 5,000 RWF at Simba! 🥛\n[PRODUCTS:id1,id2,id3]"

User: "what's the cheapest beer?"
You: "The cheapest beer we have is [name] at [price] RWF. Here are our most affordable options:\n[PRODUCTS:id1,id2,id3]"

User: "good products for my baby"
You: "Great choices for your little one! Here are our top baby products:\n[PRODUCTS:id1,id2,id3]"`;
}

// Parse AI response to extract text and product IDs
export function parseAIResponse(
  content: string,
  products: MergedProduct[]
): { text: string; products: MergedProduct[] } {
  const productTagMatch = content.match(/\[PRODUCTS:([\d,]+)\]/);

  if (!productTagMatch) {
    return { text: content.trim(), products: [] };
  }

  const ids = productTagMatch[1].split(',').map((id) => id.trim());
  const matchedProducts = ids
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as MergedProduct[];

  const text = content.replace(/\[PRODUCTS:[\d,]+\]/, '').trim();

  return { text, products: matchedProducts };
}

// Main chat function — sends full conversation history
export async function sendMessage(
  userMessage: string,
  history: ChatMessage[],
  products: MergedProduct[]
): Promise<{ text: string; products: MergedProduct[] }> {
  const client = getClient();

  // Build conversation history for Groq (exclude product cards, just text)
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: buildSystemPrompt(products) },
    // Include last 10 messages for context (to stay within token limits)
    ...history.slice(-10).map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.4,
    max_tokens: 1024,
  });

  const raw = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again.";
  return parseAIResponse(raw, products);
}
