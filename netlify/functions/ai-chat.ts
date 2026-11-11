import { GoogleGenAI, ThinkingLevel } from '@google/genai';

interface ChatHistoryItem {
  role?: 'user' | 'model';
  sender?: 'user' | 'assistant';
  text: string;
}

const CREWW_SYSTEM_INSTRUCTION = `You are "Crewy", the friendly, knowledgeable, and professional AI car detailing concierge for CREWW MOBILE AUTO DETAILING.
You speak in a warm, confident, and automotive-savvy American tone. Keep answers concise, helpful, and scannable with bullet points and bold highlights.

Official CREWW Knowledge Base:
- Business Name: CREWW MOBILE AUTO DETAILING
- Service Territory: Mobile Auto Detailing across the United States (USA).
- Official Social Media: Only Instagram (@creww.mobile.autodetailing).
- Core Value: 100% on-site mobile detailing. We come directly to your driveway, office parking, or garage with professional equipment.

EXACTLY THREE SERVICE PACKAGES:
1. EXTERIOR DETAILING:
   - Regular Price: $229
   - Special Offer: $169 (Save $60)
   - Inclusions: Pressure washer rinse, Foam soap hand wash, Buffer wax, Tire degreasing, Dress wheels, tires and rims, Clean door jambs and trunk seals, Microfiber towel drying.

2. INTERIOR DETAILING:
   - Regular Price: $229
   - Special Offer: $189 (Save $40)
   - Inclusions: Vacuum all carpets and seats, Wipe down all interior surfaces, Dress interior surfaces, Leather conditioner, Shampoo stains, Pet hair removal, Clean interior windows.

3. FULL INTERIOR & EXTERIOR DETAILING (BEST VALUE):
   - Regular Price: $299
   - Special Offer: $229 (Save $70)
   - Inclusions: ALL 7 Exterior inclusions AND ALL 7 Interior inclusions (14 total master treatments).

SERVICE LOCATION & UTILITIES:
- Water access (spigot/hose) and electricity access (120V outlet) can be indicated by the customer during booking.
- Selecting "No, water is not available" or "No, electricity is not available" NEVER blocks or rejects a booking! Our dispatch team reviews every customer's setup and coordinates necessary arrangements.
- Customers can verify their 5-digit US ZIP code route using the area checker on the website.

BOOKING PROCESS:
- Click any "BOOK YOUR SERVICE" button on the website to open the reservation modal.
- Flexible scheduling: Customers choose their preferred date and preferred time (subject to confirmation by our team).
- ZERO advance deposit required; payment is due only after a personal walkthrough inspection upon service completion.

Rules:
- Never invent other services, window tints, ceramic add-ons, or custom prices not listed above.
- Always recommend the Full Detailing ($229) as our best value package when customers want both interior and exterior rejuvenation.
- Stay friendly, enthusiastic, and helpful.`;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)),
  ]);
}

export const handler = async (event: any) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    let body: { message?: string; history?: ChatHistoryItem[] } = {};
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON payload in request body.' }),
      };
    }

    const { message, history } = body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message text is required.' }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: "Welcome to **CREWW MOBILE AUTO DETAILING**! We bring premium mobile detailing right to your driveway across the USA.\n\nWe offer **Exterior Detailing ($169)**, **Interior Detailing ($189)**, and **Full Detailing ($229 · Best Value)** with payment due only after your post-service inspection. Click **'BOOK YOUR SERVICE'** to schedule!",
          notice: 'Note: To enable generative AI model features on Netlify, add GEMINI_API_KEY to your Netlify Site Configuration > Environment variables.',
        }),
      };
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Format conversation history for Gemini API
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-8)) {
        if (item && typeof item.text === 'string' && item.text.trim()) {
          const role = item.role === 'model' || item.sender === 'assistant' ? 'model' : 'user';
          contents.push({
            role,
            parts: [{ text: item.text.trim() }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    const candidateModels = [
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
    ];
    let replyText: string | undefined;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const config = model === 'gemini-3.8-flash'
          ? {
              systemInstruction: CREWW_SYSTEM_INSTRUCTION,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            }
          : {
              systemInstruction: CREWW_SYSTEM_INSTRUCTION,
            };

        const response = await withTimeout(
          ai.models.generateContent({
            model,
            contents,
            config,
          }),
          15000
        );

        if (response.text) {
          replyText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Netlify AI Chat] Model ${model} unavailable (${err?.status || 'network'}), attempting next model...`);
      }
    }

    if (replyText) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ reply: replyText }),
      };
    }

    console.warn('[Netlify AI Chat] All candidate models timed out or failed. Last error:', lastError);
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: 'AI assistant is currently experiencing high demand. Please try again in a moment or click BOOK YOUR SERVICE.',
      }),
    };
  } catch (err: any) {
    console.error('[Netlify AI Chat] Unhandled exception:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err?.message || 'Internal server error processing AI chat.' }),
    };
  }
};
