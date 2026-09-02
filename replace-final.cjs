const fs = require('fs');

const jsxPath = 'src/AiBookCreatorPage.tsx';
let jsx = fs.readFileSync(jsxPath, 'utf8');

const newJsx = `                  {/* Front Cover */}
                  <div className="b-front">
                    <div className="b-face f-front">
                      <img className="book-vol__cover-img" src={covers.front} alt="" draggable={false} />
                      {coverSource === "ai" ? (
                        <div className="book-cover-overlay book-cover-overlay--front">
                          <p className="book-cover-overlay__edition">MYBOOK · BESPOKE CHILD EDITION</p>
                          <h5 className="book-cover-overlay__title">{coverMeta.displayTitle}</h5>
                          <p className="book-cover-overlay__author">{coverMeta.subtitle}</p>
                          {coverMeta.bookTopic ? <p className="book-cover-overlay__tagline">{coverMeta.bookTopic}</p> : null}
                        </div>
                      ) : null}
                    </div>
                    <div className="b-face f-inner" />
                    <div className="b-face f-top" />
                    <div className="b-face f-bottom" />
                    <div className="b-face f-right" />
                  </div>

                  {/* Back Cover */}
                  <div className="b-back">
                    <div className="b-face f-front">
                      <img className="book-vol__cover-img" src={covers.back} alt="" draggable={false} />
                      {coverSource === "ai" ? (
                        <div className="book-cover-overlay book-cover-overlay--back">
                          <p className="book-cover-overlay__blurb">{coverMeta.backBlurb}</p>
                          <p className="book-cover-overlay__brand">MyBook Achievement Studio</p>
                        </div>
                      ) : null}
                    </div>
                    <div className="b-face f-inner" />
                    <div className="b-face f-top" />
                    <div className="b-face f-bottom" />
                    <div className="b-face f-right" />
                  </div>

                  {/* Pages */}
                  <div className="b-pages">
                    <div className="b-face f-top" />
                    <div className="b-face f-bottom" />
                    <div className="b-face f-right" />
                  </div>

                  {/* Spine */}
                  <div className="b-face b-spine" />`;

const startIdxJsx = jsx.indexOf('{/* Spine */}');
const endIdxJsx = jsx.indexOf('</div>\n                <div className="book-vol__shadow"');

if (startIdxJsx !== -1 && endIdxJsx !== -1) {
  jsx = jsx.substring(0, startIdxJsx) + newJsx + '\n                ' + jsx.substring(endIdxJsx);
  fs.writeFileSync(jsxPath, jsx);
  console.log('JSX Replaced successfully');
} else {
  console.log('JSX markers not found');
}

const cssPath = 'src/styles.css';
let css = fs.readFileSync(cssPath, 'utf8');

