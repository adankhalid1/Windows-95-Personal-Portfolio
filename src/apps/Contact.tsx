import { Button, Input, TextArea } from "@react95/core";
import { useState } from "react";
import { FaEnvelope, FaGithub, FaGlobe, FaLink, FaLinkedin } from "react-icons/fa";
import { profile, type Link } from "../data/profile";

const LINK_ICONS: Record<Link["kind"], typeof FaGithub> = {
  github: FaGithub,
  linkedin: FaLinkedin,
  email: FaEnvelope,
  website: FaGlobe,
  other: FaLink,
};

const emailLink = profile.links.find((l) => l.kind === "email");
const emailAddress = emailLink?.url.replace(/^mailto:/, "") ?? "";

function Contact() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // There is no backend: "Send" hands the message to the visitor's mail app.
  const send = () => {
    const params = new URLSearchParams({ subject, body });
    window.location.href = `mailto:${emailAddress}?${params.toString().replace(/\+/g, "%20")}`;
  };

  return (
    <div className="contact">
      {emailAddress && (
        <form
          className="compose"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label>
            To:
            <Input value={emailAddress} readOnly />
          </label>
          <label>
            Subject:
            <Input value={subject} onChange={(e) => setSubject(e.currentTarget.value)} />
          </label>
          <TextArea
            rows={6}
            placeholder="Say hi..."
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
          />
          <Button type="submit">Send</Button>
        </form>
      )}
      <div className="contact-links">
        {profile.links.map((link) => {
          const Icon = LINK_ICONS[link.kind];
          return (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
              <Icon size={16} /> {link.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default Contact;
