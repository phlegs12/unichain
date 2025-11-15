// import { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

// export default function SupportContent() {
//   const [isChatOpen, setIsChatOpen] = useState(false)
//   const [message, setMessage] = useState('')

//   const toggleChat = () => setIsChatOpen(!isChatOpen)

//   const sendMessage = (e: React.FormEvent) => {
//     e.preventDefault()
//     console.log('Sending message:', message)
//     setMessage('')
//     // Implement actual message sending functionality here
//   }

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">Support</h2>
//       {!isChatOpen ? (
//         <Button onClick={toggleChat}>Open Support Chat</Button>
//       ) : (
//         <Card className="w-full max-w-md">
//           <CardHeader>
//             <CardTitle>Support Chat</CardTitle>
//           </CardHeader>
//           <CardContent className="h-64 overflow-y-auto">
//             {/* Chat messages would be displayed here */}
//             <p className="text-gray-500 text-center">No messages yet</p>
//           </CardContent>
//           <CardFooter>
//             <form onSubmit={sendMessage} className="flex w-full space-x-2">
//               <Input
//                 type="text"
//                 placeholder="Type your message..."
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 className="flex-grow"
//               />
//               <Button type="submit">Send</Button>
//             </form>
//           </CardFooter>
//         </Card>
//       )}
//     </div>
//   )
// }