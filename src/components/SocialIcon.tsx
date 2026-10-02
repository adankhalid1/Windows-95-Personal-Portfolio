import { FaGithub, FaInstagram, FaLinkedinIn, FaTiktok } from "react-icons/fa";
import type { SocialKind } from "../data/social";

// App-style tiles in each brand's colors, sized like the Start menu's 32px icons.
const TILES: Record<SocialKind, { Glyph: typeof FaGithub; className: string }> = {
  instagram: { Glyph: FaInstagram, className: "social-instagram" },
  tiktok: { Glyph: FaTiktok, className: "social-tiktok" },
  linkedin: { Glyph: FaLinkedinIn, className: "social-linkedin" },
  github: { Glyph: FaGithub, className: "social-github" },
};

function SocialIcon({ kind }: { kind: SocialKind }) {
  const { Glyph, className } = TILES[kind];
  return (
    <span className={`social-icon ${className}`} aria-hidden>
      <Glyph />
    </span>
  );
}

export default SocialIcon;
