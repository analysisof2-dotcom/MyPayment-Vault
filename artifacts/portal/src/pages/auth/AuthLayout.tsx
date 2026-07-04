import { ReactNode } from "react";
import { Link } from "wouter";
import { Globe, ShieldCheck } from "lucide-react";
import panelImage from "@assets/generated_images/safeport_login_panel.png";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export const authAppearance = {
  variables: {
    colorPrimary: "hsl(200 12% 12%)",
    colorPrimaryForeground: "hsl(0 0% 100%)",
    colorForeground: "hsl(200 12% 12%)",
    colorMutedForeground: "hsl(215 16% 47%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(0 0% 100%)",
    colorInputForeground: "hsl(200 12% 12%)",
    colorNeutral: "hsl(200 12% 12%)",
    colorDanger: "hsl(0 72% 51%)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.375rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "!shadow-none !border-0 !bg-transparent !rounded-none w-full max-w-full",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none !p-0 !gap-4",
    header: "!hidden",
    headerTitle: "!hidden",
    headerSubtitle: "!hidden",
    logoBox: "!hidden",
    logoImage: "!hidden",
    main: "flex flex-col gap-4",
    footer: "!hidden",
    dividerText: "text-slate-400",
    dividerLine: "bg-slate-200",
    formFieldLabel: "text-slate-700 font-semibold",
    formFieldInput:
      "bg-white border-slate-300 text-slate-900 h-11 rounded-md focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400",
    formButtonPrimary:
      "bg-slate-900 hover:bg-slate-800 text-white font-semibold h-11 rounded-md transition-colors shadow-none normal-case tracking-normal",
    socialButtonsBlockButton:
      "bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 transition-colors rounded-md h-11",
    socialButtonsBlockButtonText: "text-slate-800 font-medium",
    formFieldInputShowPasswordButton: "text-slate-400 hover:text-slate-600",
    identityPreviewEditButton: "text-slate-900 hover:text-slate-700",
    formFieldSuccessText: "text-emerald-600",
    formFieldErrorText: "text-red-600",
  },
};

interface AuthLayoutProps {
  heading: string;
  promptText: string;
  promptLinkLabel: string;
  promptLinkHref: string;
  children: ReactNode;
}

export default function AuthLayout({
  heading,
  promptText,
  promptLinkLabel,
  promptLinkHref,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-100">
      <div className="flex-1 w-full max-w-6xl mx-auto flex items-center justify-center p-4 sm:p-8">
        <div className="w-full grid lg:grid-cols-2 bg-white rounded-xl shadow-xl shadow-slate-300/40 overflow-hidden border border-slate-200">
          {/* Left: form column */}
          <div className="relative flex flex-col p-8 sm:p-12">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-900"
              >
                <ShieldCheck className="w-6 h-6 text-teal-600" />
                <span className="font-extrabold tracking-tight text-lg">
                  SAFE<span className="font-medium">PORT</span>
                </span>
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-600">
                <Globe className="w-4 h-4" />
                English
              </span>
            </div>

            <div className="mt-10 sm:mt-12">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {heading}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {promptText}{" "}
                <Link
                  href={promptLinkHref}
                  className="font-semibold text-slate-900 underline underline-offset-2 hover:text-slate-700"
                >
                  {promptLinkLabel}
                </Link>
              </p>
            </div>

            <div className="mt-8 flex-1">{children}</div>
          </div>

          {/* Right: image panel */}
          <div className="relative hidden lg:block bg-slate-950">
            <img
              src={panelImage}
              alt="Secure account access"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      <footer className="w-full max-w-6xl mx-auto px-8 pb-6 text-center lg:text-right">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} SafePort · Terms of Use · Privacy and
          Cookies
        </p>
      </footer>
    </div>
  );
}

export { basePath };
