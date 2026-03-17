<?php

namespace WPNuxt_Demo;

class Taxonomy_Event_Category
{
    public static function register(): void
    {
        register_taxonomy('event_category', ['event'], [
            'labels' => [
                'name'              => __('Event Categories', 'wpnuxt-demo'),
                'singular_name'     => __('Event Category', 'wpnuxt-demo'),
                'search_items'      => __('Search Event Categories', 'wpnuxt-demo'),
                'all_items'         => __('All Event Categories', 'wpnuxt-demo'),
                'edit_item'         => __('Edit Event Category', 'wpnuxt-demo'),
                'update_item'       => __('Update Event Category', 'wpnuxt-demo'),
                'add_new_item'      => __('Add New Event Category', 'wpnuxt-demo'),
                'new_item_name'     => __('New Event Category Name', 'wpnuxt-demo'),
                'menu_name'         => __('Categories', 'wpnuxt-demo'),
            ],
            'hierarchical'        => true,
            'public'              => true,
            'show_admin_column'   => true,
            'show_in_rest'        => true,
            'rewrite'             => ['slug' => 'event-category'],
            'show_in_graphql'     => true,
            'graphql_single_name' => 'EventCategory',
            'graphql_plural_name' => 'EventCategories',
        ]);
    }
}
