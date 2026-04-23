<?php
/**
 * Blueprint setup script: creates sample posts, pages, menus, events, and categories.
 * Executed by WordPress Playground during blueprint initialization.
 */

require '/wordpress/wp-load.php';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function set_acf( $post_id, $fields ) {
    foreach ( $fields as $name => $value ) {
        update_post_meta( $post_id, $name, $value );
        update_post_meta( $post_id, '_' . $name, 'field_' . $name );
    }
}

function ensure_term( $name, $taxonomy, $slug = '' ) {
    $term = term_exists( $name, $taxonomy );
    if ( $term ) {
        return (int) $term['term_id'];
    }
    $args = $slug ? [ 'slug' => $slug ] : [];
    $result = wp_insert_term( $name, $taxonomy, $args );
    if ( is_wp_error( $result ) ) {
        return 0;
    }
    return (int) $result['term_id'];
}

// ---------------------------------------------------------------------------
// Delete default content
// ---------------------------------------------------------------------------
wp_delete_post( 1, true ); // "Hello world!" post
wp_delete_post( 2, true ); // Sample page

// ---------------------------------------------------------------------------
// Create categories for posts
// ---------------------------------------------------------------------------
$cat_news = ensure_term( 'News', 'category', 'news' );
$cat_tutorials = ensure_term( 'Tutorials', 'category', 'tutorials' );
$cat_releases = ensure_term( 'Releases', 'category', 'releases' );

// ---------------------------------------------------------------------------
// Create posts with Gutenberg blocks
// ---------------------------------------------------------------------------
$posts = [
    [
        'title'    => 'Hello World',
        'slug'     => 'hello-world',
        'category' => $cat_news,
        'excerpt'  => 'Welcome to WPNuxt! This is a sample post demonstrating headless WordPress with Nuxt.',
        'content'  => '<!-- wp:paragraph -->
<p>Welcome to WPNuxt, the Nuxt module for headless WordPress. This post demonstrates how WordPress content renders in your Nuxt frontend.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Getting Started</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>WPNuxt generates type-safe composables from your GraphQL queries. Just create a <code>.gql</code> file and the composable is auto-imported.</p>
<!-- /wp:paragraph -->

<!-- wp:quote -->
<blockquote class="wp-block-quote"><p>The best way to predict the future is to create it.</p><cite>Peter Drucker</cite></blockquote>
<!-- /wp:quote -->

<!-- wp:heading {"level":3} -->
<h3>Features</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>WPNuxt provides reactive params, cursor-based pagination, type guards, ACF helpers, and full SSR/SSG support out of the box.</p>
<!-- /wp:paragraph -->'
    ],
    [
        'title'    => 'Building with Nuxt and WordPress',
        'slug'     => 'building-with-nuxt-and-wordpress',
        'category' => $cat_tutorials,
        'excerpt'  => 'Learn how to build a modern headless WordPress site using Nuxt 4 and WPNuxt.',
        'content'  => '<!-- wp:paragraph -->
<p>In this tutorial, we explore how to set up a headless WordPress project with Nuxt 4 using the WPNuxt module.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Prerequisites</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>You will need Node.js 18+, pnpm, and a WordPress instance with the WPGraphQL plugin installed.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Custom Queries</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Create <code>.gql</code> files in your <code>extend/queries/</code> folder to generate custom composables. WPNuxt automatically detects your queries and generates typed composables.</p>
<!-- /wp:paragraph -->'
    ],
    [
        'title'    => 'WPNuxt v2 Released',
        'slug'     => 'wpnuxt-v2-released',
        'category' => $cat_releases,
        'excerpt'  => 'WPNuxt v2 brings reactive params, connection queries, type guards, and more.',
        'content'  => '<!-- wp:paragraph -->
<p>We are excited to announce WPNuxt v2, a major update that brings reactive params, cursor-based pagination, and type guards to your headless WordPress workflow.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>What\'s New</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Reactive params allow you to pass computed refs as query variables. The composable automatically re-fetches when the values change — no watch option needed.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Connection queries with pageInfo are now automatically detected, generating composables with loadMore() for infinite scroll patterns.</p>
<!-- /wp:paragraph -->'
    ],
    [
        'title'    => 'Using Custom Post Types with WPNuxt',
        'slug'     => 'custom-post-types-with-wpnuxt',
        'category' => $cat_tutorials,
        'excerpt'  => 'How to fetch and display custom post types in your Nuxt frontend.',
        'content'  => '<!-- wp:paragraph -->
<p>WordPress custom post types work seamlessly with WPNuxt. Register your CPT with WPGraphQL support, create a query, and the composable is generated automatically.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Step by Step</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>First, ensure your CPT registration includes <code>show_in_graphql</code>, <code>graphql_single_name</code>, and <code>graphql_plural_name</code>. Then create a <code>.gql</code> query file in <code>extend/queries/</code>.</p>
<!-- /wp:paragraph -->'
    ],
    [
        'title'    => 'Rendering Gutenberg Blocks in Nuxt',
        'slug'     => 'render-gutenberg-blocks',
        'category' => $cat_tutorials,
        'excerpt'  => 'Use @wpnuxt/blocks to render WordPress Gutenberg blocks as Vue components.',
        'content'  => '<!-- wp:paragraph -->
<p>The @wpnuxt/blocks package provides Vue components for rendering WordPress Gutenberg blocks. Each block type maps to a Vue component.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Block Components</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>CoreParagraph, CoreHeading, CoreImage, CoreQuote, CoreButton — all rendered natively in Vue with proper styling and interactivity.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Custom Block Components</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Override any block component by creating your own in <code>components/blocks/</code>. Your component takes precedence over the default.</p>
<!-- /wp:paragraph -->'
    ],
    [
        'title'    => 'Pagination Patterns',
        'slug'     => 'pagination-patterns',
        'category' => $cat_tutorials,
        'excerpt'  => 'Implement cursor-based pagination with WPNuxt connection queries.',
        'content'  => '<!-- wp:paragraph -->
<p>WPNuxt supports two pagination modes: page-based navigation with previous/next buttons, and infinite scroll with loadMore().</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Add pageInfo to your GraphQL query and WPNuxt automatically generates a composable with pagination support. No extra configuration needed.</p>
<!-- /wp:paragraph -->'
    ],
];

