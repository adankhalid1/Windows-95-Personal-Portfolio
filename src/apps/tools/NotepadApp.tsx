import { useEffect, useRef, useState } from "react";
import MenuBar from "../../components/MenuBar";

const STORAGE_KEY = "win95-notepad";

function load(): { text: string; name: string } {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (saved && typeof saved.text === "string") return saved;
  } catch {
    /* start empty */
  }
  return { text: "", name: "Untitled" };
}

/** A plain-text editor. Whatever you type is kept in this browser automatically. */
function NotepadApp() {
  const [{ text, name }, setDoc] = useState(load);
  const [wrap, setWrap] = useState(true);
  const area = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ text, name }));
    } catch {
      /* not saved this time */
    }
  }, [text, name]);

  const insert = (snippet: string) => {
    const el = area.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const next = text.slice(0, a) + snippet + text.slice(b);
    setDoc({ text: next, name });
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = a + snippet.length;
    });
  };

  const timeDate = () =>
    insert(
      new Date().toLocaleString([], {
        hour: "numeric",
        minute: "2-digit",
        month: "numeric",
        day: "numeric",
        year: "numeric",
      }),
    );

  const save = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name.endsWith(".txt") ? name : `${name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const open = async (file: File | undefined) => {
    if (!file) return;
    setDoc({ text: await file.text(), name: file.name.replace(/\.txt$/i, "") });
  };

  const lines = text.split("\n").length;

  return (
    <div className="notepad-app">
      <MenuBar
        menus={[
          {
            label: "File",
            items: [
              { label: "New", onClick: () => setDoc({ text: "", name: "Untitled" }) },
              { label: "Open...", onClick: () => fileInput.current?.click() },
              { label: "Save (download .txt)", onClick: save },
            ],
          },
          {
            label: "Edit",
            items: [
              { label: "Select All", onClick: () => area.current?.select() },
              { label: "Time/Date (F5)", onClick: timeDate },
            ],
          },
          {
            label: "Format",
            items: [{ label: "Word Wrap", checked: wrap, onClick: () => setWrap(!wrap) }],
          },
        ]}
      />
      <textarea
        ref={area}
        className="notepad-area"
        value={text}
        wrap={wrap ? "soft" : "off"}
        spellCheck={false}
        autoFocus
        aria-label={`${name} - Notepad`}
        placeholder="Type anything. It's saved in this browser as you go."
        onChange={(e) => setDoc({ text: e.currentTarget.value, name })}
        onKeyDown={(e) => {
          if (e.key === "F5") {
            e.preventDefault();
            timeDate();
          }
        }}
      />
      <input
        ref={fileInput}
        type="file"
        accept=".txt,text/plain"
        hidden
        onChange={(e) => {
          open(e.currentTarget.files?.[0]);
          e.currentTarget.value = "";
        }}
      />
      <div className="statusbar card-status">
        <span>{name}.txt</span>
        <span>
          {lines} line{lines === 1 ? "" : "s"} · {text.length} char{text.length === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}

export default NotepadApp;
