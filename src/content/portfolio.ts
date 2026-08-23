export type Project = {
  id: string;
  name: string;
  description: string;
  githubLink: string;
  liveLink?: string;
};

export type Contact = {
  id: "email" | "github" | "linkedin" | "x";
  label: string;
  value: string;
  href: string;
  aliases: string[];
};

export type DocId =
  | "start"
  | "about"
  | "experience"
  | "projects"
  | "skills"
  | "contacts"
  | "resume"
  | "now"
  | "scratch"
  | `note:${string}`;

export type DocumentDefinition = {
  id: Exclude<DocId, `note:${string}`>;
  title: string;
  group: "Portfolio" | "Personal Notes";
  kind: "markdown" | "resume" | "editable";
  content?: string;
};

export const PROFILE = {
  name: "Yeunwook Kim",
  shortName: "Yeunwook",
  location: "SoMa, San Francisco",
  degree: "Mathematics-Computer Science",
  school: "University of California, San Diego",
  graduationYear: 2026,
  introduction:
    "Hey, I'm Yeunwook. I graduated from UC San Diego in 2026 with a degree in Math-CS. I like building practical software, especially blockchain tools, cloud services, and odd projects involving audio, coffee, or mahjong. When I'm not coding, I'm probably at a punk show, in an arcade, or making another pour-over.",
} as const;

export const CONTACTS: Contact[] = [
  { id: "email", label: "Email", value: "yeunwookk@gmail.com", href: "mailto:yeunwookk@gmail.com", aliases: ["mail", "contact"] },
  { id: "github", label: "GitHub", value: "github.com/Yanuk-K", href: "https://github.com/Yanuk-K", aliases: ["git", "yanuk"] },
  { id: "linkedin", label: "LinkedIn", value: "in/yeun-wook-kim", href: "https://www.linkedin.com/in/yeun-wook-kim/", aliases: ["linkedin"] },
  { id: "x", label: "X", value: "@0xstoj", href: "https://x.com/0xstoj", aliases: ["twitter", "0xstoj"] },
];

export const PROJECTS: Project[] = [
  { id: "this-website", name: "This Website", description: "A Kubuntu-inspired Breeze desktop recreated on the web, with draggable windows, Plasma panel, Kickoff, KRunner, and working apps.", githubLink: "https://github.com/Yanuk-K/Personal-Website", liveLink: "https://yeunwook.kim/" },
  { id: "grinder-calculator", name: "Grinder Calculator", description: "Converts grinder click settings between grinders through micron-equivalent click sizes.", githubLink: "https://github.com/Yanuk-K/Personal-Website/blob/main/src/apps/grindercalc/GrinderCalcApp.tsx", liveLink: "/app/grindercalc" },
  { id: "mahjong-scoring", name: "Raspberry Pi Riichi Mahjong Score Calculator", description: "An AI Riichi Mahjong score calculator using custom YOLO NCNN models on Raspberry Pi.", githubLink: "https://github.com/Yanuk-K/Raspberry-Pi-YOLO-Riichi-Mahjong" },
  { id: "lox-interpreter", name: "Lox Interpreter", description: "A Java interpreter for the Lox programming language.", githubLink: "https://github.com/Yanuk-K/LOX_Interpreter" },
  { id: "ultimate-vocal-remover", name: "Ultimate Vocal Remover GUI for gfx1151", description: "A Linux AMD Radeon gfx1151 / ROCm fork of Ultimate Vocal Remover GUI with RoFormer support.", githubLink: "https://github.com/Yanuk-K/ultimatevocalremovergui_gfx1151" },
  { id: "bass-transcription", name: "Bass Transcription for gfx1151", description: "A browser-first AI bass transcription app that turns full songs into bass tab, MIDI, and PDF exports using Demucs and torchcrepe.", githubLink: "https://github.com/Yanuk-K/bass_transcription_gfx1151" },
];

const projectsMarkdown = PROJECTS.map((project) => `## ${project.name}\n${project.description}\n\n[GitHub](${project.githubLink})${project.liveLink ? ` · [Open](${project.liveLink})` : ""}`).join("\n\n");

