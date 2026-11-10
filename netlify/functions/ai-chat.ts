import { GoogleGenAI } from '@google/genai';

interface ChatHistoryItem {
  role?: 'user' | 'model';
  sender?: 'user' | 'assistant';
  text: string;
}

const CREWW_SYSTEM_INSTRUCTION = `You are "Crewy", the friendly, knowledgeable, and professional AI car detailing assistant for CREWW MOBILE AUTO DETAILING.
You speak in a warm, confident, automotive-savvy American tone. Keep answers concise, helpful, and easy to read.

Official CREWW Knowledge Base:
- Business Name: CREWW MOBILE AUTO DETAILING
- Service Territory: Mobile Auto Detailing across the United States (USA).
- Official Social Media: Only Instagram (@creww.mobile.autodetailing).
- Core Service Model: 100% on-site mobile detailing. We dispatch directly to the customer's driveway, residential parking, or workplace.

EXACTLY THREE SERVICE PACKAGES (NO OTHER PACKAGES EXIST):
1. EXTERIOR DETAILING:
   - Regular Price: $229
   - Special Offer Price: $169 (Save $60)
   - Inclusions: Pressure washer rinse, Foam soap hand wash, Buffer wax, Tire degreasing, Dress wheels, tires and rims, Clean door jambs and trunk seals, Microfiber towel drying.

2. INTERIOR DETAILING:
   - Regular Price: $229
   - Special Offer Price: $189 (Save $40)
   - Inclusions: Vacuum all carpets and seats, Wipe down all interior surfaces, Dress interior surfaces, Leather conditioner, Shampoo stains, Pet hair removal, Clean interior windows.

3. FULL INTERIOR & EXTERIOR DETAILING (BEST VALUE):
   - Regular Price: $299
   - Special Offer Price: $229 (Save $70)
   - Inclusions: Combines ALL 7 Exterior inclusions AND ALL 7 Interior inclusions (all 14 master processes).

MANDATORY SERVICE LOCATION REQUIREMENTS:
- The customer MUST provide access to WATER (outdoor water spigot or garden hose connection) at their service location.
- The customer MUST provide access to standard ELECTRICITY (120V outdoor outlet) at their service location.
- Both requirements are mandatory checkboxes on the booking form.

BOOKING & PRICING POLICIES:
- Customers can click any "BOOK YOUR SERVICE" button on the website to open the instant booking popup.
- Booking requires: Full Name, Phone, Email, Vehicle (Make, Model, Year), Service Package, Preferred Date & 12-hour Time Slot, Street Address, City, State, and 5-digit US ZIP Code.
- ZERO advance payment is required. Customers pay only after completing a personal walkthrough inspection with the detailing technician.
- Available arrival windows: 08:00 AM, 09:30 AM, 11:00 AM, 01:00 PM, 02:30 PM, 04:00 PM, 05:30 PM.

STRICT INSTRUCTIONS:
- Never invent other services, ceramic coatings, window tints, or custom pricing.
- Always recommend the Full Detailing ($229) as our best value package when customers want complete rejuvenation.
- Remind customers about water and electricity access whenever they ask about preparing for an appointment.
- Keep responses friendly, professional, and formatted with clean bullet points.`;

