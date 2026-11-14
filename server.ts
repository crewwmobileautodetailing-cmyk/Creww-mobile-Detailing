import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
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

// AI Assistant Chat Route
app.post('/api/ai-chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message text is required.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
      res.json({
        reply: "Welcome to **CREWW MOBILE AUTO DETAILING**! We bring mobile detailing right to your location.\n\nWe offer **Exterior Detailing ($169)**, **Interior Detailing ($189)**, and **Full Interior & Exterior Detailing ($229 · Best Value)**. Water and electricity are required at your location (or select **No** when booking for manual team verification). Click **'BOOK YOUR SERVICE'** to submit a request!",
        notice: 'Note: To enable generative AI model features, configure GEMINI_API_KEY in your environment variables.',
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

    // Low-latency primary model + capable fallback
    const attempts: Array<{ model: string; timeoutMs: number; thinkingLevel?: ThinkingLevel }> = [
      { model: 'gemini-3.1-flash-lite', timeoutMs: 8000, thinkingLevel: ThinkingLevel.MINIMAL },
      { model: 'gemini-4-hydrogen', timeoutMs: 10000, thinkingLevel: ThinkingLevel.LOW },
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
        console.warn(`[AI Chat] Model ${attempt.model} unavailable (${status}), falling back...`);
      }
    }

    if (replyText) {
      res.json({ reply: replyText });
    } else {
      console.warn('[AI Chat] AI models timed out or failed:', lastError);
      res.status(503).json({
        error: 'The AI concierge is temporarily busy. Please try again in a moment or click BOOK YOUR SERVICE to submit your request.',
      });
    }
  } catch (error: unknown) {
    console.error('Error in /api/ai-chat:', error);
    res.status(500).json({
      error: 'An unexpected error occurred while communicating with the AI service.',
    });
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
