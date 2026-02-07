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
wp-env run cli wp post create /var/www/html/demo-content/hello-world.html \
  --post_type=post \
  --post_title="Hello World from WPNuxt" \
  --post_status=publish

wp-env run cli wp post create /var/www/html/demo-content/getting-started.html \
  --post_type=post \
  --post_title="Getting Started with WPNuxt" \
  --post_status=publish

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
