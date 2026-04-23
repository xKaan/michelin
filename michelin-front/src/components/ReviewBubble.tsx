import { BadgeCheck } from "lucide-react";
import type { MapReviewBubble } from "@/hooks/useMapReviewBubbles";

interface Props {
  bubble: MapReviewBubble;
  avatarUrl: string;
  x: number;
  y: number;
  onClick: () => void;
}

export function ReviewBubble({ bubble, avatarUrl, x, y, onClick }: Props) {
  const text =
    bubble.content.length > 72
      ? bubble.content.slice(0, 72) + "…"
      : bubble.content;

  return (
    <button
      onClick={onClick}
      className="absolute pointer-events-auto -translate-x-1/2 group"
      style={{ left: x, top: y - 116 }}
      aria-label={`Avis de ${bubble.displayName}`}
    >
      <div className="relative drop-shadow-[0_6px_24px_rgba(0,0,0,0.16)] dark:drop-shadow-[0_6px_24px_rgba(0,0,0,0.40)]">

        {/* Card */}
        <div className={[
          "bg-background/90 backdrop-blur-2xl backdrop-saturate-[1.8]",
          "rounded-[20px] px-4 py-3 w-52 text-left",
          "transition-transform duration-100 ease-out group-active:scale-[0.96]",
          bubble.isCritic
            ? "ring-2 ring-primary/60"
            : "ring-1 ring-foreground/[0.06]",
        ].join(" ")}>

          {/* Avatar + name + badge */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className={[
              "shrink-0 rounded-full overflow-hidden",
              bubble.isCritic ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : "ring-2 ring-background",
            ].join(" ")}>
              <img
                src={avatarUrl}
                alt={bubble.displayName}
                className="size-9 object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-foreground truncate leading-tight tracking-[-0.01em]">
                  {bubble.displayName}
                </span>
                {bubble.isCritic && (
                  <BadgeCheck className="shrink-0 size-3.5 text-primary" />
                )}
                {!bubble.isCritic && bubble.isGourmet && (
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex gap-[2px]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      viewBox="0 0 20 20"
                      className={`size-2.5 ${i < bubble.rating ? "fill-primary" : "fill-foreground/[0.15]"}`}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {bubble.isCritic && (
                  <span className="text-[9px] font-semibold text-primary leading-none tracking-wide">
                    Critique vérifié
                  </span>
                )}
                {!bubble.isCritic && bubble.isGourmet && (
                  <span className="text-[9px] font-semibold text-primary leading-none tracking-wide">
                    Gourmet
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-foreground/[0.06] mb-2.5" />

          {/* Quote */}
          <p className="text-[11.5px] text-foreground/60 leading-[1.45] line-clamp-2">
            "{text}"
          </p>
        </div>

        {/* Arrow pointer */}
        <div className={[
          "absolute left-1/2 -translate-x-1/2 -bottom-[6px]",
          "size-3 rotate-45 rounded-br-[3px]",
          "bg-background/90",
          bubble.isCritic
            ? "border-r border-b border-primary/60"
            : "border-r border-b border-foreground/[0.06]",
        ].join(" ")} />
      </div>
    </button>
  );
}
