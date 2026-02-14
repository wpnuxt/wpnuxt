#!/bin/bash
set -e

# Get port from environment or default to 80 (inside container)
WP_PORT=${WP_PORT:-80}
WP_URL="http://localhost:${WP_PORT}"

echo "Waiting for WordPress to be ready..."
timeout=120
counter=0
while ! curl -s http://localhost/ > /dev/null 2>&1; do
    sleep 2
    counter=$((counter + 2))
    if [ $counter -ge $timeout ]; then
        echo "Timeout waiting for WordPress"
        exit 1
    fi
done

echo "WordPress is ready!"

# Install WP-CLI if not present
if ! command -v wp &> /dev/null; then
    curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
    chmod +x wp-cli.phar
    mv wp-cli.phar /usr/local/bin/wp
fi

# Wait for database
echo "Waiting for database..."
sleep 5

# Configure WordPress if not already configured
if ! wp core is-installed --allow-root 2>/dev/null; then
    echo "Installing WordPress..."
    
    wp core install \
        --url="$WP_URL" \
        --title="WPNuxt Test" \
        --admin_user="admin" \
        --admin_password="password" \
        --admin_email="test@example.com" \
        --skip-email \
        --allow-root

    # Install required plugins
    echo "Installing plugins..."
    
    # WPGraphQL
    wp plugin install wp-graphql --activate --allow-root
    
    # WPGraphQL Content Blocks
    wp plugin install https://github.com/wpengine/wp-graphql-content-blocks/releases/latest/download/wp-graphql-content-blocks.zip --activate --allow-root || \
    wp plugin install wp-graphql-content-blocks --activate --allow-root || \
    echo "Warning: Could not install WPGraphQL Content Blocks"
    
    # WPGraphQL Headless Login
    wp plugin install https://github.com/AxeWP/wp-graphql-headless-login/releases/latest/download/wp-graphql-headless-login.zip --activate --allow-root || \
    echo "Warning: Could not install WPGraphQL Headless Login"

    # Flush permalinks
    wp rewrite flush --allow-root

    echo "WordPress installed successfully!"
else
    echo "WordPress already installed"
fi

# Create test content
echo "Creating test content..."

# Create test page
wp post create \
    --post_type=page \
    --post_title="Home" \
    --post_content="Welcome to WPNuxt Test Site" \
    --post_status=publish \
    --allow-root 2>/dev/null || true

# Create test post
wp post create \
    --post_type=post \
    --post_title="Test Post" \
    --post_content="<p>This is a test post content.</p>" \
    --post_status=publish \
    --allow-root 2>/dev/null || true

# Set permalink structure
wp option update permalink_structure '/%postname%/' --allow-root
wp rewrite flush --allow-root

echo "Test content created!"

# Activate required plugins if not already active
wp plugin activate wp-graphql --allow-root 2>/dev/null || true

# Enable public introspection for schema download (using wp option patch like wp-env does)
# Delete old settings if they exist (may be malformed)
wp option delete graphql_general_settings --allow-root 2>/dev/null || true
# Add fresh settings with public introspection enabled (use "on" not "true")
wp option add graphql_general_settings '{}' --format=json --allow-root 2>/dev/null || true
wp option patch insert graphql_general_settings public_introspection_enabled on --allow-root 2>/dev/null || true

echo "Setup complete!"
