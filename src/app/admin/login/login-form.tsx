"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldGroup, FieldError } from "@/components/ui/field";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="space-y-5">
      <FieldGroup>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="password">Adgangskode</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </FieldGroup>
      {state?.error ? <FieldError>{state.error}</FieldError> : null}
      <Button type="submit" className="w-full" disabled={pending} size="lg">
        {pending ? "Logger ind..." : "Log ind"}
      </Button>
    </form>
  );
}
