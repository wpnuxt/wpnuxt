#!/bin/sh
# Second half of a release: run on main after the PR opened by `pnpm release` is merged
set -eu

pnpm whoami >/dev/null || { echo "Not logged in to npm: run 'pnpm login' first" >&2; exit 1; }

git switch main
git pull --ff-only

version=$(node -p "require('./package.json').version")
tag="v$version"
notes=$(awk -v heading="## [$version]" 'index($0, heading) == 1 { found = 1; next } /^## \[/ { found = 0 } found' CHANGELOG.md)
[ -n "$notes" ] || { echo "CHANGELOG.md has no section for $version" >&2; exit 1; }

git tag "$tag"
git push origin "$tag"
gh release create "$tag" --draft --title "$tag" --notes "$notes"
pnpm publish -r --access public --no-git-checks
