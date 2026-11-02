"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Forkert e-mail eller adgangskode." };
    }
    // signIn() redirecter via en NEXT_REDIRECT-kastet fejl ved succes —
    // den skal bubble videre, ikke fanges som login-fejl.
    throw error;
  }
}
