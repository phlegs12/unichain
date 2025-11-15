import '@/styles/globals.css';
import Image from 'next/image';
import logo from '@/assets/images/logo.webp';

export default function Hero() {
  return (
    <section className="min-h-[50vh] w-full py-12 md:py-16 lg:py-20 xl:py-24 flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black tracking-tighter">
              Decentralized <br className="md:hidden" />
              <span className="block text-blue-700">Platform Wallet</span>
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter">
              Revolutionizing Blockchain Solutions
            </h2>
          </div>
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            <Image 
              src={logo} 
              alt="logo image" 
              width={600} 
              height={500} 
              className="w-full h-auto object-contain" 
              priority 
            />
          </div>
        </div>
      </div>
    </section>
  );
}