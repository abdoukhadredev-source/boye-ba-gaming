"use client";

import { useActionState, type ReactNode } from "react";
import { KeyRound, LogIn } from "lucide-react";
import { changePasswordAction, loginAction, type ActionState } from "@/app/admin/actions";

export function ConfirmButton({
  action,
  message,
  className,
  children,
}: {
  action: () => Promise<void>;
  message: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      <button type="submit" className={className}>{children}</button>
    </form>
  );
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(loginAction, null);
  return (
    <form action={formAction} className="admin-login-form">
      <label className="admin-field">
        <span>Mot de passe administrateur</span>
        <input type="password" name="password" required autoComplete="current-password" autoFocus placeholder="••••••••" />
      </label>
      {state?.error && <p className="admin-alert admin-alert-error" role="alert">{state.error}</p>}
      <button type="submit" className="admin-btn admin-btn-red admin-btn-block" disabled={pending}>
        <LogIn size={17} aria-hidden="true" /> {pending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(changePasswordAction, null);
  return (
    <form action={formAction} className="admin-form">
      <label className="admin-field">
        <span>Mot de passe actuel</span>
        <input type="password" name="current" required autoComplete="current-password" />
      </label>
      <div className="admin-field-row">
        <label className="admin-field">
          <span>Nouveau mot de passe <small>(8 caractères min.)</small></span>
          <input type="password" name="next" required minLength={8} autoComplete="new-password" />
        </label>
        <label className="admin-field">
          <span>Confirmer</span>
          <input type="password" name="confirm" required minLength={8} autoComplete="new-password" />
        </label>
      </div>
      {state?.error && <p className="admin-alert admin-alert-error" role="alert">{state.error}</p>}
      {state?.success && <p className="admin-alert admin-alert-success" role="status">{state.success}</p>}
      <div className="admin-form-actions">
        <button type="submit" className="admin-btn admin-btn-red" disabled={pending}>
          <KeyRound size={16} aria-hidden="true" /> {pending ? "Mise à jour..." : "Mettre à jour le mot de passe"}
        </button>
      </div>
    </form>
  );
}
