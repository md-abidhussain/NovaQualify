'use client';

import dynamic from 'next/dynamic';

// Dynamically import the ChatInterface component with SSR disabled
const ChatInterface = dynamic(
  () => import('@/components/ChatInterface'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Agora Sales Assistant
        </h1>
        <ChatInterface />
      </div>
    </main>
  );
}
