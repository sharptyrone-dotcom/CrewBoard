'use client';

import { useState, useRef, useEffect } from 'react';

// A single accordion row. Split out so each item owns its own content-ref
// and measured height — the parent just tracks which index is open.
function FAQItem({ question, answer, isOpen, onToggle, id }) {
  const contentRef = useRef(null);
  // `measuredHeight` is the rendered height of the answer panel in px.
  // We measure after the content mounts (and after resize) so the
  // max-height transition has a concrete target — setting max-height
  // to 'none' doesn't animate, and a hard-coded value clips long answers.
  const [measuredHeight, setMeasuredHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    const update = () => setMeasuredHeight(el.scrollHeight);
    update();
    // Re-measure when fonts load or the viewport changes width (which
    // reflows the answer text to a new height).
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (ro) ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [answer]);

  const panelId = `faq-panel-${id}`;
  const buttonId = `faq-button-${id}`;

  return (
    <div className="faq-acc-item">
      <button
        id={buttonId}
        type="button"
        className="faq-acc-trigger"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="faq-acc-question">{question}</span>
        <span className={`faq-acc-chevron${isOpen ? ' is-open' : ''}`} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="faq-acc-panel"
        // Inline max-height is how the 200ms ease transition animates.
        // When closed we clamp to 0; when open we pin to the measured
        // scrollHeight. The CSS handles the transition timing.
        style={{ maxHeight: isOpen ? `${measuredHeight}px` : 0 }}
        aria-hidden={!isOpen}
      >
        <div ref={contentRef} className="faq-acc-answer">
          {typeof answer === 'string' ? <p>{answer}</p> : answer}
        </div>
      </div>
    </div>
  );
}

// Reusable FAQ accordion. Accepts `items` as an array of
// { question, answer } where `answer` can be a string or ReactNode.
// Only one item is open at a time — click the open one again to close it.
//
// The component has no outer chrome: the parent controls the wrapper so
// this drops into any existing FAQ section without fighting layout.
export default function FAQAccordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(-1);

  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="faq-acc-wrap">
      {items.map((item, i) => (
        <FAQItem
          key={i}
          id={i}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
        />
      ))}
    </div>
  );
}