const newCss = `/* CSS 3D book — Mathematically perfect box model */
.book-vol {
  --w: 320px;
  --h: 440px;
  --dp: 28px;
  --dc: 8px;
  --inset-x: 4px;
  --inset-y: 6px;

  --board-bg: #2a1f42;
  --paper-1: #fdfbf7;
  --paper-2: #f0ebe1;
  --paper-3: #e6dfd1;

  --paper-pattern-y: repeating-linear-gradient(to bottom, var(--paper-1) 0 1px, var(--paper-2) 1px 2.5px, var(--paper-3) 2.5px 4px);
  --paper-pattern-x: repeating-linear-gradient(to right, var(--paper-1) 0 1px, var(--paper-2) 1px 2.5px, var(--paper-3) 2.5px 4px);

  position: relative;
  width: var(--w);
  height: var(--h);
  transform-style: preserve-3d;
  touch-action: none;
  user-select: none;
  cursor: grab;
}

.book-vol--dragging,
.book-vol:active {
  cursor: grabbing;
}

.book-vol__rig {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform: rotateX(var(--rx, 10deg)) rotateY(var(--ry, -30deg));
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.book-vol--dragging .book-vol__rig {
  transition: none;
}

.b-face {
  position: absolute;
  box-sizing: border-box;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* --- FRONT COVER --- */
.b-front {
  position: absolute;
  inset: 0;
  transform: translateZ(calc(var(--dp) / 2 + var(--dc) / 2));
  transform-style: preserve-3d;
}
.b-front .f-front {
  width: 100%; height: 100%;
  transform: translateZ(calc(var(--dc) / 2));
  border-radius: 0 4px 4px 0;
  background: var(--board-bg);
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.3);
}
.b-front .f-inner {
  width: 100%; height: 100%;
  transform: translateZ(calc(var(--dc) / -2)) rotateY(180deg);
  border-radius: 4px 0 0 4px;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
}
.b-front .f-top {
  width: 100%; height: var(--dc);
  top: calc(var(--dc) / -2);
  transform: rotateX(90deg);
  background: var(--board-bg);
}
.b-front .f-bottom {
  width: 100%; height: var(--dc);
  bottom: calc(var(--dc) / -2);
  transform: rotateX(-90deg);
  background: var(--board-bg);
}
.b-front .f-right {
  width: var(--dc); height: 100%;
  right: calc(var(--dc) / -2);
  transform: rotateY(90deg);
  background: var(--board-bg);
}

/* --- BACK COVER --- */
.b-back {
  position: absolute;
  inset: 0;
  transform: translateZ(calc((var(--dp) / 2 + var(--dc) / 2) * -1)) rotateY(180deg);
  transform-style: preserve-3d;
}
.b-back .f-front {
  width: 100%; height: 100%;
  transform: translateZ(calc(var(--dc) / 2));
  border-radius: 0 4px 4px 0;
  background: var(--board-bg);
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
}
.b-back .f-inner {
  width: 100%; height: 100%;
  transform: translateZ(calc(var(--dc) / -2)) rotateY(180deg);
  border-radius: 4px 0 0 4px;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
}
.b-back .f-top {
  width: 100%; height: var(--dc);
  top: calc(var(--dc) / -2);
  transform: rotateX(90deg);
  background: var(--board-bg);
}
.b-back .f-bottom {
  width: 100%; height: var(--dc);
  bottom: calc(var(--dc) / -2);
  transform: rotateX(-90deg);
  background: var(--board-bg);
}
.b-back .f-right {
  width: var(--dc); height: 100%;
  right: calc(var(--dc) / -2);
  transform: rotateY(90deg);
  background: var(--board-bg);
}

/* --- SPINE --- */
.b-spine {
  width: calc(var(--dp) + var(--dc) * 2);
  height: 100%;
  left: calc((var(--dp) + var(--dc) * 2) / -2);
  transform: rotateY(-90deg);
  background: linear-gradient(90deg, #120e1a 0%, #2a1f42 20%, #3d2f5c 50%, #2a1f42 80%, #120e1a 100%);
  box-shadow: inset 0 0 8px rgba(0,0,0,0.5);
}

/* --- PAGES --- */
.b-pages {
  position: absolute;
  width: calc(var(--w) - var(--inset-x));
  height: calc(var(--h) - var(--inset-y) * 2);
  left: 0;
  top: var(--inset-y);
  transform-style: preserve-3d;
}
.b-pages .f-top {
  width: 100%; height: var(--dp);
  top: calc(var(--dp) / -2);
  transform: rotateX(90deg);
  background: var(--paper-pattern-y);
}
.b-pages .f-bottom {
  width: 100%; height: var(--dp);
  bottom: calc(var(--dp) / -2);
  transform: rotateX(-90deg);
  background: var(--paper-pattern-y);
}
.b-pages .f-right {
  width: var(--dp); height: 100%;
  right: calc(var(--dp) / -2);
  transform: rotateY(90deg);
  background: var(--paper-pattern-x);
}

/* OVERLAYS & IMAGES */
.book-vol__cover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
  border-radius: inherit;
}

.book-cover-overlay {
  position: absolute;
  inset: auto 0 0 0;
  z-index: 2;
  width: 100%;
  padding: 14px 16px 18px;
  background: linear-gradient(180deg, rgba(8, 6, 14, 0) 0%, rgba(8, 6, 14, 0.55) 38%, rgba(8, 6, 14, 0.88) 100%);
  color: #fff;
  pointer-events: none;
  border-radius: inherit;
}

.book-cover-overlay--back {
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 16px 18px;
  background: linear-gradient(180deg, rgba(8, 6, 14, 0.25) 0%, rgba(8, 6, 14, 0.72) 55%, rgba(8, 6, 14, 0.92) 100%);
}

.book-cover-overlay__edition {
  margin: 0 0 8px;
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(232, 203, 154, 0.92);
}

.book-cover-overlay__title {
  margin: 0;
  font-family: var(--font-serif, Georgia, serif);
  font-size: clamp(14px, 3.2vw, 20px);
  line-height: 1.15;
  font-weight: 700;
}

.book-cover-overlay__author {
  margin: 6px 0 0;
  font-size: 11px;
  opacity: 0.92;
}

.book-cover-overlay__tagline {
  margin: 8px 0 0;
  font-size: 10px;
  color: rgba(232, 203, 154, 0.88);
}

.book-cover-overlay__blurb {
  margin: 0;
  font-size: 10px;
  line-height: 1.55;
  opacity: 0.94;
}

.book-cover-overlay__brand {
  margin: 12px 0 0;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(232, 203, 154, 0.85);
}

/* SHADOW */
.book-vol__shadow {
  position: absolute;
  left: 5%;
  right: 5%;
  bottom: -40px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  filter: blur(20px);
  transform: rotateX(90deg) translateZ(-30px);
  pointer-events: none;
}`;

const startIdxCss = css.indexOf('/* CSS 3D book');
const endIdxCss = css.indexOf('.final-cta {');

if (startIdxCss !== -1 && endIdxCss !== -1) {
  css = css.substring(0, startIdxCss) + newCss + '\n\n' + css.substring(endIdxCss);
  fs.writeFileSync(cssPath, css);
  console.log('CSS Replaced successfully');
} else {
  console.log('CSS markers not found');
}
