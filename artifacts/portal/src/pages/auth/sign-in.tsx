import { SignIn } from "@clerk/react";

export default function SignInPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background bg-noise relative overflow-hidden px-4">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="z-10 animate-in fade-in zoom-in-95 duration-500">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </div>
  );
}
