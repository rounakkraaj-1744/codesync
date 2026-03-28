import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'gsk_...', // Replace with actual key in .env
});

export async function POST(req: NextRequest) {
  try {
    const { message, code, language, mode } = await req.json();

    const systemPrompt = `You are a world-class coding assistant called CodeSync AI. 
Current environment:
- Language: ${language}
- Mode: ${mode}

Instructions:
- If in Interview Mode, act as an interviewer. Don't give answers directly, but nudge the user.
- Provide clear, concise explanations and code snippets.
- Use markdown formatting.
- Be highly professional and encouraging.

Current Code Context:
\`\`\`${language}
${code}
\`\`\``;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.2,
      max_tokens: 1024,
      stream: false, // Start simple for MVP
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || 'I am sorry, I could not generate a response.';

    return NextResponse.json({ message: responseContent });
  } catch (error: any) {
    console.error('AI Error:', error.message);
    return NextResponse.json({ error: 'AI failed to process your request' }, { status: 500 });
  }
}
