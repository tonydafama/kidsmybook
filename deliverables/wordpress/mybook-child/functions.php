<?php
if (!defined('ABSPATH')) {
  exit;
}

add_action('wp_enqueue_scripts', function () {
  wp_enqueue_style(
    'mybook-child-style',
    get_stylesheet_uri(),
    [],
    wp_get_theme()->get('Version')
  );
});

/**
 * Remove shipping fields when cart contains only virtual/downloadable items.
 */
add_filter('woocommerce_cart_needs_shipping', function ($needs_shipping) {
  if (!WC()->cart) {
    return $needs_shipping;
  }
  foreach (WC()->cart->get_cart() as $item) {
    $product = $item['data'] ?? null;
    if ($product && !$product->is_virtual()) {
      return true;
    }
  }
  return false;
});

/**
 * Redirect after checkout to thank-you page.
 */
add_filter('woocommerce_get_checkout_order_received_url', function ($url, $order) {
  $thank_you = home_url('/thank-you/');
  if ($order instanceof WC_Order) {
    return add_query_arg('order', $order->get_id(), $thank_you);
  }
  return $thank_you;
}, 10, 2);

/**
 * Disable comments sitewide for landing flow.
 */
add_action('init', function () {
  add_filter('comments_open', '__return_false', 20, 2);
  add_filter('pings_open', '__return_false', 20, 2);
});
