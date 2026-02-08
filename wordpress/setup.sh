#!/bin/bash
# WPNuxt local development setup script
# Run automatically by wp-env afterStart lifecycle hook

echo "==================== WPNuxt Setup ===================="

# Check if already installed
if [ "$(wp-env run cli wp option get wpnuxt_installed 2>/dev/null)" == "1" ]; then
  echo "WPNuxt is already configured."
  exit 0
fi

echo "Configuring WordPress for WPNuxt..."

# Set site name
wp-env run cli wp option update blogname "WPNuxt Local Dev"

# Activate classic theme (supports menus)
wp-env run cli wp theme activate twentytwentyone

# Configure WPGraphQL settings
wp-env run cli wp option add graphql_general_settings '{}' --format=json 2>/dev/null || true
wp-env run cli wp option patch insert graphql_general_settings public_introspection_enabled on
wp-env run cli wp option patch insert graphql_general_settings show_graphiql_link_in_admin_bar on

# Set permalink structure (required for WPNuxt URI matching)
wp-env run cli wp rewrite structure '/%postname%/' --hard

# Create demo content
# Note: demo-content folder is mapped to /var/www/html/demo-content/ in the container
echo "Creating demo content..."

# Create a test page
test_page_id=$(wp-env run cli wp post create /var/www/html/demo-content/test-page.html \
  --post_type=page \
  --post_title="Test Page" \
  --post_status=publish \
  --porcelain)

echo "Created test page with ID: $test_page_id"

# Create demo posts
hello_id=$(wp-env run cli wp post create /var/www/html/demo-content/hello-world.html \
  --post_type=post \
  --post_title="Hello World from WPNuxt" \
  --post_status=publish \
  --porcelain)
echo "Created hello-world post with ID: $hello_id"

getting_started_id=$(wp-env run cli wp post create /var/www/html/demo-content/getting-started.html \
  --post_type=post \
  --post_title="Getting Started with WPNuxt" \
  --post_status=publish \
  --porcelain)
echo "Created getting-started post with ID: $getting_started_id"

navigation_id=$(wp-env run cli wp post create /var/www/html/demo-content/client-side-navigation.html \
  --post_type=post \
  --post_title="Client-Side Navigation for WordPress Links" \
  --post_status=publish \
  --porcelain)
echo "Created client-side-navigation post with ID: $navigation_id"

# Import featured images and assign to posts
echo "Importing featured images..."

test_page_img=$(wp-env run cli wp media import /var/www/html/demo-content/images/test-page.jpg \
  --title="Test Page" \
  --porcelain)
wp-env run cli wp post meta update "$test_page_id" _thumbnail_id "$test_page_img"
echo "Assigned featured image $test_page_img to test page $test_page_id"

hello_img=$(wp-env run cli wp media import /var/www/html/demo-content/images/hello-world.jpg \
  --title="Hello World" \
  --porcelain)
wp-env run cli wp post meta update "$hello_id" _thumbnail_id "$hello_img"
echo "Assigned featured image $hello_img to hello-world post $hello_id"

getting_started_img=$(wp-env run cli wp media import /var/www/html/demo-content/images/getting-started.jpg \
  --title="Getting Started" \
  --porcelain)
wp-env run cli wp post meta update "$getting_started_id" _thumbnail_id "$getting_started_img"
echo "Assigned featured image $getting_started_img to getting-started post $getting_started_id"

navigation_img=$(wp-env run cli wp media import /var/www/html/demo-content/images/client-side-navigation.jpg \
  --title="Client-Side Navigation" \
  --porcelain)
wp-env run cli wp post meta update "$navigation_id" _thumbnail_id "$navigation_img"
echo "Assigned featured image $navigation_img to client-side-navigation post $navigation_id"

# Create and assign menus
echo "Setting up navigation menu..."

# Create "main" menu (used by WPNuxt default queries)
wp-env run cli wp menu create "main"
wp-env run cli wp menu item add-post "main" "$test_page_id"

# Assign to primary location if theme supports it (classic themes)
wp-env run cli wp menu location assign "main" primary 2>/dev/null || true

# Flush rewrite rules
wp-env run cli wp rewrite flush

# Mark as installed
wp-env run cli wp option add wpnuxt_installed 1

echo "==================== Setup Complete ===================="
echo ""
echo "WordPress: http://localhost:4000"
echo "GraphQL:   http://localhost:4000/graphql"
echo "Admin:     http://localhost:4000/wp-admin (admin/password)"
echo ""
