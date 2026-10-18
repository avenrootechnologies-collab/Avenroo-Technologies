import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What types of projects are the best fit?",
    answer:
      "Marketing sites, internal tools, customer-facing product surfaces, and automation workflows are all strong fits when the goal is clearer execution and a more professional result.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "Smaller focused launches can move in a few weeks. Broader builds with integrations, multiple flows, or ongoing collaboration naturally take longer. The timeline is set around scope, not guesswork.",
  },
  {
    question: "Can you work with an existing site or codebase?",
    answer:
      "Yes. If the existing foundation is salvageable, it is usually smarter to improve what already exists than to rebuild for the sake of starting over.",
  },
  {
    question: "Do you handle content and structure too?",
    answer:
      "Yes. Strong delivery usually includes content direction, information hierarchy, section planning, and call-to-action flow, not only visual styling.",
  },
  {
    question: "What happens after launch?",
    answer:
      "You can either stop at handoff or continue with an ongoing engagement for improvements, support, experiments, and feature refinement.",
  },
];

export default function FAQSection({ sectionId = "faq" }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id={sectionId} className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="eyebrow">FAQ</p>
          <h2 className="display-font mt-4 text-4xl leading-tight text-[var(--text-strong)] sm:text-5xl">
            Practical answers before the project starts.
          </h2>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className="surface-panel rounded-[28px] p-2"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 rounded-[22px] px-5 py-5 text-left"
                >
                  <span className="text-lg font-semibold text-[var(--text-strong)]">{faq.question}</span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-[var(--text-body)] transition ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="text-sm leading-7 text-[var(--text-body)]">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
