// "use client";

// import * as Clerk from "@clerk/elements/common";
// import * as SignIn from "@clerk/elements/sign-in";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// const LoginPage = () => {
//   const { isLoaded, user } = useUser(); // Clerk hook to fetch user data
//   const router = useRouter(); // Next.js hook for navigation

//   useEffect(() => {
//     if (isLoaded && user) {
//       const role = user?.publicMetadata?.role;
//       if (role) {
//         router.push(`/${role}`); // Redirect based on the user's role
//       }
//     }
//   }, [isLoaded, user, router]); // Effect dependencies

//   // Render the login form when user is not loaded or not signed in
//   if (!isLoaded || !user) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
//         <SignIn.Root>
//           <SignIn.Step
//             name="start"
//             className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-4 max-w-sm w-full"
//           >
//             <h1 className="text-xl font-bold flex items-center justify-center gap-2">
//               SchooLama
//             </h1>
//             <h2 className="text-gray-400 text-center">
//               Sign in to your account
//             </h2>
//             <Clerk.GlobalError className="text-sm text-red-400 mt-2" />
//             <Clerk.Field name="identifier" className="flex flex-col gap-2">
//               <Clerk.Label className="text-xs text-gray-500">Username</Clerk.Label>
//               <Clerk.Input
//                 type="text"
//                 required
//                 className="p-2 rounded-md ring-1 ring-gray-300"
//               />
//               <Clerk.FieldError className="text-xs text-red-400" />
//             </Clerk.Field>
//             <Clerk.Field name="password" className="flex flex-col gap-2">
//               <Clerk.Label className="text-xs text-gray-500">Password</Clerk.Label>
//               <Clerk.Input
//                 type="password"
//                 required
//                 className="p-2 rounded-md ring-1 ring-gray-300"
//               />
//               <Clerk.FieldError className="text-xs text-red-400" />
//             </Clerk.Field>
//             <SignIn.Action
//               submit
//               className="bg-blue-500 text-white my-1 rounded-md text-sm p-[10px]"
//             >
//               Sign In
//             </SignIn.Action>
//           </SignIn.Step>
//         </SignIn.Root>
//       </div>
//     );
//   }

//   // Optionally, you can return a loading state or a skeleton while checking the user
//   return (
//     <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
//       <p>Loading...</p> {/* You can replace this with a skeleton loader */}
//     </div>
//   );
// };

// export default LoginPage;
