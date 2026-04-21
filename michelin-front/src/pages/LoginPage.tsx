import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import { useAuth, useSignIn } from "@/hooks/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const signIn = useSignIn();
  const [email, setEmail] = useState("lea.martin.seed@michelin-local.test");
  const [password, setPassword] = useState("SeedUser!2026");

  useEffect(() => {
    if (user) navigate("/social", { replace: true });
  }, [navigate, user]);

  if (!loading && user) {
    return <Navigate to="/social" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await signIn.mutateAsync({ email, password });
  };

  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center px-4 pb-10 pt-28">
      <div className="absolute inset-x-0 top-24 -z-10 h-64 bg-[radial-gradient(circle_at_top,_rgba(203,0,40,0.14),_transparent_55%)]" />

      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm sm:p-10">
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
            Supabase Auth
          </span>
          <h1 className="mt-6 max-w-md text-4xl font-semibold tracking-tight">
            Connecte-toi pour tester les comptes seedes.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            Cette page utilise directement <code>supabase.auth.signInWithPassword</code>. Les profils affiches
            ensuite sont lus depuis <code>public.users</code>.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-muted/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Compte</p>
              <p className="mt-2 text-sm font-medium">5 users seedes</p>
            </div>
            <div className="rounded-2xl bg-muted/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Auth</p>
              <p className="mt-2 text-sm font-medium">Email / mot de passe</p>
            </div>
            <div className="rounded-2xl bg-muted/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Redirection</p>
              <p className="mt-2 text-sm font-medium">Liste utilisateurs</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm sm:p-10">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                placeholder="email@exemple.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                placeholder="Mot de passe"
                required
              />
            </div>

            {signIn.error ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {signIn.error.message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={signIn.isPending}
              className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {signIn.isPending ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
            Compte de test prerempli :
            <div className="mt-2 font-medium text-foreground">lea.martin.seed@michelin-local.test</div>
            <div className="font-medium text-foreground">SeedUser!2026</div>
          </div>
        </div>
      </div>
    </section>
  );
}
