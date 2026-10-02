import bliss from "../assets/wallpaper.jpg";
import type { Wallpaper } from "../store/desktop";

export const WALLPAPER_IMAGES: Record<string, { label: string; url: string }> = {
  bliss: { label: "Bliss", url: bliss },
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
    const image = WALLPAPER_IMAGES[wallpaper.id] ?? WALLPAPER_IMAGES.bliss;
    return `#008080 url("${image.url}") center / cover no-repeat`;
  }
  return wallpaper.value;
}
