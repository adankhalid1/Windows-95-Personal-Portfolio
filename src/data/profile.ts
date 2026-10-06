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
  title: "Computer Science Student & Software Engineer",
  location: "Toronto, ON",

  /** Shown in About Me.txt. Each string is a paragraph. */
  about: [
    "Hi! I'm Adan, a Computer Science (Honours, Co-op) student at Toronto Metropolitan University in Toronto. Welcome to my corner of the internet, served up the way computers looked in 1995.",
    "I'm currently a Software Engineer Intern at PointClickCare, shipping features to a React/TypeScript healthcare billing app. Before that I worked in cybersecurity at TMU's Office of the CISO, in systems operations at MPOYNT, as a research assistant building an AI interview coach, and on Roblox multiplayer systems played by millions.",
    "I'm on the Dean's List with a 3.81 GPA, and I'm part of MetHacks, Google Developer Student Club and the TMU Algorithms and Coding Club. Outside of code: content creation, snowboarding, chess and weightlifting.",
    "Double-click around: my projects, resume and contact form are all on this desktop. There's also Minesweeper, for research purposes.",
  ],

  /** Instagram, TikTok, LinkedIn and GitHub also get their own Start menu entries. */
  links: [
    { label: "Instagram", url: "https://www.instagram.com/adan.kld/", kind: "instagram" },
    { label: "TikTok", url: "https://www.tiktok.com/@adan.kld", kind: "tiktok" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/adankhalid/", kind: "linkedin" },
    { label: "GitHub", url: "https://github.com/adankhalid1", kind: "github" },
  ] satisfies Link[],

  /** Messages from Contact Me go to this Formspree form, which emails them to Adan. */
  formspreeId: "moejjeln",

  experience: [
    {
      role: "Software Engineer Intern (Co-op)",
      place: "PointClickCare · Mississauga, ON",
      period: "Sep 2026 – Apr 2027",
      points: [
        "Shipped 10+ features to Nautilus, a React/TypeScript healthcare billing micro-frontend, eliminating silent data loss with an unsaved-changes guard extended across 13 call sites with zero consumer changes.",
        "Fixed a bug that loaded the settings page blank for 100% of users, plus a related timing bug that emptied it mid-typing, and restored banner styling broken by two conflicting UI library versions.",
        "Wrote ~790 lines of automated tests, proving each one catches its bug by temporarily undoing the fix, and removed 2 existing tests that passed even when the code was broken.",
      ],
    },
    {
      role: "Cybersecurity Analyst (Co-op)",
      place: "Toronto Metropolitan University, Office of the CISO · Toronto, ON",
      period: "Jun 2026 – Sep 2026",
      points: [
        "Designed 10+ phishing simulations for a university-wide security awareness campaign targeting 50,000+ students.",
        "Built a Technology Risk Assessment (TRA) automation in Google Apps Script that scores 5 risk factors and generates a tailored report per request, condensing reports from 15 pages to 10 and the intake form from 12 sections to 2.",
        "Traced a hidden bug through system logs that had silently stopped all reports from generating, fixed it, and moved the automation to a shared team account so it runs independently of any one person.",
      ],
    },
    {
      role: "Systems Operations Intern (Co-op)",
      place: "MPOYNT · Toronto, ON",
      period: "Jan 2026 – Apr 2026",
      points: [
        "Built an internal asset tracking system for 10,000+ devices, reducing discrepancies during internal audits.",
        "Automated device provisioning and MDM policy enforcement across iOS, Android, and Windows via SOTI.",
      ],
    },
    {
      role: "Research Assistant",
      place: "Toronto Metropolitan University · Toronto, ON",
      period: "Sep 2025 – Jan 2026",
      points: [
        "Built a full-stack TypeScript AI interview coach for neurodivergent job seekers (React, Hono, Electron, Cloudflare).",
        "Engineered a live transcription pipeline (Speechmatics, Zoom APIs) with word-buffering to cut redundant LLM calls, powering a WebSocket and Groq system that surfaces 4 real-time feedback types mid-interview.",
      ],
    },
    {
      role: "Software Engineer Intern",
      place: "Epic Blocks Games · Toronto, ON",
      period: "May 2024 – Jan 2025",
      points: [
        "Engineered multiplayer systems for Shoot Beam Simulator (21M+ visits) by modularizing Lua scripts and optimizing event handling to support 6,500+ concurrent users with minimal desync.",
        "Designed NoSQL schemas in Roblox DataStore/MemoryStore with atomic batch updates, reducing data loss during migrations for 5M+ users, and resolved high-priority bugs to raise the like ratio to 97%.",
      ],
    },
  ] satisfies Job[],

  education: [
    {
      role: "B.Sc. (Honours) Computer Science, Co-op",
      place: "Toronto Metropolitan University (formerly Ryerson) · Toronto, ON",
      period: "Expected Apr 2028",
      points: [
        "GPA: 3.81 · Dean's List (2024 – 2026)",
        "Relevant coursework: Data Structures and Algorithms, Computer Architecture, Operating Systems, Linear Algebra",
        "Certifications: Full-Stack Web Development Bootcamp, SOTI MobiControl Technician",
        "Extracurriculars: MetHacks Executive, Google Developer Student Club, TMU Algorithms and Coding Club",
      ],
    },
  ] satisfies Job[],

  skills: [
    { name: "Languages", skills: ["Python", "Java", "TypeScript", "JavaScript", "C++", "Lua", "Bash", "HTML/CSS", "Visual Basic"] },
    {
      name: "Frameworks & Libraries",
      skills: ["React", "MUI", "Next.js", "Node.js", "Express.js", "Vue.js", "FastAPI", "Flask", "Django", "TensorFlow", "Tailwind"],
    },
    { name: "Databases", skills: ["MySQL", "MongoDB", "NoSQL (DataStore, MemoryStore)", "Supabase"] },
    {
      name: "Data & Tools",
      skills: ["Git", "AWS", "Google Apps Script", "Google Drive/Docs APIs", "Pandas", "NumPy", "Matplotlib", "Plotly", "Power BI", "Excel"],
    },
  ] satisfies SkillGroup[],

  projects: [
    {
      name: "SpellWithASL",
      type: "Hackathon",
      year: "2025",
      summary:
        "Built at SolutionHacks 2025: an AI-powered app for practising American Sign Language spelling. I led a 3-person team to build and deploy it on containerized microservices, streaming 21 hand landmarks with under 100ms latency for real-time practice by 50+ test users.",
      tech: ["React", "Next.js", "Node.js", "TensorFlow", "TypeScript", "FastAPI", "MediaPipe"],
    },
    {
      name: "Windows 95 Portfolio",
      type: "Website",
      year: "2026",
      summary:
        "This very site: a personal portfolio dressed up as a Windows 95 desktop, with draggable windows, a Start menu, 13 games (including a chess engine running in a Web Worker), Paint, a chiptune music player, an MS-DOS prompt and plenty of easter eggs. Works on phones too.",
      tech: ["React", "TypeScript", "React95", "Zustand", "Vite", "Canvas", "Web Audio"],
      repo: "https://github.com/adankhalid1/Windows-95-Personal-Portfolio",
    },
    {
      name: "AI Music Visualization",
      type: "Web App",
      year: "2025",
      summary:
        "An interactive audio visualizer with a custom audio player and animated, color-shifting bars driven by the music, built as the base for analysing a song's emotional character with machine learning and WebGL.",
      tech: ["JavaScript", "Web Audio API", "Canvas", "HTML/CSS"],
    },
    {
      name: "Dynamic Price Prediction Engine",
      type: "ML Model",
      year: "2024",
      summary:
        "Predicts future eBay prices of iPhones and Samsung phones with an LSTM neural network trained on real historical listings. Cleans messy price data, engineers features like model, storage, color and day of the week, and plots actual vs. predicted prices.",
      tech: ["Python", "PyTorch", "Pandas", "NumPy", "scikit-learn", "Matplotlib"],
      repo: "https://github.com/adankhalid1/dynamic-price-prediction-engine",
    },
    {
      name: "Pathfinder Visualizer",
      type: "Web App",
      year: "2024",
      summary:
        "Visualizes Dijkstra's algorithm finding the shortest path across a grid. Draw walls between the start and finish, watch the search spread out, and reset the grid to try again.",
      tech: ["React", "JavaScript", "CSS"],
      repo: "https://github.com/adankhalid1/Pathfinder-Visualizer",
    },
    {
      name: "Sorting Visualizer",
      type: "Web App",
      year: "2024",
      summary:
        "Animates Merge Sort, Quick Sort, Bubble Sort, Insertion Sort and Selection Sort on a randomly generated array of bars, with a button to generate a fresh array.",
      tech: ["React", "JavaScript", "CSS"],
      repo: "https://github.com/adankhalid1/Sorting-Visualizer",
    },
    {
      name: "CasperAI",
      type: "Discord Bot",
      year: "2024",
      summary:
        "An interactive Discord chat bot that answers questions through the OpenAI API, and can also tell jokes, give advice, post random pictures, roll dice and flip coins.",
      tech: ["Python", "discord.py", "OpenAI API", "REST APIs"],
      repo: "https://github.com/adankhalid1/CasperAI",
    },
    {
      name: "TMUber Service",
      type: "Java App",
      year: "2024",
      summary:
        "A model of how a ride-sharing service works: users and drivers loaded from files, ride and delivery requests with pickup and drop-off on a city map, distances and fares, all driven from a command-line interface.",
      tech: ["Java", "OOP"],
      repo: "https://github.com/adankhalid1/Uber-Service",
    },
    {
      name: "Physics Conversion Calculator",
      type: "Python App",
      year: "2023",
      summary:
        "A menu-driven calculator that helps physics students convert units (km/h and m/s, RPM and rad/s) and work out final velocity, net force, time, mass and potential energy, with a history that can be saved to a file.",
      tech: ["Python"],
      repo: "https://github.com/adankhalid1/Physics-Conversion-Calculator",
    },
    {
      name: "Motivational Meme Website",
      type: "Website",
      year: "2024",
      summary: "A small, light-hearted static website of motivational memes, hosted on GitHub Pages.",
      tech: ["HTML", "CSS"],
      repo: "https://github.com/adankhalid1/Motivational-Meme-Project",
      demo: "https://adankhalid1.github.io/Motivational-Meme-Project/",
    },
  ] satisfies Project[],

  /** Optional. Put a PDF in /public and set e.g. "/resume.pdf" to show a download button. */
  resumePdf: "" as string,
};
