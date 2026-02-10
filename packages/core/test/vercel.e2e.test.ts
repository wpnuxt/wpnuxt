import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { describe, it, expect } from 'vitest'
import { setup, useTestContext } from '@nuxt/test-utils/e2e'

describe('vercel preset SSR', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/vercel', import.meta.url)),
    server: false,
    build: true,
    setupTimeout: 180_000
  })

  function getFunctionEntryPath(): string {
    const ctx = useTestContext()
    const buildDir = ctx.nuxt!.options.buildDir
    return resolve(buildDir, 'output', 'functions', '__fallback.func', 'index.mjs')
  }

  it('builds successfully with vercel preset', () => {
    const ctx = useTestContext()
    expect(ctx.nuxt).toBeDefined()

    const entryPath = getFunctionEntryPath()
    expect(existsSync(entryPath)).toBe(true)
  })

  it('serverless function can be imported without jsdom errors', async () => {
    const entryPath = getFunctionEntryPath()

    // Import the function in a child process with NODE_ENV=production (as on Vercel).
    // This is where jsdom's require("stream") / missing xhr-sync-worker.js breaks.
    const result = await runNode(`
      import handler from '${entryPath}';
      console.log(typeof handler);
    `)

    expect(result.exitCode).toBe(0)
    expect(result.stdout.trim()).toBe('function')
  })

  it('SSR request returns 200 with rendered content', async () => {
    const entryPath = getFunctionEntryPath()

    // Start a temporary server in a child process with NODE_ENV=production,
    // send an SSR request, and capture the response status + body.
    const result = await runNode(`
      import { createServer } from 'node:http';
      import handler from '${entryPath}';

      const server = createServer(handler);
      server.listen(0, () => {
        const port = server.address().port;
        fetch('http://localhost:' + port + '/').then(async r => {
          const html = await r.text();
          console.log(JSON.stringify({ status: r.status, html }));
          server.close(() => process.exit(0));
        }).catch(err => {
          console.error(err.message);
          server.close(() => process.exit(1));
        });
      });
    `)

    expect(result.exitCode).toBe(0)

    const { status, html } = JSON.parse(result.stdout.trim())
    expect(status).toBe(200)
    expect(html).toContain('Vercel SSR Test')
    expect(html).toContain('sanitized')
  })
})

function runNode(code: string): Promise<{ exitCode: number, stdout: string, stderr: string }> {
  return new Promise((resolve) => {
    const child = execFile(
      process.execPath,
      ['--input-type=module', '-e', code],
      { env: { ...process.env, NODE_ENV: 'production' }, timeout: 30_000 },
      (error, stdout, stderr) => {
        resolve({
          exitCode: error ? (error as NodeJS.ErrnoException & { code?: number }).code ?? 1 : 0,
          stdout: String(stdout),
          stderr: String(stderr)
        })
      }
    )
    child.on('error', () => {
      resolve({ exitCode: 1, stdout: '', stderr: 'Failed to start child process' })
    })
  })
}
