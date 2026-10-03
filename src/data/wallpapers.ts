import bliss from "../assets/wallpaper.webp";
import type { Wallpaper } from "../store/desktop";

// A tiled pattern of little four-color Windows flags on navy, like the
// patterns Windows 3.1 and 95 shipped with.
const flagTile = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" shape-rendering="crispEdges">' +
    '<rect width="48" height="48" fill="#000080"/>' +
    '<rect x="16" y="16" width="7" height="6" fill="#ff2a1a"/><rect x="24" y="16" width="7" height="6" fill="#22c322"/>' +
    '<rect x="16" y="23" width="7" height="6" fill="#2a5cff"/><rect x="24" y="23" width="7" height="6" fill="#ffd21a"/>' +
    "</svg>",
)}")`;

export const WALLPAPER_IMAGES: Record<
  string,
  { label: string; css: string; /** Only listed once this easter egg is found. */ secret?: string }
> = {
  bliss: { label: "Bliss", css: `#008080 url("${bliss}") center / cover no-repeat` },
  cheat: { label: "Cheat Mode", css: `${flagTile} 0 0 / 48px 48px repeat, #000080`, secret: "konami" },
};

export const WALLPAPER_COLORS: { label: string; value: string }[] = [
  { label: "Teal (classic)", value: "#008080" },
  { label: "Navy", value: "#000080" },
  { label: "Plum", value: "#5c2d5c" },
  { label: "Forest", value: "#2d5c2d" },
  { label: "Maroon", value: "#800000" },
  { label: "Black", value: "#000000" },
];

export function wallpaperCss(wallpaper: Wallpaper): string {
  if (wallpaper.kind === "image") {
    return (WALLPAPER_IMAGES[wallpaper.id] ?? WALLPAPER_IMAGES.bliss).css;
  }
  return wallpaper.value;
}
