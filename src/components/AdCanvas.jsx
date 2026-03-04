import { forwardRef } from "react";
import "../styles/ad.css";

const AdCanvas = forwardRef(
  (
    {
      bg,
      accent,
      badge,
      headlineStart,
      headlineHighlight,
      subtext,
      boldPhrases = [],
    },
    ref,
  ) => {
    const renderSubtext = () => {
      let result = subtext || "";

      // 1. Convert markdown **bold** syntax to <strong> tags
      result = result.replace(
        /\*\*(.+?)\*\*/g,
        '<strong style="color:#f0f0f5">$1</strong>'
      );

      // 2. Also apply boldPhrases replacements (if any remain unhighlighted)
      boldPhrases.forEach((phrase) => {
        if (phrase) {
          // Skip if already wrapped in <strong>
          const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          result = result.replace(
            new RegExp(`(?!<strong[^>]*>)${escaped}(?!</strong>)`, "gi"),
            `<strong style="color:#f0f0f5">${phrase}</strong>`,
          );
        }
      });

      return { __html: result };
    };

    return (
      <div
        ref={ref}
        className="ad-canvas"
        style={{ "--ad-bg": bg, "--ad-accent": accent }}
      >
        <div className="ad-canvas-noise" />
        {badge && <div className="ad-badge">{badge}</div>}
        <div className="ad-headline">
          <span className="ad-headline-start">{headlineStart}</span>
          <span className="ad-headline-highlight">{headlineHighlight}</span>
        </div>
        <p className="ad-subtext" dangerouslySetInnerHTML={renderSubtext()} />
        <div className="ad-footer">
          <div className="ad-mockup">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div className="ad-logo">
            <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              AdGen
            </div>
            <div style={{ fontSize: 16, opacity: 0.6 }}>adgen.app</div>
          </div>
        </div>
      </div>
    );
  },
);

AdCanvas.displayName = "AdCanvas";
export default AdCanvas;
