import type { ReactNode } from "react";
import { Reveal } from "./utils";

/** Shared gold section-eyebrow style: same color, font, size and weight everywhere. */
export const SECTION_EYEBROW_CLASS = "text-lg font-bold uppercase tracking-widest text-gms-gold";

/** Section eyebrow (small gold uppercase) + heading + subtitle. */
export function SectionHeader({
  eyebrow,
  title,
  sub,
  dark = false,
  align = "center",
  as: H = "h2",
  large = false,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  dark?: boolean;
  align?: "center" | "left";
  as?: "h1" | "h2";
  large?: boolean;
}) {
  const center = align === "center";
  return (
    <Reveal className={`${center ? "mx-auto text-center" : ""} max-w-3xl`}>
      <p className={SECTION_EYEBROW_CLASS}>{eyebrow}</p>
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
