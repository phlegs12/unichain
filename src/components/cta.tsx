import { Button } from '@/components/ui/button'

export default function CTA() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">If you have a problem, let us take care of it</h2>
          <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Join thousands of satisfied users and experience the future of finance today.
          </p>
          <div className="space-x-4">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Get Started Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}


