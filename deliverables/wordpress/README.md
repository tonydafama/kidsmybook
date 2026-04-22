# MyBook WordPress Deliverables

## What is included

- `functions-snippets.php`  
  Custom post types + webhook hooks + admin webhook URL setting.
- `mybook-3d-preview/`  
  Upload as plugin folder, then use shortcode:
  `[mybook_3d_preview pages="url1,url2,url3" title="Book Preview"]`
- `mybook-intake-form.json`  
  Fluent Forms field schema reference.
- `mybook-child/`  
  Child theme starter with checkout redirect and virtual-product shipping removal.
- `redirects-htaccess-snippet.txt`  
  Marketing redirect shortcuts.
- `page-copy-blocks.md`  
  Copy blocks for `/apply`, `/deposit`, FAQ.

## Suggested import order

1. Activate base plugins
2. Add `functions-snippets.php`
3. Upload child theme and activate
4. Upload `mybook-3d-preview` plugin and activate
5. Create pages and paste copy blocks
6. Create WooCommerce deposit product (HKD 500)
7. Run launch-night QA checklist
