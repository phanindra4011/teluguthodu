"use client";

import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 28, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2 select-none">
      <Image src="/logo.svg" alt="తెలుగు తోడు లোগో" width={size} height={size} priority />
      {withText && <span className="font-semibold tracking-tight">తెలుగు తోడు</span>}
    </Link>
  );
}

import type { SVGProps } from "react";

export function BotIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
