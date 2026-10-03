import { Fieldset } from "@react95/core";
import { Computer, Notepad } from "@react95/icons";
import { profile } from "../data/profile";
import { SECRETS } from "../data/secrets";
import { useOpenApp } from "../hooks/useOpenApp";
import { useSecrets } from "../store/secrets";

// navigator.deviceMemory only exists in Chromium browsers.
const memoryGb = (navigator as Navigator & { deviceMemory?: number })
  .deviceMemory;

function MyComputer() {
  const openApp = useOpenApp();
  const found = useSecrets((s) => s.found.length);
  return (
    <div className="system-props">
      <Computer variant="32x32_4" style={{ width: 64, height: 64 }} />
      <div>
        <Fieldset legend="System">
          <p>Microsoft Windows 95</p>
          <p>4.00.950 (portfolio edition)</p>
        </Fieldset>
        <Fieldset legend="Registered to">
          <p>{profile.name}</p>
          <p>{profile.title}</p>
        </Fieldset>
        <Fieldset legend="Computer">
          <p>{navigator.hardwareConcurrency || 1} x Pentium(r) compatible CPU</p>
          <p>
            {memoryGb ? `${memoryGb * 1024} MB RAM` : "640 KB RAM"} (should be
            enough for anybody)
          </p>
          <p>
            Display: {window.screen.width} x {window.screen.height}
          </p>
        </Fieldset>
        <Fieldset legend="Secrets">
          <button className="my-computer-file" onClick={() => openApp("achievements")}>
            <Notepad variant="16x16_4" />
            <span>
              <u>Achievements.txt</u> ({found} of {SECRETS.length} found)
            </span>
          </button>
        </Fieldset>
      </div>
    </div>
  );
}

export default MyComputer;
