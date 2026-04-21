import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useUsers } from "@/hooks/useUsers";

const tierStyles: Record<string, string> = {
  explorer: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  member: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
  gourmet: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200",
  expert: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
};

export function UsersPage() {
  const { data: users = [], isLoading, error } = useUsers();
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return users;

    return users.filter((user) => {
      return (
        user.display_name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.tier.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, users]);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-12 pt-28">
      <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(203,0,40,0.16),_transparent_35%),linear-gradient(135deg,_rgba(203,0,40,0.08),_transparent_55%)] px-6 py-8 sm:px-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-medium tracking-[0.2em] uppercase text-primary">
            <Users className="size-3.5" />
            Supabase
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Utilisateurs</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Cette page lit directement la table <code>public.users</code> via le client Supabase du front.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/85 px-4 py-3 text-right shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher par nom, email ou tier"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-border bg-card px-6 py-10 text-sm text-muted-foreground">
          Chargement des utilisateurs...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          Impossible de charger les utilisateurs : {error.message}
        </div>
      ) : null}

      {!isLoading && !error ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((user) => (
            <article
              key={user.id}
              className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold tracking-tight">{user.display_name}</p>
                  <p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>
                </div>

                <span
                  className={[
                    "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                    tierStyles[user.tier] ?? "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {user.tier}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-muted/70 px-3 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">XP</p>
                  <p className="mt-2 text-lg font-semibold">{user.xp_total}</p>
                </div>

                <div className="rounded-2xl bg-muted/70 px-3 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Créé le</p>
                  <p className="mt-2 text-sm font-medium">
                    {new Date(user.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!isLoading && !error && filteredUsers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
          Aucun utilisateur ne correspond à la recherche.
        </div>
      ) : null}
    </section>
  );
}
