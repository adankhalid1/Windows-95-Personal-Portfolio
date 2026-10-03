import { Button, Fieldset, RadioButton, Tab, Tabs } from "@react95/core";
import { WALLPAPER_COLORS, WALLPAPER_IMAGES, wallpaperCss } from "../data/wallpapers";
import { useDesktop, type IconSize, type ScreensaverKind } from "../store/desktop";
import { restoreDefaults } from "../store/restoreDefaults";
import { useSecrets } from "../store/secrets";
import { useUi } from "../store/ui";

const SAVERS: { value: ScreensaverKind; label: string }[] = [
  { value: "flying", label: "Flying Windows" },
  { value: "starfield", label: "Starfield" },
  { value: "mystify", label: "Mystify" },
  { value: "matrix", label: "The Matrix" },
  { value: "none", label: "(None)" },
];

const SIZES: { value: IconSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

function DisplayProperties() {
  const { wallpaper, setWallpaper, iconSize, setIconSize } = useDesktop();
  const { screensaver, screensaverWait, setScreensaver } = useDesktop();
  const setScreensaverNow = useUi((s) => s.setScreensaverNow);
  const found = useSecrets((s) => s.found);
  // Secret screensavers and wallpapers only show up once they've been found.
  const savers = SAVERS.filter((o) => o.value !== "matrix" || found.includes("matrix") || screensaver === "matrix");
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
              {Object.entries(WALLPAPER_IMAGES)
                .filter(([id, image]) => !image.secret || found.includes(image.secret) || (wallpaper.kind === "image" && wallpaper.id === id))
                .map(([id, image]) => (
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
      <Tab title="Screen Saver">
        <div className="display-props">
          <div className="monitor" aria-hidden>
            <div className={`monitor-screen saver-${screensaver}`} />
          </div>
          <Fieldset legend="Screen saver">
            {savers.map((option) => (
              <RadioButton
                key={option.value}
                name="screensaver"
                checked={screensaver === option.value}
                onChange={() => setScreensaver(option.value)}
              >
                {option.label}
              </RadioButton>
            ))}
            <label className="custom-color">
              Wait:
              <select
                value={screensaverWait}
                onChange={(e) => setScreensaver(screensaver, Number(e.currentTarget.value))}
                disabled={screensaver === "none"}
              >
                {[1, 2, 5, 10].map((m) => (
                  <option key={m} value={m}>
                    {m} minute{m > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </label>
            <div className="button-row">
              <Button disabled={screensaver === "none"} onClick={() => setScreensaverNow(true)}>
                Preview
              </Button>
            </div>
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
          <p>
            Put the desktop back how it first looked: deleted icons restored, icons back in their circle,
            default wallpaper and screensaver, and every window closed.
          </p>
          <Button onClick={restoreDefaults}>Restore defaults</Button>
        </Fieldset>
      </Tab>
    </Tabs>
  );
}

export default DisplayProperties;
