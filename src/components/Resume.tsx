import { Avatar, Checkbox, Fieldset, ProgressBar, Tab, Tabs } from '@react95/core';

function Resume() {
  return (
    <Tabs defaultActiveTab="Genesis">
      <Tab title="Genesis">
        <h3>Behold, I am Ali Shirani</h3>
        <Avatar src="https://avatars.githubusercontent.com/u/87601568?v=4" alt="A portrait of the artisan" size="140px" />

        <p>A Software Engineer Architecting the Digital Frontier</p>
        <Fieldset legend="My Saga">
          <p>
            I am a creator of worlds, a weaver of code, and a solver of complex digital puzzles. With a mastery of both front-end and back-end technologies, I don't just build applications; I breathe life into them. My quest is to forge elegant, high-performance software that not only meets the needs of the present but also anticipates the challenges of the future.
          </p>
        </Fieldset>
      </Tab>
      <Tab title="Chronicles of a Coder">
        <Fieldset legend="Quera - The Mentor's Forge (2023 - 2024)">
          <Checkbox readOnly checked>
            Architect of Learning: As a Software Engineer and Mentor, I crafted the very tools and tutorials that would shape the next generation of developers. I authored extensive documentation for a pantheon of technologies, including HTML, CSS, JavaScript, and TypeScript.
          </Checkbox>
          <Checkbox readOnly checked>
            The IDE Innovator: I was a key force in the development of a groundbreaking web-based Integrated Development Environment, creating a seamless and powerful platform for front-end education.
          </Checkbox>
        </Fieldset>
        <Fieldset legend="Code with Ali - The YouTube Odyssey (2023 - Present)">
          <Checkbox readOnly checked>
            The Digital Chronicler: Through my YouTube channel, "Code with Ali," I share my knowledge with the world, creating in-depth tutorials on full-stack development with technologies like React and Next.js, and venturing into the realm of AI-powered APIs.
          </Checkbox>
        </Fieldset>
        <Fieldset legend="No Avaran Tejarate Pars (RcoinX) - The Trader's Domain (2022 - 2023)">
          <Checkbox readOnly checked>
            Master of the Mobile Realm: As a Software Engineer, I engineered a cutting-edge mobile trading application using Expo and React Native, and developed a companion website with the power of Next.js and Tailwind CSS.
          </Checkbox>
        </Fieldset>
        <Fieldset legend="ATIPA (Keytex) - The User's Champion (2021 - 2022)">
          <Checkbox readOnly checked>
            The Alchemist of User Experience: I transmuted user interaction into gold, designing and developing a seamless web application that dramatically boosted user engagement and conversion rates.
          </Checkbox>
          <Checkbox readOnly checked>
            The Performance Prophet: Through the implementation of efficient coding practices and website optimization, I achieved a legendary 20% increase in user retention and a colossal 40% surge in mobile traffic.
          </Checkbox>
        </Fieldset>
      </Tab>
      <Tab title="Arsenal of a Software Engineer">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <Fieldset legend="Core Languages & Frameworks">
            <ul>
              <li className="resume-skills">JavaScript (ES6+)</li>
              <ProgressBar percent={98} width="200px" />
              <li className="resume-skills">TypeScript</li>
              <ProgressBar percent={95} width="200px" />
              <li className="resume-skills">React.js & React Native</li>
              <ProgressBar percent={97} width="200px" />
              <li className="resume-skills">Next.js</li>
              <ProgressBar percent={96} width="200px" />
              <li className="resume-skills">Node.js</li>
              <ProgressBar percent={90} width="200px" />
              <li className="resume-skills">Angular</li>
              <ProgressBar percent={80} width="200px" />
              <li className="resume-skills">Vue.js</li>
              <ProgressBar percent={78} width="200px" />
            </ul>
          </Fieldset>
          <Fieldset legend="Styling & UI Craft">
            <ul>
              <li className="resume-skills">HTML5 & CSS3</li>
              <ProgressBar percent={100} width="200px" />
              <li className="resume-skills">SASS</li>
              <ProgressBar percent={92} width="200px" />
              <li className="resume-skills">Tailwind CSS</li>
              <ProgressBar percent={94} width="200px" />
              <li className="resume-skills">Astro</li>
              <ProgressBar percent={85} width="200px" />
            </ul>
          </Fieldset>
          <Fieldset legend="Development & Operations">
            <ul>
              <li className="resume-skills">Git & GitHub</li>
              <ProgressBar percent={99} width="200px" />
              <li className="resume-skills">Jest & Cypress</li>
              <ProgressBar percent={88} width="200px" />
              <li className="resume-skills">Docker</li>
              <ProgressBar percent={75} width="200px" />
              <li className="resume-skills">CI/CD</li>
              <ProgressBar percent={70} width="200px" />
            </ul>
          </Fieldset>
        </div>
      </Tab>
      <Tab title="The Soul of the Engineer">
        <Fieldset legend="Core Attributes">
          <p>
            I am a relentless problem-solver, a collaborative spirit, and a lifelong learner. My passion for technology is matched only by my dedication to creating meaningful and impactful digital experiences. I thrive in dynamic environments where I can push the boundaries of what's possible and contribute to a team that shares my vision for a better, more connected world.
          </p>
        </Fieldset>
      </Tab>
    </Tabs>
  );
}

export default Resume;