import { Button, Fieldset, Tab, Tabs } from "@react95/core";
import { profile, type Job } from "../data/profile";

function JobList({ jobs }: { jobs: Job[] }) {
  return jobs.map((job) => (
    <Fieldset key={`${job.place}-${job.period}`} legend={job.place}>
      <p className="resume-role">
        <b>{job.role}</b> <span>{job.period}</span>
      </p>
      <ul>
        {job.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </Fieldset>
  ));
}

function Resume() {
  return (
    <div className="resume">
      {profile.resumePdf && (
        <Button onClick={() => window.open(profile.resumePdf, "_blank")}>
          Download PDF
        </Button>
      )}
      <Tabs defaultActiveTab="Experience">
        <Tab title="Experience">
          <JobList jobs={profile.experience} />
        </Tab>
        <Tab title="Education">
          <JobList jobs={profile.education} />
        </Tab>
        <Tab title="Skills">
          {profile.skills.map((group) => (
            <Fieldset key={group.name} legend={group.name}>
              <div className="chips">
                {group.skills.map((skill) => (
                  <span key={skill} className="chip">
                    {skill}
                  </span>
                ))}
              </div>
            </Fieldset>
          ))}
        </Tab>
      </Tabs>
    </div>
  );
}

export default Resume;
