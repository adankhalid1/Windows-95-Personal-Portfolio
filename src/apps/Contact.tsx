import { useForm, ValidationError } from "@formspree/react";
import { Button, Input, TextArea } from "@react95/core";
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

const first = profile.name.split(" ")[0];

/** Messages are sent through Formspree, which emails them on to Adan. */
function ContactForm() {
  const [state, handleSubmit, reset] = useForm(profile.formspreeId);

  if (state.succeeded) {
    return (
      <div className="compose-sent" role="status">
        <span className="error-icon info" aria-hidden>
          i
        </span>
        <div>
          <p>
            <b>Message sent!</b>
          </p>
          <p>Thanks for reaching out. {first} will get back to you at the email you gave.</p>
          <Button onClick={reset}>New Message</Button>
        </div>
      </div>
    );
  }

  return (
    <form className="compose" onSubmit={handleSubmit}>
      <label>
        To:
        <Input value={profile.name} readOnly tabIndex={-1} />
      </label>
      <label>
        Name:
        <Input name="name" autoComplete="name" />
      </label>
      <label>
        Email:
        <Input type="email" name="email" required autoComplete="email" placeholder="So I can reply" />
      </label>
      <ValidationError className="compose-error" prefix="Email" field="email" errors={state.errors} />
      <label>
        Subject:
        <Input name="subject" />
      </label>
      <TextArea rows={6} name="message" required placeholder="Say hi..." aria-label="Message" />
      <ValidationError className="compose-error" prefix="Message" field="message" errors={state.errors} />
      <ValidationError className="compose-error" errors={state.errors} />
      <div className="compose-footer">
        {state.submitting && (
          <span className="compose-progress" aria-label="Sending">
            Sending
            <span className="compose-progress-bar" />
          </span>
        )}
        <Button type="submit" disabled={state.submitting}>
          {state.submitting ? "Sending..." : "Send"}
        </Button>
      </div>
    </form>
  );
}

function Contact() {
  const openLink = useUi((s) => s.openLink);

  return (
    <div className="contact">
      <ContactForm />
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
