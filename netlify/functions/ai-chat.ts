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
- Core Value: 100% on-site mobile detailing. We come directly to your driveway, office parking, or garage with commercial detailing equipment.

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

WATER, ELECTRICITY & LOCATION REQUIREMENTS:
- On-site water access (spigot/hose) and electricity access (120V outlet) are REQUIRED for our standard mobile detailing service.
- Do NOT claim that CREWW automatically brings water tanks or generators.
- During booking, customers must answer Yes or No for both Water Availability and Electricity Availability.
- Selecting "No" for water or electricity NEVER blocks or rejects a booking submission. Instead, if either or both answers are "No", the booking is flagged as "Availability Verification Required" so our team can manually review the location and confirm whether service can be arranged before confirming any appointment.
- The website's ZIP code checker validates US ZIP code format (5-digit or ZIP+4) only—it does NOT verify geographic coverage or service routes. Never claim a ZIP code has verified geographic coverage.

BOOKING PROCESS:
- Click any "BOOK YOUR SERVICE" button on the website to open the reservation modal.
- Flexible scheduling: Customers choose their preferred date and preferred time, which are always subject to manual review and confirmation by our team. NEVER guarantee or confirm an appointment.
- ZERO advance deposit required; payment is collected after completion and a personal walkthrough inspection.

Strict Rules:
- Never invent customer reviews, ratings, other services, window tints, ceramic add-ons, custom prices, discounts, availability, or geographic service coverage.
- Always recommend the Full Interior & Exterior Detailing ($229) as our best value package when customers want both interior and exterior care.
- Stay friendly, accurate, and helpful.`;

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
          reply: "Welcome to **CREWW MOBILE AUTO DETAILING**! We bring mobile detailing right to your location.\n\nWe offer **Exterior Detailing ($169)**, **Interior Detailing ($189)**, and **Full Interior & Exterior Detailing ($229 · Best Value)**. Water and electricity are required at your location (or select **No** when booking for manual team verification). Click **'BOOK YOUR SERVICE'** to submit a request!",
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

    const attempts: Array<{ model: string; timeoutMs: number; thinkingLevel?: ThinkingLevel }> = [
      { model: 'gemini-3.1-flash-lite', timeoutMs: 5500, thinkingLevel: ThinkingLevel.MINIMAL },
      { model: 'gemini-4-hydrogen', timeoutMs: 6000, thinkingLevel: ThinkingLevel.LOW },
    ];

    let replyText: string | undefined;
    let lastError: unknown = null;

    for (const attempt of attempts) {
      try {
        const config = attempt.thinkingLevel
          ? {
              systemInstruction: CREWW_SYSTEM_INSTRUCTION,
              thinkingConfig: { thinkingLevel: attempt.thinkingLevel },
            }
          : {
              systemInstruction: CREWW_SYSTEM_INSTRUCTION,
            };

        const response = await withTimeout(
          ai.models.generateContent({
            model: attempt.model,
            contents,
            config,
          }),
          attempt.timeoutMs
        );

        if (response.text) {
          replyText = response.text;
          break;
        }
      } catch (err: unknown) {
        lastError = err;
        const status = (err as { status?: number })?.status || 'timeout/network';
        console.warn(`[Netlify AI Chat] Model ${attempt.model} unavailable (${status}), falling back...`);
      }
    }

    if (replyText) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ reply: replyText }),
      };
    }

    console.warn('[Netlify AI Chat] AI models timed out or failed:', lastError);
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: 'The AI concierge is temporarily busy. Please try again in a moment or click BOOK YOUR SERVICE to submit your request.',
      }),
    };
  } catch (err: unknown) {
    console.error('[Netlify AI Chat] Unhandled exception:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: (err as Error)?.message || 'Internal server error processing AI chat.' }),
    };
  }
};
