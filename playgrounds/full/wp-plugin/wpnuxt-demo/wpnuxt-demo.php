<?php
/**
 * Plugin Name: WPNuxt Demo
 * Description: Registers Event custom post type with ACF fields and WPGraphQL support for the WPNuxt playground.
 * Version: 1.0.0
 * Author: WPNuxt
 * License: MIT
 * Text Domain: wpnuxt-demo
 * Requires PHP: 8.0
 * Requires at least: 6.4
 */

if (! defined('ABSPATH')) {
    exit;
}

define('WPNUXT_DEMO_PATH', plugin_dir_path(__FILE__));

require_once WPNUXT_DEMO_PATH . 'includes/class-cpt-event.php';
require_once WPNUXT_DEMO_PATH . 'includes/class-taxonomy-event-category.php';

// Register nav menu locations
add_action('after_setup_theme', function () {
    register_nav_menus([ 'primary' => 'Primary Menu' ]);
});

// Initialize CPT and taxonomy
add_action('init', function () {
    WPNuxt_Demo\CPT_Event::register();
    WPNuxt_Demo\Taxonomy_Event_Category::register();
});

// ACF Local JSON: load field groups from plugin's acf-json directory
add_filter('acf/settings/load_json', function ($paths) {
    $paths[] = WPNUXT_DEMO_PATH . 'acf-json';
    return $paths;
});

// Set ACF field groups to show in GraphQL by default
add_filter('acf/load_field_group', function ($field_group) {
    if (isset($field_group['key']) && strpos($field_group['key'], 'group_wpnuxt_demo') === 0) {
        $field_group['show_in_graphql'] = 1;
    }
    return $field_group;
});

// Add taxonomy filtering to Event connections in WPGraphQL
add_action('graphql_register_types', function () {
    register_graphql_field('RootQueryToEventConnectionWhereArgs', 'eventCategorySlug', [
        'type'        => 'String',
        'description' => __('Filter events by event category slug', 'wpnuxt-demo'),
    ]);
});

// Map custom where args to WP_Query tax_query
add_filter('graphql_post_object_connection_query_args', function ($query_args, $source, $args) {
    $where = $args['where'] ?? [];

    if (! empty($where['eventCategorySlug'])) {
        if (! isset($query_args['tax_query'])) {
            $query_args['tax_query'] = [];
        }
        $query_args['tax_query'][] = [
            'taxonomy' => 'event_category',
            'field'    => 'slug',
            'terms'    => $where['eventCategorySlug'],
        ];
    }

    return $query_args;
}, 10, 3);
