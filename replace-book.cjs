const fs = require("fs");
const cssPath = "src/styles.css";
let css = fs.readFileSync(cssPath, "utf8");

const newCss = `/* CSS 3D book — 6-face box, faces centered then translateZ */
.book-vol {
  --w: 300px;
  --h: 420px;
  --d: 44px;
  --d2: calc(var(--d) / 2);
  --w2: calc(var(--w) / 2);
  --h2: calc(var(--h) / 2);
  --board: 8px;
  --board-c: #1a1426;
  --paper-a: #fbf7ef;
  --paper-b: #eee6d8;
  --paper-c: #d8cfbf;
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
  transform: rotateX(var(--rx, 12deg)) rotateY(var(--ry, -28deg));
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.book-vol--dragging .book-vol__rig {
  transition: none;
}

.book-vol__face {
  position: absolute;
  box-sizing: border-box;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.book-vol__face--front,
.book-vol__face--back {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #16101f;
}

.book-vol__face--front {
  transform: rotateY(0deg) translateZ(var(--d2));
  border-radius: 0 3px 3px 0;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
}

.book-vol__face--back {
  transform: rotateY(180deg) translateZ(var(--d2));
  border-radius: 3px 0 0 3px;
}

.book-vol__face--spine {
  top: 0;
  left: calc(50% - var(--d) / 2);
  width: var(--d);
  height: 100%;
  transform: rotateY(-90deg) translateZ(var(--w2));
  background: linear-gradient(
    90deg,
    #0c0a10 0%,
    #241832 16%,
    #4a3568 48%,
    #c8a874 52%,
    #4a3568 56%,
    #241832 84%,
    #0c0a10 100%
  );
}

.book-vol__face--fore {
  top: 0;
  left: calc(50% - var(--d) / 2);
  width: var(--d);
  height: 100%;
  transform: rotateY(90deg) translateZ(var(--w2));
  background:
    linear-gradient(
      to right,
      var(--board-c) 0 var(--board),
      transparent var(--board) calc(100% - var(--board)),
      var(--board-c) calc(100% - var(--board)) 100%
    ),
    repeating-linear-gradient(
      to right,
      var(--paper-a) 0 1.4px,
      var(--paper-b) 1.4px 2.8px,
      var(--paper-c) 2.8px 4.2px
    );
}

.book-vol__face--top,
.book-vol__face--bottom {
  left: 0;
  top: calc(50% - var(--d) / 2);
  width: 100%;
  height: var(--d);
  background:
    linear-gradient(
      to bottom,
      var(--board-c) 0 var(--board),
      transparent var(--board) calc(100% - var(--board)),
      var(--board-c) calc(100% - var(--board)) 100%
    ),
    repeating-linear-gradient(
      to bottom,
      var(--paper-a) 0 1.4px,
      var(--paper-b) 1.4px 2.8px,
      var(--paper-c) 2.8px 4.2px
    );
}

.book-vol__face--top {
  transform: rotateX(90deg) translateZ(var(--h2));
}

.book-vol__face--bottom {
  transform: rotateX(-90deg) translateZ(var(--h2));
}

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

.book-vol__shadow {
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: -36px;
  height: 44px;
  border-radius: 999px;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.55), transparent 72%);
  filter: blur(12px);
  pointer-events: none;
  z-index: -1;
}

`;

const startIdx = css.indexOf("/* CSS 3D book");
const endIdx = css.indexOf(".final-cta {");
if (startIdx === -1 || endIdx === -1) {
  console.error("markers not found", startIdx, endIdx);
  process.exit(1);
}
css = css.slice(0, startIdx) + newCss + "\n" + css.slice(endIdx);
fs.writeFileSync(cssPath, css);
console.log("CSS book block replaced");
