import { Button, Fieldset, RadioButton, Tab, Tabs } from "@react95/core";
import { WALLPAPER_COLORS, WALLPAPER_IMAGES, wallpaperCss } from "../data/wallpapers";
import { useDesktop, type IconSize } from "../store/desktop";

const SIZES: { value: IconSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

function DisplayProperties() {
  const { wallpaper, setWallpaper, iconSize, setIconSize, resetDesktop } = useDesktop();
  const isColor = (value: string) =>
    wallpaper.kind === "color" && wallpaper.value.toLowerCase() === value.toLowerCase();
  const customColor = wallpaper.kind === "color" ? wallpaper.value : "#008080";

  return (
    <Tabs defaultActiveTab="Background">
      <Tab title="Background">
        <div className="display-props">
          <div className="monitor" aria-hidden>
            <div className="monitor-screen" style={{ background: wallpaperCss(wallpaper) }} />
          </div>
          <Fieldset legend="Wallpaper">
            <ul className="pick-list" role="listbox">
              {Object.entries(WALLPAPER_IMAGES).map(([id, image]) => (
                <li key={id}>
                  <button
                    role="option"
                    aria-selected={wallpaper.kind === "image" && wallpaper.id === id}
                    onClick={() => setWallpaper({ kind: "image", id })}
                  >
                    {image.label}
                  </button>
                </li>
              ))}
              {WALLPAPER_COLORS.map((color) => (
                <li key={color.value}>
                  <button
                    role="option"
                    aria-selected={isColor(color.value)}
                    onClick={() => setWallpaper({ kind: "color", value: color.value })}
                  >
                    <span className="swatch" style={{ background: color.value }} />
                    {color.label}
                  </button>
                </li>
              ))}
            </ul>
            <label className="custom-color">
              Custom color:
              <input
                type="color"
                value={customColor}
                onChange={(e) => setWallpaper({ kind: "color", value: e.currentTarget.value })}
              />
            </label>
          </Fieldset>
        </div>
      </Tab>
      <Tab title="Appearance">
        <Fieldset legend="Desktop icon size">
          {SIZES.map((size) => (
            <RadioButton
              key={size.value}
              name="icon-size"
              checked={iconSize === size.value}
              onChange={() => setIconSize(size.value)}
            >
              {size.label}
            </RadioButton>
          ))}
        </Fieldset>
        <Fieldset legend="Reset">
          <p>Put every icon back, restore deleted ones, and bring back the default wallpaper.</p>
          <Button onClick={resetDesktop}>Restore defaults</Button>
        </Fieldset>
      </Tab>
    </Tabs>
  );
}

export default DisplayProperties;
