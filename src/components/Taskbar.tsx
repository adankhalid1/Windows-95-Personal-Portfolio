import { List, TaskBar } from "@react95/core";
import { Computer3, Folder, Globe, Rundll1, Settings } from "@react95/icons";
import { useEffect, useRef, useState } from "react";
import { APPS } from "../apps/registry";
import { profile } from "../data/profile";
import { useOpenApp } from "../hooks/useOpenApp";
import { useUi } from "../store/ui";
import Calendar from "./Calendar";

const FAVORITES = ["about", "projects", "resume", "contact"];

function Taskbar() {
  const openApp = useOpenApp();
  const openDialog = useUi((s) => s.openDialog);
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
          <div className="start-menu">
            <div className="start-banner">
              <b>{profile.handle}</b>
              <span>95</span>
            </div>
            <List width="210px">
              <List.Item icon={<Folder variant="32x32_4" />}>
                <List width="200px">
                  {APPS.filter((app) => !app.startMenuOnly).map((app) => (
                    <List.Item
                      key={app.id}
                      icon={app.smallIcon}
                      onClick={() => openApp(app.id)}
                    >
                      {app.label}
                    </List.Item>
                  ))}
                </List>
                Programs
              </List.Item>
              <List.Item icon={<Globe variant="32x32_4" />}>
                <List width="200px">
                  {profile.links.map((link) => (
                    <List.Item
                      key={link.url}
                      onClick={() => window.open(link.url, "_blank", "noopener")}
                    >
                      {link.label}
                    </List.Item>
                  ))}
                </List>
                Find me on...
              </List.Item>
              <List.Item icon={<Settings variant="32x32_4" />}>
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
        }
      />
      {showCalendar && <Calendar onClose={() => setShowCalendar(false)} />}
    </>
  );
}

export default Taskbar;
