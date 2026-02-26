// Chatbot configuration with knowledge base about Vardhan
export const chatbotConfig = {
    greeting: "Hi there! 👋 I'm Vardhan's virtual assistant. Ask me anything about him!",

    // Suggested quick questions
    suggestions: [
        "What technologies do you know?",
        "How many years of experience?",
        "What are your strengths?",
        "Tell me about yourself",
        "What projects have you worked on?",
    ],

    // Knowledge base - keywords map to answers
    knowledgeBase: [
        {
            keywords: ["technology", "technologies", "tech", "stack", "skills", "know", "programming", "languages", "frameworks"],
            answer: "I'm proficient in a wide range of technologies! 🚀\n\n**Frontend:** React, Next.js, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Framer Motion\n\n**Backend:** Node.js, Python, PostgreSQL, MongoDB, Redis, GraphQL\n\n**Tools:** Git, Docker, AWS, Vercel, Figma, Three.js\n\n**Mobile:** React Native, Expo"
        },
        {
            keywords: ["experience", "years", "work", "working", "career", "professional"],
            answer: "I have several years of experience as a Senior Web Engineer! 💼\n\nI specialize in building modern web applications with a focus on:\n• Performance optimization\n• User experience design\n• Scalable architecture\n• Clean, maintainable code\n\nI've worked on e-commerce platforms, data visualization dashboards, mobile banking apps, and AI-powered applications."
        },
        {
            keywords: ["strength", "strengths", "good at", "best", "excel"],
            answer: "Here are my key strengths! 💪\n\n✅ **Problem Solving** - I love tackling complex challenges and finding elegant solutions\n\n✅ **Fast Learner** - I quickly adapt to new technologies and frameworks\n\n✅ **Attention to Detail** - I care about the little things that make great UX\n\n✅ **Communication** - I can explain technical concepts clearly\n\n✅ **Team Player** - I collaborate effectively with designers, PMs, and other devs"
        },
        {
            keywords: ["weakness", "weaknesses", "improve", "working on", "challenge"],
            answer: "I believe in continuous improvement! 🌱\n\n📌 **Perfectionism** - Sometimes I spend too much time polishing details. I'm learning to balance quality with deadlines.\n\n📌 **Saying No** - I'm enthusiastic about new projects and learning to prioritize better.\n\n📌 **Documentation** - I'm actively improving my documentation habits to help future developers."
        },
        {
            keywords: ["about", "yourself", "who", "introduction", "bio", "background"],
            answer: "Hi! I'm Vardhan! 👋\n\nI'm a Creative Developer, Designer, and Engineer based in San Francisco. I craft digital experiences at the intersection of design and technology.\n\nI'm passionate about building interfaces that feel alive - with smooth animations, intuitive interactions, and attention to detail.\n\nWhen I'm not coding, you'll find me exploring new technologies, contributing to open source, or working on side projects!"
        },
        {
            keywords: ["project", "projects", "portfolio", "work", "built", "created"],
            answer: "I've worked on some exciting projects! 🎨\n\n🛒 **E-Commerce Platform** - Modern solution with React, Node.js, real-time inventory\n\n📊 **Data Visualization Dashboard** - Interactive analytics with D3.js, Python\n\n💳 **Mobile Banking App** - React Native app with biometric auth\n\n🤖 **AI Chat Application** - Real-time chat with OpenAI integration\n\n🌐 **Portfolio Website** - This very site with Three.js & Framer Motion!\n\nCheck out the Projects section for more details!"
        },
        {
            keywords: ["contact", "email", "reach", "hire", "available", "work together", "job", "opportunity", "opportunities", "open to", "looking for", "last working", "notice period", "start", "join", "when can you"],
            answer: "I'd love to hear from you! 📬\n\n📧 **Email:** vardhana1209@gmail.com\n\n💼 **LinkedIn:** linkedin.com/in/sri-vardhan-7b5853184\n\n🐙 **GitHub:** github.com/grammerpro\n\n✅ I'm currently **available for new projects**! Feel free to reach out to discuss opportunities.\n\n👇 You can also use the **Contact form** below to send me a message directly!"
        },
        {
            keywords: ["visa", "status", "authorization", "sponsor", "sponsorship", "work permit", "green card", "h1b", "h1-b", "citizen", "citizenship"],
            answer: "Regarding work authorization: 📋\n\nI'm legally authorized to work and open to discussing specific requirements for your opportunity.\n\n📧 For detailed visa/authorization questions, please reach out directly at **vardhana1209@gmail.com** or use the Contact form below!\n\n👇 Let's discuss the specifics for your role!"
        },
        {
            keywords: ["salary", "rate", "compensation", "pay", "hourly", "expect", "expectation", "budget", "cost"],
            answer: "Great question about compensation! 💰\n\nMy rates are flexible and depend on:\n• Project scope and complexity\n• Timeline and duration\n• Full-time vs contract\n• Remote vs on-site\n\n📧 Let's discuss specifics! Reach out at **vardhana1209@gmail.com** or use the Contact form below.\n\n👇 I'm happy to work within reasonable budgets!"
        },
        {
            keywords: ["education", "degree", "university", "study", "school", "learn"],
            answer: "I have a strong educational background! 🎓\n\nI hold a degree in Computer Science and have continuously expanded my knowledge through:\n\n📚 Online courses and certifications\n💻 Hands-on project experience\n🌐 Open source contributions\n📖 Technical books and documentation\n\nI believe learning never stops in tech!"
        },
        {
            keywords: ["hobby", "hobbies", "free time", "fun", "interests", "outside work"],
            answer: "Outside of coding, I enjoy! 🎯\n\n🎮 Gaming and exploring game development\n📚 Reading tech blogs and books\n🎨 UI/UX design exploration\n🌍 Travel and photography\n☕ Coffee and good conversations\n🎵 Music while coding\n\nI believe hobbies make us better developers!"
        },
        {
            keywords: ["remote", "location", "where", "based", "office", "timezone", "relocate", "relocation"],
            answer: "I'm based in San Francisco, CA! 🌉\n\nI'm experienced with remote work and comfortable collaborating across different timezones. I have a professional home office setup and excellent communication tools.\n\nOpen to both remote, hybrid, and relocation opportunities!"
        },
        {
            keywords: ["hello", "hi", "hey", "greetings", "sup"],
            answer: "Hey there! 👋 Great to meet you! I'm Vardhan's virtual assistant. Ask me anything about his skills, experience, or projects. What would you like to know?"
        },
        {
            keywords: ["thanks", "thank", "appreciate", "helpful", "great"],
            answer: "You're welcome! 😊 Happy to help! If you have more questions, feel free to ask. You can also reach out to Vardhan directly at vardhana1209@gmail.com!"
        },
        {
            keywords: ["interview", "meet", "call", "schedule", "chat", "discuss", "talk"],
            answer: "I'd love to connect! 📞\n\nYou can reach me through:\n\n📧 **Email:** vardhana1209@gmail.com\n💼 **LinkedIn:** linkedin.com/in/sri-vardhan-7b5853184\n\n👇 Or simply fill out the **Contact form** below and I'll get back to you within 24 hours!\n\nLooking forward to chatting!"
        }
    ],

    // Default response when no match found - with contact form redirect
    defaultResponse: "I'm not sure about that specific question! 🤔\n\nTry asking about:\n• Technologies & skills\n• Years of experience\n• Availability & work authorization\n• Strengths & weaknesses\n• Projects I've built\n\n💬 **For specific questions**, feel free to drop your message in the Contact form below - Vardhan will personally respond!\n\n[CONTACT_BUTTON]"
};

// Function to find the best matching answer
export function findAnswer(question: string): string {
    const lowerQuestion = question.toLowerCase();

    for (const item of chatbotConfig.knowledgeBase) {
        for (const keyword of item.keywords) {
            if (lowerQuestion.includes(keyword)) {
                return item.answer;
            }
        }
    }

    return chatbotConfig.defaultResponse;
}
