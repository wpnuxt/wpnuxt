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

# Register Book custom post type via mu-plugin
echo "Registering Book custom post type..."
mkdir -p /var/www/html/wp-content/mu-plugins
cat > /var/www/html/wp-content/mu-plugins/register-book-cpt.php << 'PHEOF'
<?php
add_action('init', function () {
    register_post_type('book', [
        'label'               => 'Books',
        'public'              => true,
        'show_in_graphql'     => true,
        'graphql_single_name' => 'book',
        'graphql_plural_name' => 'books',
        'supports'            => ['title', 'editor', 'thumbnail', 'excerpt'],
        'has_archive'         => true,
        'rewrite'             => ['slug' => 'book'],
    ]);
});
PHEOF

# Create test content
echo "Creating test content..."

# Set permalink structure first (needed for correct URIs)
wp option update permalink_structure '/%postname%/' --allow-root
wp rewrite flush --allow-root

# Create categories
TECH_CAT_ID=$(wp term create category "Technology" --porcelain --allow-root 2>/dev/null || wp term list category --field=term_id --name=Technology --allow-root)
NEWS_CAT_ID=$(wp term create category "News" --porcelain --allow-root 2>/dev/null || wp term list category --field=term_id --name=News --allow-root)
echo "Categories created: Technology=$TECH_CAT_ID, News=$NEWS_CAT_ID"

# Create a test image using PHP/GD
php -r "
\$img = imagecreatetruecolor(150, 150);
\$color = imagecolorallocate(\$img, 100, 150, 200);
imagefill(\$img, 0, 0, \$color);
imagejpeg(\$img, '/tmp/test-image.jpg');
imagedestroy(\$img);
"

# Import the image as a media attachment
MEDIA_ID=$(wp media import /tmp/test-image.jpg --title="Test Featured Image" --porcelain --allow-root 2>/dev/null || echo "")
echo "Media created: ID=$MEDIA_ID"

# Create test page
wp post create \
    --post_type=page \
    --post_title="Home" \
    --post_content="Welcome to WPNuxt Test Site" \
    --post_status=publish \
    --allow-root 2>/dev/null || true

# Create test posts with categories
POST1_ID=$(wp post create \
    --post_type=post \
    --post_title="Test Post" \
    --post_content="<p>This is a test post content.</p>" \
    --post_status=publish \
    --porcelain \
    --allow-root 2>/dev/null || echo "")

if [ -n "$POST1_ID" ] && [ -n "$TECH_CAT_ID" ]; then
    wp post term set "$POST1_ID" category "$TECH_CAT_ID" --allow-root 2>/dev/null || true
fi

POST2_ID=$(wp post create \
    --post_type=post \
    --post_title="Post With Featured Image" \
    --post_content="<p>This post has a featured image and categories.</p>" \
    --post_status=publish \
    --porcelain \
    --allow-root 2>/dev/null || echo "")

if [ -n "$POST2_ID" ]; then
    if [ -n "$MEDIA_ID" ]; then
        wp post meta update "$POST2_ID" _thumbnail_id "$MEDIA_ID" --allow-root 2>/dev/null || true
    fi
    if [ -n "$TECH_CAT_ID" ]; then
        wp post term set "$POST2_ID" category "$TECH_CAT_ID" --allow-root 2>/dev/null || true
    fi
fi

POST3_ID=$(wp post create \
    --post_type=post \
    --post_title="News Article" \
    --post_content="<p>This is a news article for category testing.</p>" \
    --post_status=publish \
    --porcelain \
    --allow-root 2>/dev/null || echo "")

if [ -n "$POST3_ID" ] && [ -n "$NEWS_CAT_ID" ]; then
    wp post term set "$POST3_ID" category "$NEWS_CAT_ID" --allow-root 2>/dev/null || true
fi

wp rewrite flush --allow-root

# Create book posts (custom post type)
echo "Creating book test content..."
BOOK1_ID=$(wp post create \
    --post_type=book \
    --post_title="The Great Gatsby" \
    --post_content="<p>A novel by F. Scott Fitzgerald.</p>" \
    --post_excerpt="A story of the Jazz Age" \
    --post_status=publish \
    --porcelain \
    --allow-root 2>/dev/null || echo "")

if [ -n "$BOOK1_ID" ] && [ -n "$MEDIA_ID" ]; then
    wp post meta update "$BOOK1_ID" _thumbnail_id "$MEDIA_ID" --allow-root 2>/dev/null || true
fi

wp post create \
    --post_type=book \
    --post_title="1984" \
    --post_content="<p>A novel by George Orwell.</p>" \
    --post_excerpt="A dystopian classic" \
    --post_status=publish \
    --allow-root 2>/dev/null || true

wp rewrite flush --allow-root
echo "Book test content created!"

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
