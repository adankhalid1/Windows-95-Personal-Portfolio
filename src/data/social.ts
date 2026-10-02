import type { Link } from "./profile";

/** Links that get their own Start menu entry, in this order. */
export const SOCIAL_KINDS = ["instagram", "tiktok", "linkedin", "github"] as const;
export type SocialKind = (typeof SOCIAL_KINDS)[number];

export const isSocial = (kind: Link["kind"]): kind is SocialKind =>
  (SOCIAL_KINDS as readonly string[]).includes(kind);
