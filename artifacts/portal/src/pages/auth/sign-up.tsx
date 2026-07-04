import { SignUp } from "@clerk/react";
import AuthLayout, { authAppearance, basePath } from "./AuthLayout";

export default function SignUpPage() {
  return (
    <AuthLayout
      heading="Create your secure account"
      promptText="Already have an account?"
      promptLinkLabel="Sign in"
      promptLinkHref="/sign-in"
    >
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        appearance={authAppearance}
      />
    </AuthLayout>
  );
}
