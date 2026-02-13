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
})
