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
      boldPhrases.forEach((phrase) => {
        if (phrase) {
          result = result.replace(
            new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"),
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
          <div className="ad-mockup">Mockup</div>
          <div className="ad-logo">
            <div>🎯 AdGen</div>
            <div style={{ fontSize: 16, opacity: 0.6 }}>adgen.app</div>
          </div>
        </div>
      </div>
    );
  },
);

AdCanvas.displayName = "AdCanvas";
export default AdCanvas;
