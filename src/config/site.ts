// config/site.ts
export const siteConfig = {
  name: "Vardhan",
  tagline: "Creative developer crafting fast web experiences",
  description: "Senior web engineer specializing in modern web technologies and user experience",
  email: "vardhana1209@gmail.com",
  location: "San Francisco, CA",
  social: {
    linkedin: "https://www.linkedin.com/in/sri-vardhan-7b5853184/",
    github: "https://github.com/grammerpro",
    leetcode: "https://leetcode.com/u/sudovardhan/",
    twitter: "https://twitter.com/vardhan"
  }
};

// config/theme.ts
export const themeConfig = {
  colors: {
    primary: "#3b82f6", // Blue
    secondary: "#8b5cf6", // Purple
    accent: "#f59e0b", // Amber
    background: {
      primary: "#ffffff",
      secondary: "#f8fafc",
      gradient: "from-white via-blue-50 to-pink-50"
    },
    text: {
      primary: "#1f2937",
      secondary: "#6b7280",
      light: "#9ca3af"
    }
  },
  fonts: {
    heading: "Inter",
    body: "Inter"
  },
  spacing: {
    section: "py-20"
  }
};

// config/projects.ts
export const projectsConfig = [
  {
    id: 1,
    title: "E-Commerce Platform",
    category: "Web",
    description: "A modern e-commerce solution with React and Node.js featuring real-time inventory, payment processing, and admin dashboard.",
    image: "/placeholder-project1.jpg",
    tags: ["React", "Node.js", "MongoDB", "Stripe"],
    demo: "https://demo.example.com",
    github: "https://github.com/grammerpro/ecommerce"
  },
  {
    id: 2,
    title: "Data Visualization Dashboard",
    category: "Data",
    description: "Interactive dashboard for business analytics with real-time data processing and customizable charts.",
    image: "/placeholder-project2.jpg",
    tags: ["D3.js", "Python", "PostgreSQL", "FastAPI"],
    demo: "https://dashboard.example.com",
    github: "https://github.com/grammerpro/dashboard"
  },
  {
    id: 3,
    title: "Mobile Banking App",
    category: "UI",
    description: "User-friendly mobile banking interface with biometric authentication and seamless transaction experience.",
    image: "/placeholder-project3.jpg",
    tags: ["React Native", "Firebase", "TypeScript"],
    demo: "https://app.example.com",
    github: "https://github.com/grammerpro/banking-app"
  },
  {
    id: 4,
    title: "AI Chat Application",
    category: "Web",
    description: "Real-time chat application with AI integration, featuring voice messages and smart conversation summaries.",
    image: "/placeholder-project4.jpg",
    tags: ["Next.js", "OpenAI", "Socket.io", "Redis"],
    demo: "https://chat.example.com",
    github: "https://github.com/grammerpro/ai-chat"
  },
  {
    id: 5,
    title: "Portfolio Website",
    category: "Web",
    description: "Personal portfolio with Three.js animations, optimized performance, and modern design principles.",
    image: "/placeholder-project5.jpg",
    tags: ["Next.js", "Three.js", "Tailwind", "Framer Motion"],
    demo: "https://portfolio.example.com",
    github: "https://github.com/grammerpro/portfolio"
  }
];

// config/skills.ts
export const skillsConfig = [
  // Frontend
  "React", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS",
  // Backend
  "Node.js", "Python", "PostgreSQL", "MongoDB", "Redis", "GraphQL",
  // Tools & Technologies
  "Git", "Docker", "AWS", "Vercel", "Figma", "Three.js", "Framer Motion",
  // Mobile
  "React Native", "Expo"
];

// config/tools.ts
export const toolsConfig = [
  { name: "VS Code", logo: "💻", url: "https://code.visualstudio.com" },
  { name: "Figma", logo: "🎨", url: "https://figma.com" },
  { name: "GitHub", logo: "🐙", url: "https://github.com" },
  { name: "Vercel", logo: "▲", url: "https://vercel.com" },
  { name: "Notion", logo: "📝", url: "https://notion.so" },
  { name: "Linear", logo: "📊", url: "https://linear.app" }
];