export const PORTFOLIO_DOCUMENTS: DocumentDefinition[] = [
  { id: "start", title: "Start Here.md", group: "Portfolio", kind: "markdown", content: `# Hi, I'm ${PROFILE.shortName}.\n\n${PROFILE.introduction}\n\nThis notebook is the short version of my portfolio. Open **Experience**, **Projects**, or **Contacts** from the sidebar; **Resume** stays embedded as the original document.\n\n## A few things I keep returning to\n\n- Building tools that have a clear job\n- Blockchain infrastructure and cloud systems\n- Audio tooling, espresso-adjacent coffee math, and Riichi Mahjong\n- Punk shows, rhythm games, and small side projects` },
  { id: "about", title: "About Me.md", group: "Portfolio", kind: "markdown", content: `# About Me\n\n${PROFILE.introduction}\n\n## Background\n\nI studied **${PROFILE.degree}** at **${PROFILE.school}** and graduated in **${PROFILE.graduationYear}**. I care about software that is useful, understandable, and pleasant to use.\n\n## Off the clock\n\nI like punk gigs, arcades and rhythm games, keeping overly detailed coffee recipes, and Riichi Mahjong.` },
  { id: "experience", title: "Experience.md", group: "Portfolio", kind: "markdown", content: `# Experience\n\n## EIOB Inc.\n**Software Engineer Intern** · Remote, South Korea · Apr 2025 - Sep 2025\n\n- Built and deployed decentralized applications on a Layer-1 EVM mainnet.\n- Forked and extended Blockscout for an on-chain block explorer with integrated microservices.\n- Built serverless AWS Lambda services for blockchain health, contract events, and price monitoring.\n\n## C&C I Motiv\n**Software Engineer Intern** · Klang, Malaysia · Jul 2025 - Sep 2025\n\n- Led a company website redesign with attention to UX and web security.\n- Maintained a MariaDB database and removed legacy data.\n- Wrote maintenance documentation for the updated site.\n\n## Freelance Software Development\n**Software Engineer** · Remote, South Korea · Dec 2022 - Apr 2023\n\n- Delivered a Windows desktop application for automating futures trading workflows.\n- Used C# and .NET Framework to query a closed third-party HTS and trade options through its API.\n\n## Blockchain at San Diego\n**VP of Events** · La Jolla, CA · Sep 2021 - Jun 2022\n\n- Led event coordination with the business-development team, crypto companies, and university organizations.\n\n## RealToken Inc.\n**Software Engineer Intern** · Remote, FL · Aug 2020 - Dec 2020\n\n- Built a localized company website with JavaScript, HTML, and CSS.\n- Audited Solidity smart contracts and researched the Korean market.` },
  { id: "projects", title: "Projects.md", group: "Portfolio", kind: "markdown", content: `# Projects\n\n${projectsMarkdown}` },
  { id: "skills", title: "Skills.md", group: "Portfolio", kind: "markdown", content: `# Skills\n\n## Languages\nC#, Java, C++, JavaScript/TypeScript, Solidity, Python\n\n## Frontend\nReact, Vite, Tailwind, Next.js\n\n## Cloud and infrastructure\nAWS Lambda, EC2, RDS, Docker, Kubernetes\n\n## Things I have enjoyed working on\nEVM tooling, on-chain analytics, serverless services, audio ML workflows, computer vision on Raspberry Pi, and desktop utilities.` },
  { id: "contacts", title: "Contacts.md", group: "Portfolio", kind: "markdown", content: `# Contacts\n\n- **Email:** [yeunwookk@gmail.com](mailto:yeunwookk@gmail.com)\n- **GitHub:** [github.com/Yanuk-K](https://github.com/Yanuk-K)\n- **LinkedIn:** [in/yeun-wook-kim](https://www.linkedin.com/in/yeun-wook-kim/)\n- **X:** [@0xstoj](https://x.com/0xstoj)\n- **Based in:** ${PROFILE.location}` },
  { id: "resume", title: "Resume", group: "Portfolio", kind: "resume" },
  { id: "now", title: "Now.md", group: "Portfolio", kind: "markdown", content: `# Now\n\nA few projects I am keeping close:\n\n- Maintaining the tools and experiments that grow out of my audio and blockchain work.\n- Making this portfolio feel more like a real desktop than a landing page.\n- Keeping coffee recipes and debugging notes in the same place.\n\nOutside of work, I am still making time for punk shows, arcade runs, and Mahjong.` },
  { id: "scratch", title: "Scratchpad.md", group: "Personal Notes", kind: "editable", content: "# Scratchpad\n\nNotes, ideas, half-finished thoughts...\n" },
];

export const DOC_TITLES = Object.fromEntries(PORTFOLIO_DOCUMENTS.map((doc) => [doc.id, doc.title])) as Record<Exclude<DocId, `note:${string}`>, string>;

export const RESUME_EDIT_URL = "https://docs.google.com/document/d/1POl_K3ciF_5iMrNanJ71unNUUbwxHbJ3le3EcKjyveY/edit";
export const RESUME_EMBED_URL = `${RESUME_EDIT_URL}?embedded=true`;