foreach ( $posts as $post_data ) {
    $post_id = wp_insert_post([
        'post_title'   => $post_data['title'],
        'post_name'    => $post_data['slug'],
        'post_content' => $post_data['content'],
        'post_excerpt' => $post_data['excerpt'],
        'post_status'  => 'publish',
        'post_type'    => 'post',
    ]);
    if ( $post_id && ! is_wp_error( $post_id ) ) {
        wp_set_post_categories( $post_id, [ $post_data['category'] ] );
    }
}

// ---------------------------------------------------------------------------
// Create pages
// ---------------------------------------------------------------------------
$pages = [
    [ 'title' => 'About', 'slug' => 'about', 'content' => '<!-- wp:paragraph -->
<p>WPNuxt is an open-source Nuxt module that integrates WordPress with Nuxt 4 via WPGraphQL. It generates type-safe composables from your GraphQL queries.</p>
<!-- /wp:paragraph -->' ],
    [ 'title' => 'Contact', 'slug' => 'contact', 'content' => '<!-- wp:paragraph -->
<p>Get in touch via GitHub or the WPNuxt documentation site.</p>
<!-- /wp:paragraph -->' ],
];

foreach ( $pages as $page_data ) {
    wp_insert_post([
        'post_title'   => $page_data['title'],
        'post_name'    => $page_data['slug'],
        'post_content' => $page_data['content'],
        'post_status'  => 'publish',
        'post_type'    => 'page',
    ]);
}

// ---------------------------------------------------------------------------
// Create navigation menu
// ---------------------------------------------------------------------------
$menu_id = wp_create_nav_menu( 'main' );

if ( ! is_wp_error( $menu_id ) ) {
    // Add pages to menu
    wp_update_nav_menu_item( $menu_id, 0, [
        'menu-item-title'  => 'Home',
        'menu-item-url'    => home_url( '/' ),
        'menu-item-status' => 'publish',
        'menu-item-type'   => 'custom',
    ]);

    wp_update_nav_menu_item( $menu_id, 0, [
        'menu-item-title'  => 'Events',
        'menu-item-url'    => home_url( '/events/' ),
        'menu-item-status' => 'publish',
        'menu-item-type'   => 'custom',
    ]);

    wp_update_nav_menu_item( $menu_id, 0, [
        'menu-item-title'  => 'Sponsors',
        'menu-item-url'    => home_url( '/sponsors/' ),
        'menu-item-status' => 'publish',
        'menu-item-type'   => 'custom',
    ]);

    wp_update_nav_menu_item( $menu_id, 0, [
        'menu-item-title'  => 'About',
        'menu-item-url'    => home_url( '/about/' ),
        'menu-item-status' => 'publish',
        'menu-item-type'   => 'custom',
    ]);

    // Set as primary menu
    $locations = get_theme_mod( 'nav_menu_locations', [] );
    $locations['primary'] = $menu_id;
    set_theme_mod( 'nav_menu_locations', $locations );
}

// ---------------------------------------------------------------------------
// Create event categories
// ---------------------------------------------------------------------------
$ecat_concert   = ensure_term( 'Concerts', 'event_category', 'concerts' );
$ecat_workshop  = ensure_term( 'Workshops', 'event_category', 'workshops' );
$ecat_festival  = ensure_term( 'Festivals', 'event_category', 'festivals' );
$ecat_meetup    = ensure_term( 'Meetups', 'event_category', 'meetups' );

// ---------------------------------------------------------------------------
// Create events
// ---------------------------------------------------------------------------
$events = [
    [
        'title'    => 'Summer Music Festival',
        'slug'     => 'summer-music-festival',
        'excerpt'  => 'A three-day outdoor music festival featuring local and international artists.',
        'content'  => '<!-- wp:paragraph -->
<p>Join us for the biggest music festival of the summer! Three stages, over 30 artists, and great food.</p>
<!-- /wp:paragraph -->',
        'category' => $ecat_festival,
        'acf'      => [
            'event_start_datetime' => '2026-07-15 14:00:00',
            'event_end_datetime'   => '2026-07-17 23:00:00',
            'event_ticket_price'   => '€45',
            'event_is_free'        => 0,
            'event_status'         => 'upcoming',
            'event_location'       => 'City Park, Brussels',
        ],
    ],
    [
        'title'    => 'Vue.js Meetup Brussels',
        'slug'     => 'vuejs-meetup-brussels',
        'excerpt'  => 'Monthly Vue.js meetup for developers in Brussels.',
        'content'  => '<!-- wp:paragraph -->
<p>This month we dive into Nuxt 4, the Composition API, and headless CMS patterns with WPNuxt.</p>
<!-- /wp:paragraph -->',
        'category' => $ecat_meetup,
        'acf'      => [
            'event_start_datetime' => '2026-04-10 19:00:00',
            'event_end_datetime'   => '2026-04-10 21:30:00',
            'event_ticket_price'   => '',
            'event_is_free'        => 1,
            'event_status'         => 'upcoming',
            'event_location'       => 'BeCentral, Brussels',
        ],
    ],
    [
        'title'    => 'Jazz in the Park',
        'slug'     => 'jazz-in-the-park',
        'excerpt'  => 'An evening of smooth jazz in the beautiful setting of Cinquantenaire Park.',
        'content'  => '<!-- wp:paragraph -->
<p>Bring a blanket and enjoy an evening of live jazz under the stars.</p>
<!-- /wp:paragraph -->',
        'category' => $ecat_concert,
        'acf'      => [
            'event_start_datetime' => '2026-06-20 20:00:00',
            'event_end_datetime'   => '2026-06-20 23:00:00',
            'event_ticket_price'   => '€12',
            'event_is_free'        => 0,
            'event_status'         => 'upcoming',
            'event_location'       => 'Cinquantenaire Park, Brussels',
        ],
    ],
    [
        'title'    => 'Sound Healing Workshop',
        'slug'     => 'sound-healing-workshop',
        'excerpt'  => 'Experience the healing power of sound with singing bowls, gongs, and overtone singing.',
        'content'  => '<!-- wp:paragraph -->
<p>A deep immersive sound experience for relaxation and inner balance.</p>
<!-- /wp:paragraph -->',
        'category' => $ecat_workshop,
        'acf'      => [
            'event_start_datetime' => '2026-05-03 10:00:00',
            'event_end_datetime'   => '2026-05-03 16:00:00',
            'event_ticket_price'   => '€35',
            'event_is_free'        => 0,
            'event_status'         => 'upcoming',
            'event_location'       => 'Harmony Center, Ghent',
        ],
    ],
    [
        'title'    => 'Cancelled: Rock Night',
        'slug'     => 'cancelled-rock-night',
        'excerpt'  => 'This event has been cancelled due to unforeseen circumstances.',
        'content'  => '<!-- wp:paragraph -->
<p>We regret to inform you that Rock Night has been cancelled. Refunds will be processed automatically.</p>
<!-- /wp:paragraph -->',
        'category' => $ecat_concert,
        'acf'      => [
            'event_start_datetime' => '2026-05-15 20:00:00',
            'event_end_datetime'   => '2026-05-15 23:30:00',
            'event_ticket_price'   => '€20',
            'event_is_free'        => 0,
            'event_status'         => 'cancelled',
            'event_location'       => 'AB, Brussels',
        ],
    ],
    [
        'title'    => 'Sold Out: Ecstatic Dance',
        'slug'     => 'sold-out-ecstatic-dance',
        'excerpt'  => 'A free-form dance journey with live DJ and world music.',
        'content'  => '<!-- wp:paragraph -->
<p>Move your body freely to eclectic beats in a safe, inclusive space.</p>
<!-- /wp:paragraph -->',
        'category' => $ecat_workshop,
        'acf'      => [
            'event_start_datetime' => '2026-04-26 19:30:00',
            'event_end_datetime'   => '2026-04-26 22:00:00',
            'event_ticket_price'   => '€18',
            'event_is_free'        => 0,
            'event_status'         => 'soldout',
            'event_location'       => 'Studio 42, Antwerp',
        ],
    ],
];

foreach ( $events as $event_data ) {
    $event_id = wp_insert_post([
        'post_title'   => $event_data['title'],
        'post_name'    => $event_data['slug'],
        'post_content' => $event_data['content'],
        'post_excerpt' => $event_data['excerpt'],
        'post_status'  => 'publish',
        'post_type'    => 'event',
    ]);
    if ( $event_id && ! is_wp_error( $event_id ) ) {
        wp_set_object_terms( $event_id, [ $event_data['category'] ], 'event_category' );
        set_acf( $event_id, $event_data['acf'] );
    }
}

// ---------------------------------------------------------------------------
// Create sponsors (simple CPT — demonstrates WPNuxt auto-generation)
// ---------------------------------------------------------------------------
$sponsors = [
    [
        'title'   => 'Acme Corp',
        'slug'    => 'acme-corp',
        'excerpt' => 'Longtime supporter of the Brussels dev community.',
        'content' => '<!-- wp:paragraph -->
<p>Acme Corp has proudly sponsored our meetups for three years running. Their commitment to open source goes beyond funding — they regularly host workshops and contribute engineering time to community projects.</p>
<!-- /wp:paragraph -->',
    ],
    [
        'title'   => 'Contoso Labs',
        'slug'    => 'contoso-labs',
        'excerpt' => 'Research-driven engineering studio focused on headless CMS.',
        'content' => '<!-- wp:paragraph -->
<p>Contoso Labs builds tooling and platforms for headless WordPress deployments. They are active in the WPGraphQL community and have contributed performance patches back to the upstream plugin.</p>
<!-- /wp:paragraph -->',
    ],
    [
        'title'   => 'Globex',
        'slug'    => 'globex',
        'excerpt' => 'Europe-wide consultancy specialising in Nuxt + WordPress stacks.',
        'content' => '<!-- wp:paragraph -->
<p>Globex has helped dozens of teams migrate from monolithic WordPress to a headless WPNuxt stack. Their playbooks on ISR, cache invalidation, and preview mode are widely referenced.</p>
<!-- /wp:paragraph -->',
    ],
    [
        'title'   => 'Initech',
        'slug'    => 'initech',
        'excerpt' => 'Boutique product studio backing open source.',
        'content' => '<!-- wp:paragraph -->
<p>Initech sponsors this project and several other small open-source tools. They use WPNuxt to power their own marketing site and contribute patches upstream.</p>
<!-- /wp:paragraph -->',
    ],
];

foreach ( $sponsors as $sponsor_data ) {
    wp_insert_post([
        'post_title'   => $sponsor_data['title'],
        'post_name'    => $sponsor_data['slug'],
        'post_content' => $sponsor_data['content'],
        'post_excerpt' => $sponsor_data['excerpt'],
        'post_status'  => 'publish',
        'post_type'    => 'sponsor',
    ]);
}

echo "Setup complete: created " . count($posts) . " posts, " . count($pages) . " pages, " . count($events) . " events, " . count($sponsors) . " sponsors, and navigation menu.\n";
