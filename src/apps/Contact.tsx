import { Button, Input, TextArea } from "@react95/core";
import { useState } from "react";
import {
  FaEnvelope,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLink,
  FaLinkedin,
  FaTiktok,
} from "react-icons/fa";
import { profile, type Link } from "../data/profile";
import { useUi } from "../store/ui";

const LINK_ICONS: Record<Link["kind"], typeof FaGithub> = {
  github: FaGithub,
  linkedin: FaLinkedin,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  email: FaEnvelope,
  website: FaGlobe,
  other: FaLink,
};

const emailLink = profile.links.find((l) => l.kind === "email");
const emailAddress = emailLink?.url.replace(/^mailto:/, "") ?? "";

function Contact() {
  const openLink = useUi((s) => s.openLink);
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
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.preventDefault();
                openLink(link);
              }}
            >
              <Icon size={16} /> {link.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default Contact;
