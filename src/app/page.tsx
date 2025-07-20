import HeroKeyboard from '@/components/HeroKeyboard';


export default function HomePage() {
  return (
    <main className="w-full">
      

      {/* New Section below */}
      <section className="w-full bg-gray-50 text-gray-900 py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About Me</h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            I'm Vardhan, a full-stack developer passionate about building visually
            appealing, highly functional web applications. My work blends clean code
            with impactful UI/UX — from concept to launch.
          </p>
        </div>
      </section>
      <HeroKeyboard />
    </main>
  );
}



