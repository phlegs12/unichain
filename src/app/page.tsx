// app/page.tsx
import Hero from '@/components/hero';
import Features from '@/components/features';
import '@/styles/globals.css';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero /><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
      <Features />
    </main>
  );
}