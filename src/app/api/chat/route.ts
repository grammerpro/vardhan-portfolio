import { NextRequest, NextResponse } from 'next/server';

// System prompt that gives Gemini context about Vardhan
const SYSTEM_PROMPT = `You are Vardhan's virtual assistant on his portfolio website. You help visitors learn about Vardhan.

Here is information about Vardhan:

**About:**
- Name: Vardhan (Sri Vardhan)
- Role: Creative Developer, Designer, and Engineer
- Location: San Francisco, CA
- Email: vardhana1209@gmail.com
- LinkedIn: linkedin.com/in/sri-vardhan-7b5853184
- GitHub: github.com/grammerpro

**Technical Skills:**
- Frontend: React, Next.js, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Framer Motion, Three.js
- Backend: Node.js, Python, PostgreSQL, MongoDB, Redis, GraphQL
- Tools: Git, Docker, AWS, Vercel, Figma
- Mobile: React Native, Expo

**Experience:**
- Several years as a Senior Web Engineer
- Specializes in modern web applications, performance optimization, user experience design
- Built e-commerce platforms, data visualization dashboards, mobile banking apps, AI-powered applications

**Availability:**
- Currently available for new projects and opportunities
- Open to remote, hybrid, and relocation opportunities
- Comfortable with different timezones

**Strengths:**
- Problem solving, fast learner, attention to detail, communication, team player

**For interview/visa/salary questions:**
- Encourage them to reach out directly via email or the contact form for specific discussions

Keep responses friendly, professional, and concise (under 150 words). Use emojis sparingly. If asked something you don't know about Vardhan, suggest they use the contact form to ask directly.`;

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Call Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: `${SYSTEM_PROMPT}\n\nVisitor's question: ${message}\n\nRespond as Vardhan's virtual assistant:`
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 500,
                    },
                    safetySettings: [
                        {
                            category: 'HARM_CATEGORY_HARASSMENT',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        },
                        {
                            category: 'HARM_CATEGORY_HATE_SPEECH',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        },
                        {
                            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        },
                        {
                            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        }
                    ]
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Gemini API error:', errorData);
            return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
        }

        const data = await response.json();

        // Extract the text from Gemini's response
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I'm having trouble processing that question right now. Please try again or use the contact form below!";

        return NextResponse.json({ response: aiResponse });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
