import { profile } from "../data/profile";

function AboutMe() {
  return (
    <div className="notepad">
      {`Name:      ${profile.name}\nRole:      ${profile.title}\nLocation:  ${profile.location}\n\n`}
      {profile.about.join("\n\n")}
    </div>
  );
}

export default AboutMe;
