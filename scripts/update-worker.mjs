import fs from 'fs';

let worker = fs.readFileSync('worker/index.ts', 'utf8');

const newUrlsWorker = \`  <url><loc>https://kidsmybook.com/blog/portfolio-vs-extracurriculars-hk-admissions</loc><lastmod>2026-09-18</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/top-talent-pass-first-year-portfolio</loc><lastmod>2026-09-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/international-school-interview-portfolio-highlight</loc><lastmod>2026-09-22</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/primary-school-door-knocking-portfolio-prep</loc><lastmod>2026-09-24</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/child-background-enhancement-hk</loc><lastmod>2026-09-26</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/mainland-parents-hk-international-schools-prep</loc><lastmod>2026-09-28</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/kids-publishing-a-book-hk-isbn</loc><lastmod>2026-09-30</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/university-professor-child-work-review</loc><lastmod>2026-10-02</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/children-project-based-learning-hk</loc><lastmod>2026-10-04</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://kidsmybook.com/blog/gifted-child-development-program-hk</loc><lastmod>2026-10-06</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
</urlset>\`;

worker = worker.replace('</urlset>', newUrlsWorker);
worker = worker.replace('xu-duo-butterfly-guide', 'hilary-butterfly-guide');

fs.writeFileSync('worker/index.ts', worker);
console.log("Worker updated");
