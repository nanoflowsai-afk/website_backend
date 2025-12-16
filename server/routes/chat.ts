import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const WEBSITE_CONTEXT = `You are NanoFlows AI Assistant — the official virtual representative for NanoFlows AI Software Technologies. You are professional, knowledgeable, and helpful.`;

router.post("/", async (req, res) => {
  try {
    const message = req.body?.message;
    if (!message || typeof message !== "string") return res.status(400).json({ error: "Message is required" });

    if (!process.env.OPENAI_API_KEY) {
      return res.json({ response: "I'm currently unavailable. Please contact us directly or try again later." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: WEBSITE_CONTEXT },
        { role: "user", content: message },
      ],
      max_completion_tokens: 500,
    });

    const responseText = completion.choices?.[0]?.message?.content || "I couldn't generate a response.";
    res.json({ response: responseText });
  } catch (err) {
    console.error("Chat API error:", err);
    res.json({ response: "I'm having trouble processing your request. Please try again later." });
  }
});

export default router;
