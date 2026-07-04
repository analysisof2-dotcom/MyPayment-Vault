import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";

import LandingPage from "./pages/landing";
import SignInPage from "./pages/auth/sign-in";
import SignUpPage from "./pages/auth/sign-up";
import DashboardPage from "./pages/dashboard";
import NotFound from "./pages/not-found";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(184 57% 55%)",
    colorForeground: "hsl(180 33% 94%)",
    colorMutedForeground: "hsl(185 24% 75%)",
    colorDanger: "hsl(0 62% 60%)",
    colorBackground: "hsl(189 52% 15%)",
    colorInput: "hsl(189 48% 20%)",
    colorInputForeground: "hsl(180 33% 94%)",
    colorNeutral: "hsl(189 48% 20%)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "1rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-card rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl shadow-black/50 border border-border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-foreground font-bold text-2xl tracking-tight",
    headerSubtitle: "text-muted-foreground font-medium",
    socialButtonsBlockButtonText: "text-foreground font-semibold",
    formFieldLabel: "text-foreground font-semibold",
    footerActionLink: "text-primary hover:text-primary/90 font-semibold",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary hover:text-primary/90",
    formFieldSuccessText: "text-emerald-400",
    alertText: "text-foreground",
    logoBox: "mb-6 flex justify-center",
    logoImage: "w-10 h-10 text-primary",
    socialButtonsBlockButton: "bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-all rounded-xl h-11",
    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-xl transition-all shadow-lg hover:shadow-primary/25",
    formFieldInput: "bg-input border-border text-foreground h-11 rounded-xl focus:ring-2 focus:ring-primary/20",
    footerAction: "bg-transparent",
    dividerLine: "bg-border",
    alert: "bg-destructive/10 border-destructive/20 text-foreground",
    otpCodeFieldInput: "bg-input border-border text-foreground rounded-xl",
    formFieldRow: "mb-4",
    main: "flex flex-col gap-4",
  },
};

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function DashboardGuard() {
  return (
    <>
      <Show when="signed-in">
        <DashboardPage />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClientObj = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClientObj.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClientObj]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to access your secure portal",
          },
        },
        signUp: {
          start: {
            title: "Create your portal",
            subtitle: "Secure your access today",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/dashboard" component={DashboardGuard} />
          <Route component={NotFound} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
