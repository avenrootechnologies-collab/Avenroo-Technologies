import { useEffect, useState } from "react";

export default function Spotlight() {
  const [position, setPosition] = useState({ x: 220, y: 160 });

  useEffect(() => {
    const handleMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMove);

    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `radial-gradient(32rem circle at ${position.x}px ${position.y}px, var(--spotlight), transparent 46%)`,
        }}
      />
      <div
        className="absolute left-[-8rem] top-[-5rem] h-72 w-72 rounded-full blur-3xl"
        style={{ background: "var(--orb-mint)" }}
      />
      <div
        className="absolute right-[-6rem] top-[7rem] h-80 w-80 rounded-full blur-3xl"
        style={{ background: "var(--orb-coral)" }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, var(--line-strong), transparent)" }}
      />
    </div>
  );
}
