// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
// import Image from 'next/image'

// export default function Feedback() {
//   const testimonials = [
//     { 
//       name: "Alice Johnson", 
//       role: "Crypto Investor", 
//       content: "Unichain has revolutionized the way I manage my digital assets. Their security features are unparalleled.", 
//       avatar: "https://masterpiecer-images.s3.yandex.net/004894523f2111ee8a764659bdca6a39:upscaled" 
//     },
//     { 
//       name: "Bob Smith", 
//       role: "Blockchain Developer", 
//       content: "As a developer, I appreciate the robust API and developer tools provided by Unichain. It's a game-changer.", 
//       avatar: "https://pics.craiyon.com/2023-08-02/04c617f98f064ab6820edd70bb5819b8.webp" 
//     },
//     { 
//       name: "Carol Williams", 
//       role: "Financial Advisor", 
//       content: "I recommend Unichain to all my clients. It's user-friendly and offers comprehensive market insights.", 
//       avatar: "https://preview.redd.it/youtube-avatar-advice-v0-nzyfuumjlkjb1.png?width=640&crop=smart&auto=webp&s=58f4301e4bb70d8037467bad72a80c88d5565563" 
//     },
//   ]

//   return (
//     <section id="feedback" className="w-full py-12 md:py-24 lg:py-32 bg-purple-50">
//       <div className="container mx-auto px-4 md:px-6">
//         <h2 className="text-5xl font-bold text-center mb-12 text-violet-600">Client Feedback</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {testimonials.map((testimonial, index) => (
//             <Card key={index} className="h-full">
//               <CardHeader>
//                 <CardTitle className="flex items-center space-x-2">
//                   <Image
//                     src={testimonial.avatar}
//                     alt={testimonial.name}
//                     width={50}
//                     height={50}
//                     className="rounded-full"
//                   />
//                   <div>
//                     <h3 className="text-lg font-semibold">{testimonial.name}</h3>
//                     <p className="text-sm text-gray-500">{testimonial.role}</p>
//                   </div>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="italic">&quot;{testimonial.content}&quot;</p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }