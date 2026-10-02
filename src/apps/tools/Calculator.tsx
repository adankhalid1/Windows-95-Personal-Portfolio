import { useState } from "react";
import { useWindowKeys } from "../../hooks/useWindowKeys";

type Op = "+" | "-" | "*" | "/";

interface CalcState {
  display: string;
  /** The left-hand side waiting for the next number. */
  acc: number | null;
  op: Op | null;
  /** True right after an operator or "=": the next digit starts a new number. */
  fresh: boolean;
  memory: number;
  error: boolean;
}

const START: CalcState = { display: "0", acc: null, op: null, fresh: true, memory: 0, error: false };

/** Formats like the original: up to 16 significant digits, no trailing junk. */
function format(n: number): string {
  if (!Number.isFinite(n)) return "Cannot divide by zero";
  const s = Number(n.toPrecision(16)).toString();
  return s.length > 20 ? n.toExponential(10) : s;
}

function apply(a: number, op: Op, b: number): number {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  return a / b;
}

function Calculator() {
  const [s, setS] = useState<CalcState>(START);
  const value = Number(s.display);

  const update = (patch: Partial<CalcState>) => setS((prev) => ({ ...prev, ...patch }));
  const result = (n: number) =>
    Number.isFinite(n) ? { display: format(n), error: false } : { display: format(n), error: true };

  const digit = (d: string) => {
    if (s.error) return setS({ ...START, memory: s.memory, display: d === "." ? "0." : d, fresh: false });
    if (s.fresh) return update({ display: d === "." ? "0." : d, fresh: false });
    if (d === "." && s.display.includes(".")) return;
    if (s.display.replace(/[-.]/g, "").length >= 16) return;
    update({ display: s.display === "0" && d !== "." ? d : s.display + d });
  };

  const operator = (op: Op) => {
    if (s.error) return;
    // Chained operations evaluate left to right, as on the original.
    const acc = s.acc !== null && s.op && !s.fresh ? apply(s.acc, s.op, value) : s.acc ?? value;
    setS({ ...s, ...result(acc), acc, op, fresh: true });
  };

  const equals = () => {
    if (s.error || s.acc === null || !s.op) return;
    const n = apply(s.acc, s.op, value);
    setS({ ...s, ...result(n), acc: null, op: null, fresh: true });
  };

  const unary = (fn: (n: number) => number) => {
    if (s.error) return;
    setS({ ...s, ...result(fn(value)), fresh: true });
  };

  const press = (key: string) => {
    if (/^[0-9.]$/.test(key)) return digit(key);
    if (key === "+" || key === "-" || key === "*" || key === "/") return operator(key);
    if (key === "=") return equals();
    if (key === "C") return setS({ ...START, memory: s.memory });
    if (key === "CE") return update({ display: "0", fresh: true, error: false });
    if (key === "Back") {
      if (s.fresh || s.error) return;
      const d = s.display.slice(0, -1);
      return update({ display: d === "" || d === "-" ? "0" : d });
    }
    if (key === "+/-") return update({ display: format(-value) });
    if (key === "sqrt") return unary((n) => (n < 0 ? NaN : Math.sqrt(n)));
    if (key === "1/x") return unary((n) => 1 / n);
    // % works like the original: a percentage of the number you're working with.
    if (key === "%") return unary((n) => ((s.acc ?? 0) * n) / 100);
    if (key === "MC") return update({ memory: 0 });
    if (key === "MR") return update({ display: format(s.memory), fresh: true });
    if (key === "MS") return update({ memory: value, fresh: true });
    if (key === "M+") return update({ memory: s.memory + value, fresh: true });
  };

  useWindowKeys((e) => {
    const map: Record<string, string> = {
      Enter: "=",
      "=": "=",
      Escape: "C",
      Delete: "CE",
      Backspace: "Back",
      ",": ".",
    };
    const key = map[e.key] ?? e.key;
    if (/^[0-9.+\-*/=]$/.test(key) || ["C", "CE", "Back"].includes(key)) {
      e.preventDefault();
      press(key);
    }
  });

  const btn = (label: string, key = label, cls = "") => (
    <button key={label} className={`win-btn calc-btn ${cls}`} onClick={() => press(key)}>
      {label}
    </button>
  );

  return (
    <div className="calculator">
      <div className="calc-display" role="status" aria-label="Display">
        {s.display}
      </div>
      <div className="calc-top">
        <span className="calc-mem">{s.memory !== 0 ? "M" : ""}</span>
        {btn("Backspace", "Back", "red")}
        {btn("CE", "CE", "red")}
        {btn("C", "C", "red")}
      </div>
      <div className="calc-grid">
        {btn("MC", "MC", "red")}
        {btn("7", "7", "blue")}
        {btn("8", "8", "blue")}
        {btn("9", "9", "blue")}
        {btn("/", "/", "red")}
        {btn("sqrt", "sqrt", "blue")}
        {btn("MR", "MR", "red")}
        {btn("4", "4", "blue")}
        {btn("5", "5", "blue")}
        {btn("6", "6", "blue")}
        {btn("*", "*", "red")}
        {btn("%", "%", "blue")}
        {btn("MS", "MS", "red")}
        {btn("1", "1", "blue")}
        {btn("2", "2", "blue")}
        {btn("3", "3", "blue")}
        {btn("-", "-", "red")}
        {btn("1/x", "1/x", "blue")}
        {btn("M+", "M+", "red")}
        {btn("0", "0", "blue")}
        {btn("+/-", "+/-", "blue")}
        {btn(".", ".", "blue")}
        {btn("+", "+", "red")}
        {btn("=", "=", "red")}
      </div>
    </div>
  );
}

export default Calculator;
