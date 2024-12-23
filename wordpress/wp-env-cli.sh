#!/bin/sh
echo "-------------------- executing wpInstall script --------------------";

#wp-env run cli update --yes;
#wp-env run cli wp core update;
cli_version=$(wp-env run cli wp --version);
echo "WordPress cli version: $cli_version";
wp_version=$(wp-env run cli wp core version);
echo "WordPress version: $wp_version";

if [ $(wp-env run cli wp option list --search=wpnuxt_installed --format=count) == 1 ]; then
  echo "WPNuxt is already installed.";
else
  wp-env run cli wp option add graphql_general_settings {} --format=json;
  wp-env run cli wp option patch insert graphql_general_settings public_introspection_enabled on;
  wp-env run cli wp option patch insert graphql_general_settings show_graphiql_link_in_admin_bar off;

  wp-env run cli wp option patch insert faustwp_settings frontend_uri "http://localhost:3000";
  wp-env run cli wp option patch insert faustwp_settings disable_theme 1;
  wp-env run cli wp option patch insert faustwp_settings enable_redirects 1;
  wp-env run cli wp option patch insert faustwp_settings enable_rewrites 1;
  wp-env run cli wp option patch insert faustwp_settings enable_telemetry 1;
  wp-env run cli wp option patch insert faustwp_settings enable_image_source 1;
  wp-env run cli wp option patch insert faustwp_settings secret_key 64489e3c-1166-498a-9a6e-51cbb4c14ab2;

  wp-env run cli wp theme delete --all;

  wp-env run cli wp menu create main;
  wp-env run cli wp menu item add-post main $(wp-env run cli wp post list --post_type=page --field="ID" --name="sample-page") --title="Sample Page";
  test_post_id="$(wp-env run cli wp post create ./demo-content/testpage.txt --post_type=page --post_title="Test Page" --post_status=publish --porcelain)";
  wp-env run cli wp menu item add-post main $test_post_id --title="Test Page";
  wp-env run cli wp menu location assign main primary;
  wp-env run cli wp post create ./demo-content/testpost.txt --post_type=post --post_title="Test Post" --post_status=publish
  wp-env run cli wp post create ./demo-content/newmodule.txt --post_type=post --post_title="A new Nuxt module" --post_status=publish

  wp-env run cli wp rewrite flush;

  wp-env run cli wp option add wpnuxt_installed 1;

  echo "----------------- WPNuxt installed successfully: --------------------";
fi
