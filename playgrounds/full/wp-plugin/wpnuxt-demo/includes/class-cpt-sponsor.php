<?php

namespace WPNuxt_Demo;

/**
 * Sponsor CPT — a deliberately minimal CPT for demonstrating the WPNuxt
 * auto-generation feature. No ACF, no custom taxonomies, no custom where
 * args — just the standard WordPress surfaces (title, editor, excerpt,
 * thumbnail). Registering this on the backend is enough for WPNuxt to
 * emit `useSponsors()`, `useSponsorByUri()` and `useSponsorBySlug()`
 * composables with no hand-written GraphQL.
 */
class CPT_Sponsor
{
    public static function register(): void
    {
        register_post_type('sponsor', [
            'labels' => [
                'name'               => __('Sponsors', 'wpnuxt-demo'),
                'singular_name'      => __('Sponsor', 'wpnuxt-demo'),
                'add_new'            => __('Add New Sponsor', 'wpnuxt-demo'),
                'add_new_item'       => __('Add New Sponsor', 'wpnuxt-demo'),
                'edit_item'          => __('Edit Sponsor', 'wpnuxt-demo'),
                'new_item'           => __('New Sponsor', 'wpnuxt-demo'),
                'view_item'          => __('View Sponsor', 'wpnuxt-demo'),
                'search_items'       => __('Search Sponsors', 'wpnuxt-demo'),
                'not_found'          => __('No sponsors found', 'wpnuxt-demo'),
                'not_found_in_trash' => __('No sponsors found in Trash', 'wpnuxt-demo'),
                'all_items'          => __('All Sponsors', 'wpnuxt-demo'),
                'menu_name'          => __('Sponsors', 'wpnuxt-demo'),
            ],
            'public'              => true,
            'has_archive'         => true,
            'rewrite'             => ['slug' => 'sponsors'],
            'menu_icon'           => 'dashicons-awards',
            'menu_position'       => 6,
            'supports'            => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
            'show_in_rest'        => true,
            'show_in_graphql'     => true,
            'graphql_single_name' => 'Sponsor',
            'graphql_plural_name' => 'Sponsors',
        ]);
    }
}
