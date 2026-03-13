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

function wpnuxt_revalidate_cache($post_id) {
    if (!defined('WPNUXT_FRONTEND_URL') || !defined('WPNUXT_REVALIDATE_SECRET')) {
        return;
    }

    // Skip revisions and autosaves — only revalidate for actual content changes
    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }

    // Debounce: only fire once per request cycle
    if (did_action('wpnuxt_revalidation_sent')) {
        return;
    }
    do_action('wpnuxt_revalidation_sent');

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