// Predefined verified fallback answers from official knowledge base
function getVerifiedKnowledgeReply(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('how much')) {
    return "At **CREWW MOBILE AUTO DETAILING**, we have three straightforward, discounted packages:\n\n• **Exterior Detailing:** **$169** (Regular $229 · Save $60)\n• **Interior Detailing:** **$189** (Regular $229 · Save $40)\n• **Full Interior & Exterior Detailing:** **$229** (Regular $299 · Save $70 · **Best Value**)\n\nZero hidden fees! Payment is due only after your personal walkthrough inspection upon completion.";
  }
  if (q.includes('exterior') || (q.includes('outside') && !q.includes('inside'))) {
    return "Our **Exterior Detailing** package ($169 special offer) includes:\n\n• High-pressure washer pre-rinse\n• Gentle foam soap hand wash\n• High-gloss machine buffer wax\n• Deep tire degreasing\n• Dressing wheels, tires, and rims\n• Cleaning door jambs and trunk seals\n• Streak-free microfiber drying";
  }
  if (q.includes('interior') || (q.includes('inside') && !q.includes('outside'))) {
    return "Our **Interior Detailing** package ($189 special offer) includes:\n\n• Deep vacuuming of all carpets and seats\n• Wiping down all interior surfaces\n• Protective dressing of dashboard, console, and door panels\n• Leather conditioning treatment\n• Hot steam shampooing for stained fabric areas\n• Complete pet hair removal\n• Crystal-clear interior window cleaning";
  }
  if (q.includes('full') || q.includes('both') || q.includes('combo')) {
    return "Our **Full Interior & Exterior Detailing** package is our **Best Value at $229** (Regular $299 · Save $70)!\n\nIt combines all 7 exterior decontamination steps with all 7 interior deep cleaning treatments—14 total master treatments delivered directly to your driveway!";
  }
  if (q.includes('water') || q.includes('electric') || q.includes('power') || q.includes('outlet') || q.includes('require') || q.includes('need')) {
    return "**Service Location Requirements:**\nYes, our mobile detailing service requires access to two utilities at your location:\n\n1. **Water:** An accessible outdoor water spigot or hose connection.\n2. **Electricity:** A standard 120V outdoor electrical outlet.\n\nBoth water and electricity confirmations are required when scheduling your appointment.";
  }
  if (q.includes('book') || q.includes('schedule') || q.includes('appointment') || q.includes('reserve')) {
    return "Booking is quick and simple!\n\n1. Tap any **'BOOK YOUR SERVICE'** button on the page.\n2. Select your package, appointment date, and preferred arrival time.\n3. Enter your vehicle details and service address.\n4. Confirm your water and electricity access.\n\nNo advance payment is needed—you pay after inspecting your clean vehicle!";
  }
  if (q.includes('zip') || q.includes('location') || q.includes('area') || q.includes('city') || q.includes('state')) {
    return "CREWW provides mobile detailing across the United States! You can enter your 5-digit US ZIP code in our **'IS CREWW AVAILABLE IN YOUR AREA?'** checker on the homepage to verify your route in seconds.";
  }
  return "Welcome to **CREWW MOBILE AUTO DETAILING**! We bring precision car detailing right to your driveway anywhere in the USA. We offer Exterior Detailing ($169), Interior Detailing ($189), and Full Detailing ($229 · Best Value). Just ensure water and power are accessible at your location, and click **'BOOK YOUR SERVICE'** to schedule!";
}

export const handler = async (event: any) => {
  // Handle CORS preflight
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

    // If API key is not present in Netlify environment variables, supply verified knowledge reply with note
    if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
      const fallbackReply = getVerifiedKnowledgeReply(message);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: fallbackReply,
          notice: 'Note: To enable generative AI model features on Netlify, add GEMINI_API_KEY to your Netlify Site Configuration > Environment variables.',
        }),
      };
    }

    // Initialize GoogleGenAI SDK with server-side API key
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

    // Append current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    // Model selection per SKILL.md: 'gemini-3.8-flash'
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let replyText: string | undefined;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: CREWW_SYSTEM_INSTRUCTION,
          },
        });

        if (response.text) {
          replyText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Netlify AI Chat] Model ${model} issue:`, err?.message || err);
      }
    }

    if (replyText) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ reply: replyText }),
      };
    }

    // If Gemini API call failed, deliver verified knowledge base reply so the customer is never left stranded
    const safeReply = getVerifiedKnowledgeReply(message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: safeReply,
        fallback: true,
        errorDetails: lastError?.message,
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
