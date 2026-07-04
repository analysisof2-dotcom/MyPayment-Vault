import { Link } from "wouter";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background bg-noise overflow-hidden relative">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="px-6 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 text-primary">
          <Shield className="w-8 h-8" />
          <span className="font-bold text-xl tracking-tight text-foreground">SafePort</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
            Sign In
          </Link>
          <Link href="/sign-up" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            Create Account
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center flex-col text-center px-4 z-20 relative">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Security you can <span className="text-primary">relax into.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 animate-delay-100 fill-mode-both">
            A beautiful, calm space for managing your account. We handle the complexity of authentication so you can focus on what matters.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 animate-delay-200 fill-mode-both">
            <Link href="/sign-up" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-primary/25 w-full sm:w-auto">
              Get Started Securely
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground z-20">
        <p>Built with precision and care.</p>
      </footer>
    </div>
  );
}
