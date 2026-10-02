import type { ReactNode } from "react";
import { Reveal } from "./utils";

/** Section eyebrow (small gold uppercase) + heading + subtitle. */
export function SectionHeader({
  eyebrow,
  title,
  sub,
  dark = false,
  align = "center",
  as: H = "h2",
  accentLine = true,
  large = false,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  dark?: boolean;
  align?: "center" | "left";
  as?: "h1" | "h2";
  accentLine?: boolean;
  large?: boolean;
}) {
  const center = align === "center";
  return (
    <Reveal className={`${center ? "mx-auto text-center" : ""} max-w-3xl`}>
      <p
        className={`inline-flex items-center gap-2 font-bold uppercase tracking-[0.18em] ${large ? "text-lg" : "text-sm"} ${
          dark ? "text-gms-light" : "text-gms-gold"
        }`}
      >
        {accentLine && <span aria-hidden className="h-0.5 w-6 bg-gms-gold" />}
        {eyebrow}
      </p>
      <H
        className={`mt-3 font-display font-extrabold leading-tight tracking-tight ${large ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl"} ${
          dark ? "text-white" : "text-gms-corp"
        }`}
      >
        {title}
      </H>
      {sub && (
        <p className={`mt-4 leading-relaxed ${large ? "text-xl" : "text-lg"} ${dark ? "text-blue-100/80" : "text-slate-600"}`}>{sub}</p>
      )}
    </Reveal>
  );
}

/** Standard page-width container. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}
