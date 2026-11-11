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
        reply: "Welcome to **CREWW MOBILE AUTO DETAILING**! We bring premium mobile detailing right to your driveway across the USA.\n\nWe offer **Exterior Detailing ($169)**, **Interior Detailing ($189)**, and **Full Detailing ($229 · Best Value)** with payment due only after your post-service inspection. Click **'BOOK YOUR SERVICE'** to reserve your spot!",
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

    // Model selection with intelligent cascade prioritizing high-quota models
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
        console.warn(`[AI Chat] Model ${model} unavailable (${err?.status || 'network'}), attempting next model...`);
      }
    }

    if (replyText) {
      res.json({ reply: replyText });
    } else {
      console.warn('[AI Chat] All candidate models timed out or failed. Last error:', lastError);
      res.status(503).json({
        error: 'AI assistant is currently experiencing high demand. Please try again in a moment or click BOOK YOUR SERVICE.',
      });
    }
  } catch (error: any) {
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
