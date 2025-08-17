"use client";
   import { SignIn } from "@clerk/nextjs";

   export default function LoginPage() {
     return (
       <div className="min-h-screen flex items-center justify-center p-6">
         <div className="w-full max-w-md">
           <div className="mb-6 text-center">
             
           </div>
           <SignIn />
           
         </div>
       </div>
     );
   }