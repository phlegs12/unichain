import Image from 'next/image'
import { CardContent } from '@/components/ui/card'
import execution from '@/assets/images/execution.webp'
import speed from '@/assets/images/speed.webp'

export default function Vision() {
  const visions = [
    {
      title: "Open Source Innovations for the Explorer Nodes",
      description: "Technical innovations introduced by Unichain are open source, and available for any rollup to adopt. Built on top of the EVM stack",
      alt: "Ethereum Logo",
      imageRight: true,
    },
    {
      title: "Internetwork Compatibility",
      description: "Harness the power of Solana's and major L2's high-performance blockchain for lightning-fast transactions and unparalleled scalability, perfect for building the next generation of decentralized finance applications.",
      alt: "Solana Logo",
      imageRight: false,
    },
    {
      title: "Cosmos Ecosystem",
      description: "Leverage the inter-blockchain communication protocol of Cosmos for seamless cross-chain transactions and interoperability, connecting multiple blockchain networks into a unified ecosystem.",
      alt: "Cosmos Logo",
      imageRight: true,
    },
  ]

  return (
    <section id="vision" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-5xl font-bold text-center mb-4 italic text-violet-600">Built for scalability</h2>
        <p className="text-2xl text-center mb-12 text-gray-600">A network of full nodes to monitor and verify transactions </p>
        <div className="space-y-24">
          {visions.map((vision, index) => (
            <div key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {!vision.imageRight && (
                    <div className="md:w-1/2 relative h-64 md:h-auto">
                      <Image
                        src={execution}
                        alt={vision.alt}
                        className="p-8"
                      />
                    </div>
                  )}
                  <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    <h3 className="text-3xl font-bold mb-4 text-center">{vision.title}</h3>
                    <p className="text-gray-600 text-2xl text-center">{vision.description}</p>
                  </div>
                  {vision.imageRight && (
                    <div className="md:w-1/2 relative h-64 md:h-auto">
                      <Image
                        src={speed}
                        alt={vision.alt}
                        className="p-8"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}