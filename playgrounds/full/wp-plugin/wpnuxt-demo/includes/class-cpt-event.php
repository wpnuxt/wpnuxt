<?php

namespace WPNuxt_Demo;

class CPT_Event
{
    public static function register(): void
    {
        register_post_type('event', [
            'labels' => [
                'name'               => __('Events', 'wpnuxt-demo'),
                'singular_name'      => __('Event', 'wpnuxt-demo'),
                'add_new'            => __('Add New Event', 'wpnuxt-demo'),
                'add_new_item'       => __('Add New Event', 'wpnuxt-demo'),
                'edit_item'          => __('Edit Event', 'wpnuxt-demo'),
                'new_item'           => __('New Event', 'wpnuxt-demo'),
                'view_item'          => __('View Event', 'wpnuxt-demo'),
                'search_items'       => __('Search Events', 'wpnuxt-demo'),
                'not_found'          => __('No events found', 'wpnuxt-demo'),
                'not_found_in_trash' => __('No events found in Trash', 'wpnuxt-demo'),
                'all_items'          => __('All Events', 'wpnuxt-demo'),
                'menu_name'          => __('Events', 'wpnuxt-demo'),
            ],
            'public'              => true,
            'has_archive'         => true,
            'rewrite'             => ['slug' => 'events'],
            'menu_icon'           => 'dashicons-calendar-alt',
            'menu_position'       => 5,
            'supports'            => ['title', 'editor', 'excerpt', 'thumbnail', 'custom-fields', 'revisions'],
            'show_in_rest'        => true,
            'show_in_graphql'     => true,
            'graphql_single_name' => 'Event',
            'graphql_plural_name' => 'Events',
        ]);
    }
}
