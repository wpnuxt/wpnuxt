#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { parseArgs } from 'node:util'

const DEFAULT_WP = '6.9'
const DEFAULT_NUXT = 'nuxt43'

const WP_VERSIONS = ['6.4', '6.5', '6.6', '6.7', '6.8', '6.9']
const NUXT_FIXTURES = ['nuxt313', 'nuxt3', 'nuxt40', 'nuxt41', 'nuxt42', 'nuxt43', 'nuxt-srcdir']

const WP_PORTS = { 6.4: 8004, 6.5: 8005, 6.6: 8006, 6.7: 8007, 6.8: 8008, 6.9: 8009 }
const NUXT_PORTS = { 'nuxt313': 3013, 'nuxt3': 3003, 'nuxt40': 3040, 'nuxt41': 3041, 'nuxt42': 3042, 'nuxt43': 3043, 'nuxt-srcdir': 3044 }

const { values } = parseArgs({
  options: {
    'wp': { type: 'string', default: DEFAULT_WP },
    'nuxt': { type: 'string', default: DEFAULT_NUXT },
    'all': { type: 'boolean', default: false },
    'wp-only': { type: 'boolean', default: false },
    'nuxt-only': { type: 'boolean', default: false },
    'no-docker': { type: 'boolean', default: false },
    'help': { type: 'boolean', default: false }
  },
  strict: true
})

if (values.help) {
  console.log(`
Usage: node run-tests.mjs [options]

Options:
  --wp=VERSION     WordPress version (default: ${DEFAULT_WP})
                   Available: ${WP_VERSIONS.join(', ')}
  --nuxt=FIXTURE   Nuxt fixture (default: ${DEFAULT_NUXT})
                   Available: ${NUXT_FIXTURES.join(', ')}
  --wp-only        Run only WordPress tests (no Nuxt web server)
  --nuxt-only      Run only Nuxt tests (requires web server)
  --all            Run all WP x Nuxt combinations
  --no-docker      Skip docker management (assumes containers are already running)
  --help           Show this help message

Examples:
  node run-tests.mjs                          # Default: WP ${DEFAULT_WP} + ${DEFAULT_NUXT}
  node run-tests.mjs --wp=6.7                 # WP 6.7 + ${DEFAULT_NUXT}
  node run-tests.mjs --wp-only --wp=6.9       # WordPress tests only against WP 6.9
  node run-tests.mjs --nuxt-only --nuxt=nuxt3 # Nuxt tests only with nuxt3 fixture
  node run-tests.mjs --all                    # Full matrix (all WP x Nuxt combinations)
  node run-tests.mjs --no-docker              # Skip docker, assume WP is already running
`)
  process.exit(0)
}

// --- Docker helpers ---

function composeFile(wp) {
  return `docker/docker-compose.wp-${wp}.yml`
}

function dockerUp(wp) {
  console.log(`\n▶ Starting WordPress ${wp}...`)
  execSync(`docker-compose -f ${composeFile(wp)} up -d`, { stdio: 'inherit' })
}

function dockerSetup(wp) {
  console.log(`▶ Setting up WordPress ${wp}...`)
  execSync(`docker-compose -f ${composeFile(wp)} exec -T wordpress /setup.sh`, { stdio: 'inherit' })
}

function dockerDown(wp) {
  console.log(`\n▶ Stopping WordPress ${wp}...`)
  try {
    execSync(`docker-compose -f ${composeFile(wp)} down`, { stdio: 'inherit' })
  } catch {
    console.error(`Warning: failed to stop WordPress ${wp}`)
  }
}

function waitForWordPress(wp) {
  const port = WP_PORTS[wp]
  const url = `http://localhost:${port}/`
  console.log(`  Waiting for WordPress ${wp} at ${url}...`)
  for (let i = 1; i <= 60; i++) {
    try {
      execSync(`curl -sf ${url}`, { stdio: 'ignore' })
      console.log(`  WordPress ${wp} is ready`)
      return
    } catch {
      if (i % 10 === 0) console.log(`  Still waiting for WordPress ${wp}...`)
      execSync('sleep 2', { stdio: 'ignore' })
    }
  }
  throw new Error(`WordPress ${wp} failed to start within 120s`)
}

// --- Test runner ---

function runTests(wp, nuxt, { wpOnly = false, nuxtOnly = false } = {}) {
  const wpPort = WP_PORTS[wp]
  if (!wpPort) {
    console.error(`Unknown WP version: ${wp}. Available: ${WP_VERSIONS.join(', ')}`)
    process.exit(1)
  }
  if (!NUXT_PORTS[nuxt]) {
    console.error(`Unknown Nuxt fixture: ${nuxt}. Available: ${NUXT_FIXTURES.join(', ')}`)
    process.exit(1)
  }

  const wpUrl = `http://localhost:${wpPort}`
  const project = wpOnly ? '--project=wordpress' : nuxtOnly ? `--project=${nuxt}` : ''

  console.log(`\n▶ Running tests: WP ${wp} (${wpUrl}) + ${nuxt}${wpOnly ? ' [wp-only]' : nuxtOnly ? ' [nuxt-only]' : ''}`)

  execSync(`npx playwright test ${project}`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      WPNUXT_WORDPRESS_URL: wpUrl,
      NUXT_FIXTURE: nuxt,
      ...(wpOnly ? { SKIP_WEB_SERVER: '1' } : {})
    }
  })
}

// --- Main ---

const useDocker = !values['no-docker']

if (values.all) {
  for (const wp of WP_VERSIONS) {
    if (useDocker) {
      dockerUp(wp)
      waitForWordPress(wp)
      dockerSetup(wp)
    }
    try {
      for (const nuxt of NUXT_FIXTURES) {
        runTests(wp, nuxt)
      }
    } finally {
      if (useDocker) dockerDown(wp)
    }
  }
} else {
  const wp = values.wp
  if (useDocker) {
    dockerUp(wp)
    waitForWordPress(wp)
    dockerSetup(wp)
  }
  try {
    runTests(wp, values.nuxt, {
      wpOnly: values['wp-only'],
      nuxtOnly: values['nuxt-only']
    })
  } finally {
    if (useDocker) dockerDown(wp)
  }
}
