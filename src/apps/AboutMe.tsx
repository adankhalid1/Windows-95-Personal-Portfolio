import photo from "../assets/adan.webp";
import { profile } from "../data/profile";

function AboutMe() {
  return (
    <div className="notepad">
      <figure className="about-photo">
        <img src={photo} alt={`${profile.name} snowboarding, in goggles and a blue jacket`} width={360} height={480} />
        <figcaption>me.jpg</figcaption>
      </figure>
      {`Name:      ${profile.name}\nRole:      ${profile.title}\nLocation:  ${profile.location}\n\n`}
      {profile.about.join("\n\n")}
    </div>
  );
}

export default AboutMe;
