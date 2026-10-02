// Everything personal about the site lives in this file.
// Edit the values below and the desktop, start menu, and windows update on their own.

export interface Link {
  label: string;
  url: string;
  kind: "github" | "linkedin" | "instagram" | "tiktok" | "email" | "website" | "other";
}

export interface Job {
  role: string;
  place: string;
  period: string;
  points: string[];
}

export interface SkillGroup {
  name: string;
  skills: string[];
}

export interface Project {
  name: string;
  /** Shown as the "file type" column in the Projects explorer. */
  type: string;
  year: string;
  summary: string;
  tech: string[];
  repo?: string;
  demo?: string;
}

export const profile = {
  name: "Adan Khalid",
  /** Short name used on the login screen and the start menu banner. */
  handle: "adan",
  title: "Software Developer",
  location: "Earth, probably",

  /** Shown in About Me.txt. Each string is a paragraph. */
  about: [
    "Hi! I'm Adan. Welcome to my corner of the internet, served up the way computers looked in 1995.",
    "I like building things for the web, poking at how systems work, and turning ideas into projects that actually ship.",
    "Double-click around: my projects, resume, and contact details are all on this desktop. There's also Minesweeper, for research purposes.",
  ],

  /** Instagram, TikTok, LinkedIn and GitHub also get their own Start menu entries. */
  links: [
    { label: "Instagram", url: "https://www.instagram.com/your-handle", kind: "instagram" },
    { label: "TikTok", url: "https://www.tiktok.com/@your-handle", kind: "tiktok" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/your-handle", kind: "linkedin" },
    { label: "GitHub", url: "https://github.com/adankhalid1", kind: "github" },
    { label: "Email", url: "mailto:you@example.com", kind: "email" },
  ] satisfies Link[],

  experience: [
    {
      role: "Your Role",
      place: "Company or University",
      period: "2024 - Present",
      points: [
        "One line about something you built or improved.",
        "Another line, ideally with a number in it.",
      ],
    },
  ] satisfies Job[],

  education: [
    {
      role: "Degree / Program",
      place: "School Name",
      period: "2023 - 2027",
      points: ["Relevant coursework, clubs, or awards."],
    },
  ] satisfies Job[],

  skills: [
    { name: "Languages", skills: ["TypeScript", "JavaScript", "Python"] },
    { name: "Frameworks", skills: ["React", "Node.js", "Vite"] },
    { name: "Tools", skills: ["Git", "Linux", "Figma"] },
  ] satisfies SkillGroup[],

  projects: [
    {
      name: "Windows 95 Portfolio",
      type: "Website",
      year: "2026",
      summary:
        "This very site: a personal portfolio dressed up as a Windows 95 desktop, with draggable windows, a start menu, and Minesweeper.",
      tech: ["React", "TypeScript", "React95", "Zustand", "Vite"],
      repo: "https://github.com/adankhalid1/Windows-95-Personal-Portfolio",
    },
    {
      name: "Next Big Thing",
      type: "Application",
      year: "2026",
      summary: "Replace this with a real project: what it does, why you made it, and what you learned.",
      tech: ["Your", "Stack", "Here"],
    },
  ] satisfies Project[],

  /** Optional. Put a PDF in /public and set e.g. "/resume.pdf" to show a download button. */
  resumePdf: "" as string,
};
