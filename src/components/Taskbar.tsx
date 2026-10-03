import { List, TaskBar } from "@react95/core";
import { Computer3, Folder, Globe, Rundll1, Settings } from "@react95/icons";
import { useEffect, useRef, useState } from "react";
import { APPS, appsInFolder } from "../apps/registry";
import { profile } from "../data/profile";
import { useOpenApp } from "../hooks/useOpenApp";
import { useUi } from "../store/ui";
import Calendar from "./Calendar";
import SocialIcon from "./SocialIcon";
import { isSocial, SOCIAL_KINDS, type SocialKind } from "../data/social";

const FAVORITES = ["about", "projects", "resume", "contact"];
const FOLDERS = [
  { id: "games", label: "Games" },
  { id: "accessories", label: "Accessories" },
] as const;
const FOLDER_IDS = new Set<string>(FOLDERS.map((f) => f.id));

const socialLinks = profile.links
  .filter((link) => isSocial(link.kind))
  .sort(
    (a, b) =>
      SOCIAL_KINDS.indexOf(a.kind as SocialKind) - SOCIAL_KINDS.indexOf(b.kind as SocialKind),
  );


// Touch screens can't hover, so their submenus open on tap and expand in
// place (they'd run off a phone screen sideways).
const tapMenus =
  window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(max-width: 600px)").matches;

/** The Start menu. Remounted each time it opens, so submenus start closed. */
function StartMenu() {
  const openApp = useOpenApp();
  const openDialog = useUi((s) => s.openDialog);
  const openLink = useUi((s) => s.openLink);
  /** Open submenus by depth, e.g. ["programs", "games"]. */
  const [openPath, setOpenPath] = useState<string[]>([]);

  const submenu = (key: string, depth: number) => ({
    className: openPath[depth] === key ? "open" : undefined,
    onClick: (e: React.MouseEvent<HTMLLIElement>) => {
      // A pick inside this submenu bubbles up to close the Start menu as usual.
      const own = e.currentTarget.querySelector(":scope > ul");
      if (own?.contains(e.target as Node)) return;
      // Clicking the submenu's own row shouldn't close the whole menu.
      e.stopPropagation();
      if (!tapMenus) return;
      setOpenPath((path) =>
        path[depth] === key ? path.slice(0, depth) : [...path.slice(0, depth), key],
      );
    },
  });

  return (
    <div className={`start-menu${tapMenus ? " tap-menus" : ""}`}>
      <div className="start-banner">
        <b>{profile.handle}</b>
        <span>95</span>
      </div>
      <List width="210px">
        {socialLinks.map((link) => (
          <List.Item
            key={link.url}
            icon={isSocial(link.kind) ? <SocialIcon kind={link.kind} /> : undefined}
            onClick={() => openLink(link)}
          >
            {link.label}
          </List.Item>
        ))}
        {socialLinks.length > 0 && <List.Divider />}
        <List.Item icon={<Folder variant="32x32_4" />} {...submenu("programs", 0)}>
          <List width="200px">
            {FOLDERS.map(({ id, label }) => (
              <List.Item key={id} icon={<Folder variant="16x16_4" />} {...submenu(id, 1)}>
                <List width="190px">
                  {appsInFolder(id).map((app) => (
                    <List.Item
                      key={app.id}
                      icon={app.smallIcon}
                      onClick={() => openApp(app.id)}
                    >
                      {app.label}
                    </List.Item>
                  ))}
                </List>
                {label}
              </List.Item>
            ))}
            {APPS.filter((app) => !app.startMenuOnly && !app.hidden && !app.folder && !FOLDER_IDS.has(app.id)).map(
              (app) => (
                <List.Item
                  key={app.id}
                  icon={app.smallIcon}
                  onClick={() => openApp(app.id)}
                >
                  {app.label}
                </List.Item>
              ),
            )}
          </List>
          Programs
        </List.Item>
        <List.Item icon={<Globe variant="32x32_4" />} {...submenu("links", 0)}>
          <List width="200px">
            {profile.links.map((link) => (
              <List.Item
                key={link.url}
                onClick={() => openLink(link)}
              >
                {link.label}
              </List.Item>
            ))}
          </List>
          Find me on...
        </List.Item>
        <List.Item icon={<Settings variant="32x32_4" />} {...submenu("settings", 0)}>
          <List width="200px">
            {APPS.filter((app) => app.startMenuOnly).map((app) => (
              <List.Item
                key={app.id}
                icon={app.smallIcon}
                onClick={() => openApp(app.id)}
              >
                {app.label}
              </List.Item>
            ))}
          </List>
          Settings
        </List.Item>
        <List.Divider />
        {APPS.filter((app) => FAVORITES.includes(app.id)).map((app) => (
          <List.Item key={app.id} icon={app.icon} onClick={() => openApp(app.id)}>
            {app.label}
          </List.Item>
        ))}
        <List.Divider />
        <List.Item icon={<Rundll1 variant="32x32_4" />} onClick={() => openDialog("run")}>
          Run...
        </List.Item>
        <List.Item
          icon={<Computer3 variant="32x32_4" />}
          onClick={() => openDialog("shutdown")}
        >
          Shut Down...
        </List.Item>
      </List>
    </div>
  );
}

function Taskbar() {
  const [showCalendar, setShowCalendar] = useState(false);
  const taskbarRef = useRef<HTMLDivElement>(null);

  // react95 draws its own tray clock with no click hook, so wire one onto it:
  // click shows the calendar, hovering shows the full date (like Win95).
  useEffect(() => {
    const clock = taskbarRef.current?.lastElementChild as HTMLElement | null;
    if (!clock) return;
    clock.classList.add("tray-clock");
    clock.setAttribute("role", "button");
    clock.tabIndex = 0;
    const toggle = () => setShowCalendar((v) => !v);
    const onKey = (e: KeyboardEvent) => e.key === "Enter" && toggle();
    const setTitle = () =>
      (clock.title = new Date().toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }));
    clock.addEventListener("click", toggle);
    clock.addEventListener("keydown", onKey);
    clock.addEventListener("pointerenter", setTitle);
    return () => {
      clock.removeEventListener("click", toggle);
      clock.removeEventListener("keydown", onKey);
      clock.removeEventListener("pointerenter", setTitle);
    };
  }, []);

  return (
    <>
      <TaskBar
        ref={taskbarRef}
        list={
          <StartMenu />
        }
      />
      {showCalendar && <Calendar onClose={() => setShowCalendar(false)} />}
    </>
  );
}

export default Taskbar;
