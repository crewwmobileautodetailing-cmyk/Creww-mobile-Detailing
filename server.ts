import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini API client on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const CREWW_SYSTEM_INSTRUCTION = `You are "Crewy", the friendly, knowledgeable, and professional AI car detailing assistant for CREWW MOBILE AUTO DETAILING.
You speak in a warm, confident, and automotive-savvy American tone. Keep answers concise, helpful, and scannable.

Official CREWW Knowledge Base:
- Business Name: CREWW MOBILE AUTO DETAILING
- Service Territory: Mobile Auto Detailing across the United States (USA).
- Official Social Media: Only Instagram (@creww.mobile.autodetailing).
- Core Value: We come directly to your driveway, office parking, or garage with professional equipment.

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

CRITICAL SERVICE REQUIREMENTS (Must always emphasize when asked about requirements or booking):
- Access to WATER at the service location (outdoor spigot or garden hose connection).
- Access to ELECTRICITY at the service location (standard outdoor 120V outlet).
- Customers must provide a valid 5-digit US ZIP code to check route coverage.
- Customers must confirm both water and electricity availability with mandatory checkboxes in the booking form before scheduling.

BOOKING PROCESS:
- Customers can click any "BOOK YOUR SERVICE" button on the website to open the instant reservation popup.
- Select preferred package, date, 12-hour time slot, enter vehicle details (make, model, year), and address.
- Zero advance payment required; payment is completed after a personal walkthrough inspection upon service completion.

Rules:
- Never invent other services, add-ons, or custom prices not listed above.
- Always recommend the Full Detailing ($229) as the best value if a customer wants both inside and outside.
- Remind customers that water and electricity must be accessible at the vehicle location.
- If you do not know a piece of specific dispatch information, state that the dispatch team will confirm it upon appointment request.`;

// Predefined quick-fallback answers if API key is not configured or network fails
function getFallbackAnswer(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('how much')) {
    return "We offer 3 published packages with active special discounts:\n• Exterior Detailing: $169 (Regular $229, Save $60)\n• Interior Detailing: $189 (Regular $229, Save $40)\n• Full Interior & Exterior Detailing: $229 (Regular $299, Save $70 · Best Value!)\n\nZero hidden fees, with payment due after your post-detail walkthrough inspection!";
  }
  if (q.includes('service') || q.includes('package') || q.includes('offer')) {
    return "CREWW offers exactly three signature mobile packages:\n1. Exterior Detailing ($169): Foam hand wash, buffer wax, tire degreasing & wheel dressing, door jambs, microfiber drying.\n2. Interior Detailing ($189): Deep carpet/seat vacuuming, surface wipe & dressing, leather conditioning, stain shampooing, pet hair removal, streak-free glass.\n3. Full Detailing ($229): Combines all exterior and interior treatments!";
  }
  if (q.includes('include') || q.includes('what is included')) {
    return "Here is what's included:\n• Exterior: Pressure rinse, foam wash, buffer wax, wheel/tire degreasing & dressing, door jamb seals, microfiber towel drying.\n• Interior: Vacuuming carpets & seats, surface wipe-down & dressing, leather conditioning, stain shampooing, pet hair removal, interior windows.\n• Full Detailing includes all 14 treatments!";
  }
  if (q.includes('water') || q.includes('electric') || q.includes('need') || q.includes('require')) {
    return "Before our mobile crew arrives, please make sure your service location has access to:\n1. WATER: An accessible water source/spigot.\n2. ELECTRICITY: A standard 120V outdoor electrical outlet.\n\nBoth water and electricity confirmations are required when booking your appointment!";
  }
  if (q.includes('zip') || q.includes('area') || q.includes('location') || q.includes('where')) {
    return "We service metropolitan zones across the United States! You can enter your 5-digit US ZIP code in our 'IS CREWW AVAILABLE IN YOUR AREA?' checker right on the homepage to verify your route instantly.";
  }
  if (q.includes('book') || q.includes('schedule') || q.includes('appointment')) {
    return "Booking takes under 2 minutes! Just click 'BOOK YOUR SERVICE' anywhere on the page to open our instant reservation popup. Pick your date, time, and package—no advance deposit needed!";
  }
  return "Hey there! CREWW provides premium mobile car detailing right at your doorstep across the USA. We offer Exterior Detailing ($169), Interior Detailing ($189), and Full Detailing ($229 · Best Value). Just make sure you have water and electricity accessible at your vehicle location, and click 'BOOK YOUR SERVICE' to reserve your slot!";
}

// AI Assistant Chat Route
app.post('/api/ai-chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message text is required.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in the AI Studio Secrets panel.',
      });
      return;
    }

    // Format conversation history for Gemini API
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-8)) {
        if (item && typeof item.text === 'string' && item.text.trim()) {
          const role = item.role === 'model' || item.sender === 'assistant' ? 'model' : 'user';
          contents.push({
            role,
            parts: [{ text: item.text }],
          });
        }
      }
    }

    // Append current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Try gemini-3.1-flash-lite first for rapid high-throughput responses, fallback to gemini-3.8-flash if needed
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
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
        console.warn(`[AI Chat] Model ${model} encountered issue (${err?.status || err?.code}):`, err?.message || err);
      }
    }

    if (replyText) {
      res.json({ reply: replyText });
    } else {
      console.error('[AI Chat] All models failed:', lastError);
      res.status(502).json({
        error: lastError?.message || 'The AI detailing assistant encountered an error. Please try again.',
      });
    }
  } catch (error: any) {
    console.error('Error in /api/ai-chat:', error);
    res.status(500).json({ error: 'Failed to process AI chat request.' });
  }
});

// Setup Vite dev server middleware or serve production static assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`CREWW Server running on port ${PORT}`);
  });
}

startServer();
