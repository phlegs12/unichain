// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// export default function ProfileContent() {
//   // This would typically come from your authentication state or API
//   const user = {
//     name: "Anonymous",
//     username: "anony_mous",
//     userId: "CRY-1x2cmem",
//     avatarUrl: "https://github.com/shadcn.png", // Replace with actual user avatar URL
//   }

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Profile Information</CardTitle>
//         </CardHeader>
//         <CardContent className="flex flex-col md:flex-row md:items-center md:space-x-4">
//           <Avatar className="h-24 w-24 mb-4 md:mb-0">
//             <AvatarImage src={user.avatarUrl} alt={user.name} />
//             <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
//           </Avatar>
//           <div>
//             <h2 className="text-2xl font-bold">{user.name}</h2>
//             <p className="text-sm text-gray-500">@{user.username}</p>
//             <p className="text-xs text-gray-400">User ID: {user.userId}</p>
//             <div className="mt-2 flex flex-wrap gap-2">
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }