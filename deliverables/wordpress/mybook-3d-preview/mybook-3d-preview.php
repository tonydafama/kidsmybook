<?php
/**
 * Plugin Name: MyBook 3D Preview
 * Description: 3D page preview shortcode for MyBook publishing demos.
 * Version: 1.0.0
 * Author: MyBook
 */

if (!defined('ABSPATH')) {
  exit;
}

define('MYBOOK_3D_PREVIEW_URL', plugin_dir_url(__FILE__));
define('MYBOOK_3D_PREVIEW_PATH', plugin_dir_path(__FILE__));

add_action('wp_enqueue_scripts', function () {
  wp_register_style(
    'mybook-3d-preview-style',
    MYBOOK_3D_PREVIEW_URL . 'assets/css/style.css',
    [],
    '1.0.0'
  );

  wp_register_script(
    'mybook-3d-preview-turnjs',
    'https://cdnjs.cloudflare.com/ajax/libs/turn.js/3/turn.min.js',
    ['jquery'],
    '3.0.0',
    true
  );

  wp_register_script(
    'mybook-3d-preview-viewer',
    MYBOOK_3D_PREVIEW_URL . 'assets/js/viewer.js',
    ['jquery', 'mybook-3d-preview-turnjs'],
    '1.0.0',
    true
  );
});

add_shortcode('mybook_3d_preview', function ($atts) {
  $atts = shortcode_atts([
    'pages' => '',
    'title' => 'MyBook Preview',
  ], $atts, 'mybook_3d_preview');

  $pages = array_filter(array_map('trim', explode(',', $atts['pages'])));
  if (empty($pages)) {
    return '<p class="mybook-empty">No pages provided for preview.</p>';
  }

  wp_enqueue_style('mybook-3d-preview-style');
  wp_enqueue_script('mybook-3d-preview-turnjs');
  wp_enqueue_script('mybook-3d-preview-viewer');

  $id = 'mybook-preview-' . wp_rand(1000, 9999);

  ob_start();
  ?>
  <div class="mybook-3d-wrapper" id="<?php echo esc_attr($id); ?>">
    <h3 class="mybook-3d-title"><?php echo esc_html($atts['title']); ?></h3>
    <div class="mybook-3d-book">
      <?php foreach ($pages as $page) : ?>
        <div class="mybook-3d-page">
          <img src="<?php echo esc_url($page); ?>" alt="MyBook page preview" loading="lazy" />
        </div>
      <?php endforeach; ?>
    </div>
    <div class="mybook-3d-controls">
      <button type="button" class="mybook-btn prev">Prev</button>
      <span class="mybook-counter">1 / <?php echo count($pages); ?></span>
      <button type="button" class="mybook-btn next">Next</button>
      <button type="button" class="mybook-btn fullscreen">Fullscreen</button>
    </div>
  </div>
  <script>
    window.MyBookPreviewQueue = window.MyBookPreviewQueue || [];
    window.MyBookPreviewQueue.push({
      id: "<?php echo esc_js($id); ?>",
      pageCount: <?php echo (int) count($pages); ?>
    });
  </script>
  <?php
  return ob_get_clean();
});
