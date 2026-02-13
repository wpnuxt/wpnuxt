# Custom GraphQL Queries

Place your custom `.gql` or `.graphql` files here to extend or override the default WPNuxt queries.

## How it works

1. Files here are merged with WPNuxt's default queries during build
2. If a file has the same name as a default query, yours will override it
3. New files will generate new composables automatically

## Example

Create a file `CustomPosts.gql`:

```graphql
query CustomPosts($first: Int = 10) {
  posts(first: $first) {
    nodes {
      id
      title
      date
      # Add your custom fields here
    }
  }
}
```

This generates `useCustomPosts()` and `useAsyncCustomPosts()` composables.

## Available Fragments

You can use these fragments from WPNuxt's defaults:
- `...Post` - Standard post fields
- `...Page` - Standard page fields
- `...ContentNode` - Common content fields
- `...FeaturedImage` - Featured image with sizes

## Documentation

See https://wpnuxt.com/guide/custom-queries for more details.
