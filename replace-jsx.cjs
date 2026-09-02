const fs = require('fs');

const path = 'src/AiBookCreatorPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const newDom = `                  {/* Spine */}
                  <div className="b-face b-spine" aria-hidden />

                  {/* Back Cover */}
                  <div className="b-face b-back-outer">
                    <img className="book-vol__cover-img" src={covers.back} alt="" draggable={false} />
                    {coverSource === "ai" ? (
                      <div className="book-cover-overlay book-cover-overlay--back">
                        <p className="book-cover-overlay__blurb">{coverMeta.backBlurb}</p>
                        <p className="book-cover-overlay__brand">MyBook Achievement Studio</p>
                      </div>
                    ) : null}
                  </div>
                  <div className="b-face b-back-inner" aria-hidden />
                  <div className="b-face b-back-top" aria-hidden />
                  <div className="b-face b-back-bottom" aria-hidden />
                  <div className="b-face b-back-right" aria-hidden />

                  {/* Pages */}
                  <div className="b-face b-pages-top" aria-hidden />
                  <div className="b-face b-pages-bottom" aria-hidden />
                  <div className="b-face b-pages-right" aria-hidden />

                  {/* Front Cover */}
                  <div className="b-face b-front-inner" aria-hidden />
                  <div className="b-face b-front-outer">
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
                  <div className="b-face b-front-top" aria-hidden />
                  <div className="b-face b-front-bottom" aria-hidden />
                  <div className="b-face b-front-right" aria-hidden />`;

const startIdx = code.indexOf('{/* Inner page block');
const endIdx = code.indexOf('</div>\n                </div>\n                <div className="book-vol__shadow"');

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newDom + '\n                ' + code.substring(endIdx + 7);
  fs.writeFileSync(path, code);
  console.log('JSX Replaced successfully');
} else {
  console.log('Could not find markers', startIdx, endIdx);
}
