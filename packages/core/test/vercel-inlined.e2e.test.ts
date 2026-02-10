import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { describe, it, expect } from 'vitest'
import { setup, useTestContext } from '@nuxt/test-utils/e2e'

/**
 * Verifies fix for issue #211: jsdom no longer in the bundle.
 *
 * After replacing @radya/nuxt-dompurify with a built-in plugin that uses
 * DOMPurify client-only (no jsdom), the server bundle should not contain
 * any jsdom code regardless of externals configuration.
 */
describe('vercel preset SSR without jsdom (#211)', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/vercel-inlined', import.meta.url)),
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

  it('bundle does not contain jsdom', async () => {
    const ctx = useTestContext()
    const buildDir = ctx.nuxt!.options.buildDir
    const chunksDir = resolve(buildDir, 'output', 'functions', '__fallback.func', 'chunks')

    // After replacing @radya/nuxt-dompurify with the built-in plugin,
    // jsdom should not appear anywhere in the server bundle.
    const result = await runNode(`
      import { readFileSync, readdirSync } from 'node:fs';
      import { join } from 'node:path';

      function readDir(dir) {
        let content = '';
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const path = join(dir, entry.name);
          if (entry.isDirectory()) content += readDir(path);
          else if (entry.name.endsWith('.mjs')) content += readFileSync(path, 'utf8');
        }
        return content;
      }

      const chunks = readDir('${chunksDir}');
      const hasBareJsdomImport = /import\\s*\\(?\\s*['"]jsdom['"]/.test(chunks);
      const hasInlinedJsdomCode = chunks.includes('jsdomError');
      console.log(JSON.stringify({ hasBareJsdomImport, hasInlinedJsdomCode }));
    `)

    expect(result.exitCode).toBe(0)
    const { hasBareJsdomImport, hasInlinedJsdomCode } = JSON.parse(result.stdout.trim())
    expect(hasBareJsdomImport).toBe(false)
    expect(hasInlinedJsdomCode).toBe(false)
  })

  it('SSR request returns 200 with rendered content when jsdom is inlined', async () => {
    const entryPath = getFunctionEntryPath()

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
