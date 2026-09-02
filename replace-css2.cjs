const fs = require('fs');

const cssPath = 'src/styles.css';
let css = fs.readFileSync(cssPath, 'utf8');

const newCss = `/* CSS 3D book — Redesigned for realistic thick hardcover */
.book-vol {
  --w: 320px;
  --h: 440px;
  --pages-d: 32px;
  --cover-d: 6px;
  --book-d: calc(var(--pages-d) + var(--cover-d) * 2);
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
.b-front-outer {
  top: 0; left: 0;
  width: var(--w); height: var(--h);
  transform: translateZ(calc(var(--pages-d) / 2 + var(--cover-d)));
  border-radius: 0 4px 4px 0;
  background: var(--board-bg);
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.3);
}
.b-front-inner {
  top: 0; left: 0;
  width: var(--w); height: var(--h);
  transform: translateZ(calc(var(--pages-d) / 2)) rotateY(180deg);
  border-radius: 4px 0 0 4px;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
}
.b-front-top {
  left: 0;
  width: var(--w); height: var(--cover-d);
  top: 0; transform-origin: top;
  transform: translateZ(calc(var(--pages-d) / 2 + var(--cover-d))) rotateX(-90deg);
  background: var(--board-bg);
}
.b-front-bottom {
  left: 0;
  width: var(--w); height: var(--cover-d);
  bottom: 0; transform-origin: bottom;
  transform: translateZ(calc(var(--pages-d) / 2 + var(--cover-d))) rotateX(90deg);
  background: var(--board-bg);
}
.b-front-right {
  top: 0;
  width: var(--cover-d); height: var(--h);
  right: 0; transform-origin: right;
  transform: translateZ(calc(var(--pages-d) / 2 + var(--cover-d))) rotateY(90deg);
  background: var(--board-bg);
}

/* --- BACK COVER --- */
.b-back-outer {
  top: 0; left: 0;
  width: var(--w); height: var(--h);
  transform: translateZ(calc(var(--pages-d) / -2 - var(--cover-d))) rotateY(180deg);
  border-radius: 4px 0 0 4px;
  background: var(--board-bg);
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
}
.b-back-inner {
  top: 0; left: 0;
  width: var(--w); height: var(--h);
  transform: translateZ(calc(var(--pages-d) / -2));
  border-radius: 0 4px 4px 0;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
}
.b-back-top {
  left: 0;
  width: var(--w); height: var(--cover-d);
  top: 0; transform-origin: top;
  transform: translateZ(calc(var(--pages-d) / -2)) rotateX(-90deg);
  background: var(--board-bg);
}
.b-back-bottom {
  left: 0;
  width: var(--w); height: var(--cover-d);
  bottom: 0; transform-origin: bottom;
  transform: translateZ(calc(var(--pages-d) / -2)) rotateX(90deg);
  background: var(--board-bg);
}
.b-back-right {
  top: 0;
  width: var(--cover-d); height: var(--h);
  right: 0; transform-origin: right;
  transform: translateZ(calc(var(--pages-d) / -2)) rotateY(90deg);
  background: var(--board-bg);
}

/* --- SPINE --- */
.b-spine {
  top: 0;
  width: var(--book-d); height: var(--h);
  left: 0; transform-origin: left;
  transform: translateZ(calc(var(--pages-d) / 2 + var(--cover-d))) rotateY(-90deg);
  background: linear-gradient(90deg, #120e1a 0%, #2a1f42 20%, #3d2f5c 50%, #2a1f42 80%, #120e1a 100%);
  box-shadow: inset 0 0 8px rgba(0,0,0,0.5);
}

/* --- PAGES --- */
.b-pages-top {
  left: var(--inset-x);
  width: calc(var(--w) - var(--inset-x)); height: var(--pages-d);
  top: var(--inset-y); transform-origin: top;
  transform: translateZ(calc(var(--pages-d) / 2)) rotateX(-90deg);
  background: var(--paper-pattern-y);
}
.b-pages-bottom {
  left: var(--inset-x);
  width: calc(var(--w) - var(--inset-x)); height: var(--pages-d);
  bottom: var(--inset-y); transform-origin: bottom;
  transform: translateZ(calc(var(--pages-d) / 2)) rotateX(90deg);
  background: var(--paper-pattern-y);
}
.b-pages-right {
  width: var(--pages-d); height: calc(var(--h) - var(--inset-y) * 2);
  right: var(--inset-x); top: var(--inset-y); transform-origin: right;
  transform: translateZ(calc(var(--pages-d) / 2)) rotateY(90deg);
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

const startIdx = css.indexOf('/* CSS 3D book');
const endIdx = css.indexOf('.final-cta {');

if (startIdx !== -1 && endIdx !== -1) {
  css = css.substring(0, startIdx) + newCss + '\n\n' + css.substring(endIdx);
  fs.writeFileSync(cssPath, css);
  console.log('CSS Replaced successfully');
} else {
  console.log('Could not find markers');
}
