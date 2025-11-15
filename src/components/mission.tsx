import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ShieldCheck, Globe, Zap } from 'lucide-react'

export default function Mission() {
  const missions = [
    {
      icon: <ShieldCheck className="h-10 w-10 text-purple-600" />,
      title: "Security First",
      description: "Ensuring the highest level of security for all crypto transactions and assets."
    },
    {
      icon: <Globe className="h-10 w-10 text-purple-600" />,
      title: "Global Accessibility",
      description: "Making crypto solutions accessible to everyone, everywhere."
    },
    {
      icon: <Zap className="h-10 w-10 text-purple-600" />,
      title: "Innovation Driven",
      description: "Continuously pushing the boundaries of blockchain technology."
    }
  ]

  return (
    <section id="mission" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-5xl font-bold text-center text-violet-400 mb-6">Expanding <span className="italic text-violet-600">Universe</span></h2>
        <p className="mx-auto max-w-[700px] text-center text-2xl italic mb-6">Informed by our experience building the worlds largest decentralized solutions protocol.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {missions.map((mission, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {mission.icon}
                  <span className="text-2xl">{mission.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{mission.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}