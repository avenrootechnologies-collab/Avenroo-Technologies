import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const VISIBILITY_OFFSET = 420;

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > VISIBILITY_OFFSET);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`scroll-top-button ${visible ? "is-visible" : ""}`}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}
