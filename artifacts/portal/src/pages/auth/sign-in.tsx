import { SignIn } from "@clerk/react";
import AuthLayout, { authAppearance, basePath } from "./AuthLayout";

export default function SignInPage() {
  return (
    <AuthLayout
      heading="Access and Manage Your Account"
      promptText="Not enrolled yet?"
      promptLinkLabel="Create your account"
      promptLinkHref="/sign-up"
    >
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        appearance={authAppearance}
      />
    </AuthLayout>
  );
}
