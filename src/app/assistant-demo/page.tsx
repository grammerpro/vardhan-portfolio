/**
 * Demo page for the Resume Assistant Widget
 * Showcases the browser-based AI assistant functionality
 */

import { Metadata } from 'next';
import ResumeAssistant from '../../components/ResumeAssistant';

export const metadata: Metadata = {
  title: 'Resume Assistant Demo | Vardhan Portfolio',
  description: 'Interactive demo of the AI-powered resume assistant widget',
};

export default function AssistantDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Resume Assistant Demo
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            Experience our AI-powered resume assistant that answers questions about professional experience,
            skills, and background using advanced natural language processing.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Natural Conversations
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Ask questions in natural language and get contextual answers about experience, skills, and projects.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Browser-Based AI
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Runs entirely in the browser using Transformers.js - no server required, ensuring privacy and speed.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Voice Features
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Optional voice synthesis and speech recognition for hands-free interaction.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Smart Citations
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Answers include citations linking back to specific sections of the resume for verification.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Mobile Responsive
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Fully responsive design that works seamlessly across desktop, tablet, and mobile devices.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Privacy First
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              All processing happens locally in the browser - no data is sent to external servers.
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Try the Assistant
          </h2>
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Sample Questions to Try:
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• &quot;What are your top technical skills?&quot;</li>
                <li>• &quot;Tell me about your experience with React&quot;</li>
                <li>• &quot;What projects have you worked on recently?&quot;</li>
                <li>• &quot;How can I contact you?&quot;</li>
              </ul>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• &quot;What is your educational background?&quot;</li>
                <li>• &quot;Do you have experience with cloud platforms?&quot;</li>
                <li>• &quot;What are your career goals?&quot;</li>
                <li>• &quot;Tell me about your leadership experience&quot;</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Click the floating assistant button in the bottom-right corner to start chatting!
            </p>
            <div className="inline-flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>The assistant may take a moment to load the AI model on first use</span>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Technical Implementation
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Frontend Technologies
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>TypeScript:</strong> Type-safe development</li>
                <li><strong>Transformers.js:</strong> Browser-based ML inference</li>
                <li><strong>BM25 Algorithm:</strong> Efficient text search</li>
                <li><strong>Cosine Similarity:</strong> Semantic matching</li>
                <li><strong>Web Speech API:</strong> Voice features</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Key Features
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>RAG Pipeline:</strong> Retrieval-Augmented Generation</li>
                <li><strong>Local Processing:</strong> Privacy-preserving</li>
                <li><strong>Glassmorphism UI:</strong> Modern design</li>
                <li><strong>Responsive Design:</strong> Mobile-first approach</li>
                <li><strong>Accessibility:</strong> WCAG compliant</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Assistant Widget */}
      <ResumeAssistant
        config={{
          displayName: 'Vardhan',
          avatarUrl: '/assets/avatar.png',
          position: { bottom: 24, right: 24 },
          theme: 'auto',
          enableVoice: true,
          resumeUrl: '/data/resume.md'
        }}
      />
    </div>
  );
}
