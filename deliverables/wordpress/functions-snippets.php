<?php
/**
 * MyBook helper snippets for WordPress.
 * Paste into your active theme functions.php (or a custom plugin).
 */

if (!defined('ABSPATH')) {
  exit;
}

/**
 * Register custom post types.
 */
add_action('init', function () {
  register_post_type('case_study', [
    'labels' => [
      'name' => 'Case Studies',
      'singular_name' => 'Case Study',
    ],
    'public' => true,
    'show_in_rest' => true,
    'has_archive' => true,
    'rewrite' => ['slug' => 'case-studies'],
    'supports' => ['title', 'editor', 'thumbnail', 'excerpt'],
  ]);

  register_post_type('book_project', [
    'labels' => [
      'name' => 'Book Projects',
      'singular_name' => 'Book Project',
    ],
    'public' => true,
    'show_in_rest' => true,
    'has_archive' => true,
    'rewrite' => ['slug' => 'book-projects'],
    'supports' => ['title', 'editor', 'thumbnail', 'excerpt'],
  ]);
});

/**
 * Webhook endpoint option in general settings.
 */
add_action('admin_init', function () {
  register_setting('general', 'mybook_webhook_url', [
    'type' => 'string',
    'sanitize_callback' => 'esc_url_raw',
    'default' => '',
  ]);

  add_settings_field(
    'mybook_webhook_url',
    'MyBook Webhook URL',
    function () {
      $value = esc_attr(get_option('mybook_webhook_url', ''));
      echo '<input type="url" class="regular-text" name="mybook_webhook_url" value="' . $value . '" placeholder="https://example.com/webhook" />';
      echo '<p class="description">Fluent Forms + WooCommerce events will be sent here.</p>';
    },
    'general'
  );
});

function mybook_send_webhook($event_type, $data = []) {
  $url = get_option('mybook_webhook_url', '');
  if (!$url) {
    error_log('[MyBook] Webhook URL missing');
    return;
  }

  $payload = [
    'event_type' => $event_type,
    'timestamp' => current_time('mysql'),
    'source' => home_url(),
    'data' => $data,
  ];

  $response = wp_remote_post($url, [
    'timeout' => 15,
    'headers' => ['Content-Type' => 'application/json'],
    'body' => wp_json_encode($payload),
  ]);

  if (is_wp_error($response)) {
    error_log('[MyBook] Webhook failed: ' . $response->get_error_message());
  }
}

/**
 * Fluent Forms submission hook.
 * Adjust form ID if needed.
 */
add_action('fluentform_submission_inserted', function ($entryId, $formData, $form) {
  mybook_send_webhook('fluent_form_submitted', [
    'entry_id' => $entryId,
    'form_id' => isset($form->id) ? $form->id : null,
    'parent_name' => $formData['parent_name'] ?? '',
    'child_name' => $formData['child_name'] ?? '',
    'child_age' => $formData['child_age'] ?? '',
    'whatsapp' => $formData['whatsapp'] ?? '',
    'email' => $formData['email'] ?? '',
    'story_idea' => $formData['story_idea'] ?? '',
    'preferred_language' => $formData['preferred_language'] ?? '',
  ]);
}, 10, 3);

/**
 * WooCommerce new order hook.
 */
add_action('woocommerce_new_order', function ($order_id) {
  if (!$order_id) {
    return;
  }

  $order = wc_get_order($order_id);
  if (!$order) {
    return;
  }

  mybook_send_webhook('woo_new_order', [
    'order_id' => $order->get_id(),
    'order_number' => $order->get_order_number(),
    'currency' => $order->get_currency(),
    'total' => $order->get_total(),
    'status' => $order->get_status(),
    'billing_name' => trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name()),
    'billing_email' => $order->get_billing_email(),
    'billing_phone' => $order->get_billing_phone(),
  ]);
});
