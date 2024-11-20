"use client";

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
  const { isLoaded, user } = useUser(); // Clerk hook to fetch user data
  const router = useRouter(); // Next.js hook for navigation

  // Redirect authenticated users to role-based routes
  useEffect(() => {
    if (isLoaded && user) {
      const role = user?.publicMetadata?.role;
      if (role) {
        router.push(`/${role}`);
      }
    }
  }, [isLoaded, user, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
      {/* Display for signed-out users */}
      <SignedOut>
        <div className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-4 max-w-sm w-full">
          <h1 className="text-xl font-bold flex items-center justify-center gap-2">
            SchooLama
          </h1>
          <h2 className="text-gray-400 text-center">Sign in to your account</h2>
          <SignInButton mode="modal">
            <button className="bg-blue-500 text-white mt-4 rounded-md text-sm p-[10px] w-full">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      {/* Display for signed-in users */}
      <SignedIn>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome Back!</h1>
          <p className="text-gray-600 mt-2">You are signed in.</p>
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>
    </div>
  );
};
export default LoginPage;
