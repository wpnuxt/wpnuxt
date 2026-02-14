import { test, expect } from '@playwright/test'

test.describe('Nuxt Integration', () => {
  test('Nuxt app builds and runs', async ({ page }) => {
    await page.goto('/')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check that the page title contains WPNuxt
    const heading = page.locator('h1')
    await expect(heading).toContainText('WPNuxt')
  })

  test('Nuxt app fetches posts from WordPress', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that posts section exists
    const postsHeading = page.locator('h2', { hasText: 'Posts' })
    await expect(postsHeading).toBeVisible()
  })

  test('Nuxt app fetches pages from WordPress', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that pages section exists
    const pagesHeading = page.locator('h2', { hasText: 'Pages' })
    await expect(pagesHeading).toBeVisible()
  })

  test('Nuxt app handles errors gracefully', async ({ page }) => {
    // Navigate to the page - it should handle any GraphQL errors
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // The page should still render even if there are errors
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('shows general settings site title', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const siteTitle = page.locator('#site-title')
    await expect(siteTitle).toBeVisible()
    await expect(siteTitle).not.toBeEmpty()
  })

  test('shows featured images on posts', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const images = page.locator('.featured-image')
    const count = await images.count()
    expect(count).toBeGreaterThan(0)
  })

  test('shows categories on posts', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const categories = page.locator('.category-link')
    const count = await categories.count()
    expect(count).toBeGreaterThan(0)
  })

  test('navigates to a post page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const firstPostLink = page.locator('.post-link').first()
    const postTitle = await firstPostLink.textContent()
    await firstPostLink.click()
    await page.waitForLoadState('networkidle')

    const nodeTitle = page.locator('.node-title')
    await expect(nodeTitle).toContainText(postTitle!.trim())
  })

  test('navigates to a category archive page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const firstCategoryLink = page.locator('.category-link').first()
    const categoryName = await firstCategoryLink.textContent()
    await firstCategoryLink.click()
    await page.waitForLoadState('networkidle')

    const categoryTitle = page.locator('.category-title')
    await expect(categoryTitle).toContainText(categoryName!.trim())

    const posts = page.locator('#category-posts .post-item')
    const count = await posts.count()
    expect(count).toBeGreaterThan(0)
  })

  test('lists custom post type (books)', async ({ page }) => {
    await page.goto('/books')
    await page.waitForLoadState('networkidle')

    const booksList = page.locator('#books-list')
    await expect(booksList).toBeVisible()

    const bookLinks = page.locator('.book-link')
    const count = await bookLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('navigates to a single book page', async ({ page }) => {
    await page.goto('/books')
    await page.waitForLoadState('networkidle')

    const firstBookLink = page.locator('.book-link').first()
    const bookTitle = await firstBookLink.textContent()
    await firstBookLink.click()
    await page.waitForLoadState('networkidle')

    const nodeTitle = page.locator('.node-title')
    await expect(nodeTitle).toContainText(bookTitle!.trim())
  })

  test('shows not found for invalid URI', async ({ page }) => {
    await page.goto('/this-page-does-not-exist/')
    await page.waitForLoadState('networkidle')

    const notFound = page.locator('#not-found')
    await expect(notFound).toBeVisible()
    await expect(notFound).toContainText('Not found')
  })
})
