import { List, TaskBar } from "@react95/core";
import { Computer3, Folder, Globe } from "@react95/icons";
import { useState } from "react";
import { APPS } from "../apps/registry";
import { profile } from "../data/profile";
import { useOpenApp } from "../hooks/useOpenApp";
import ShutdownDialog from "./ShutdownDialog";

function Taskbar() {
  const [showShutdown, setShowShutdown] = useState(false);
  const openApp = useOpenApp();

  return (
    <>
      <TaskBar
        list={
          <div className="start-menu">
            <div className="start-banner">
              <b>{profile.handle}</b>
              <span>95</span>
            </div>
            <List width="210px">
              <List.Item icon={<Folder variant="32x32_4" />}>
                <List width="200px">
                  {APPS.map((app) => (
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
              {APPS.filter((app) => ["about", "projects", "resume", "contact"].includes(app.id)).map(
                (app) => (
                  <List.Item key={app.id} icon={app.icon} onClick={() => openApp(app.id)}>
                    {app.label}
                  </List.Item>
                ),
              )}
              <List.Divider />
              <List.Item
                icon={<Computer3 variant="32x32_4" />}
                onClick={() => setShowShutdown(true)}
              >
                Shut Down...
              </List.Item>
            </List>
          </div>
        }
      />
      {showShutdown && <ShutdownDialog close={() => setShowShutdown(false)} />}
    </>
  );
}

export default Taskbar;
