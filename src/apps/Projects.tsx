import { Button, Fieldset } from "@react95/core";
import { FolderExe } from "@react95/icons";
import { useState } from "react";
import { profile, type Project } from "../data/profile";
import { FileExe } from "./icons";

// On touch screens a double-tap is awkward, so a single tap opens.
const singleClickOpens = window.matchMedia("(pointer: coarse)").matches;

function ProjectDetails({ project, onBack }: { project: Project; onBack: () => void }) {
  return (
    <div className="project-details">
      <div className="explorer-toolbar">
        <Button onClick={onBack}>&larr; Back</Button>
      </div>
      <div className="project-header">
        <FolderExe variant="32x32_4" />
        <div>
          <h3>{project.name}</h3>
          <p className="muted">
            {project.type} &middot; {project.year}
          </p>
        </div>
      </div>
      <p>{project.summary}</p>
      <Fieldset legend="Built with">
        <div className="chips">
          {project.tech.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      </Fieldset>
      <div className="button-row">
        {project.repo && (
          <Button onClick={() => window.open(project.repo, "_blank", "noopener")}>
            View source
          </Button>
        )}
        {project.demo && (
          <Button onClick={() => window.open(project.demo, "_blank", "noopener")}>
            Live demo
          </Button>
        )}
      </div>
    </div>
  );
}

function Projects() {
  const [selected, setSelected] = useState<string | null>(null);
  const [opened, setOpened] = useState<Project | null>(null);

  if (opened) {
    return <ProjectDetails project={opened} onBack={() => setOpened(null)} />;
  }

  return (
    <div className="explorer">
      <div className="explorer-address">
        Address: <span>C:\Projects</span>
      </div>
      <div className="explorer-list">
        <div className="explorer-row explorer-head">
          <span>Name</span>
          <span>Type</span>
          <span>Year</span>
        </div>
        {profile.projects.map((project) => (
          <div
            key={project.name}
            role="button"
            tabIndex={0}
            className={`explorer-row${selected === project.name ? " selected" : ""}`}
            onClick={() => (singleClickOpens ? setOpened(project) : setSelected(project.name))}
            onDoubleClick={() => setOpened(project)}
            onKeyDown={(e) => e.key === "Enter" && setOpened(project)}
          >
            <span className="explorer-name">
              {FileExe}
              {project.name}
            </span>
            <span>{project.type}</span>
            <span>{project.year}</span>
          </div>
        ))}
      </div>
      <div className="statusbar">
        {profile.projects.length} object(s) &middot; {singleClickOpens ? "tap" : "double-click"} to open
      </div>
    </div>
  );
}

export default Projects;
