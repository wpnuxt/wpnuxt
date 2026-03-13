<?php
/**
 * WPNuxt Cache Revalidation
 *
 * Notifies the Nuxt frontend to purge its GraphQL cache when content changes.
 * Copy this file to your WordPress mu-plugins directory.
 *
 * Required constants in wp-config.php:
 *   define('WPNUXT_FRONTEND_URL', 'https://your-nuxt-app.vercel.app');
 *   define('WPNUXT_REVALIDATE_SECRET', 'your-secret');
 */

if (!defined('ABSPATH')) {
    exit;
}

function wpnuxt_revalidate_cache() {
    if (!defined('WPNUXT_FRONTEND_URL') || !defined('WPNUXT_REVALIDATE_SECRET')) {
        return;
    }

    $url = rtrim(WPNUXT_FRONTEND_URL, '/') . '/api/_wpnuxt/revalidate';

    wp_remote_post($url, [
        'blocking' => false,
        'headers'  => ['Content-Type' => 'application/json'],
        'body'     => wp_json_encode(['secret' => WPNUXT_REVALIDATE_SECRET]),
        'timeout'  => 5,
    ]);
}

add_action('wp_after_insert_post', 'wpnuxt_revalidate_cache');
add_action('before_delete_post', 'wpnuxt_revalidate_cache');
add_action('wp_trash_post', 'wpnuxt_revalidate_cache');
