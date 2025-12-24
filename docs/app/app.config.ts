export default defineAppConfig({
  ui: {
    colors: {
      primary: 'reefgold',
      secondary: 'woodsmoke',
      neutral: 'neutral'
    },
    content: {
      prose: {
        code: {
          icon: {
            // terminal: 'i-ph-terminal'
          }
        }
      }
    },
    footer: {
      slots: {
        bottom: {
          left: 'text-sm text-gray-500 dark:text-gray-400',
          wrapper: 'border-t border-gray-200 dark:border-gray-800'
        }
      }
    }
  },
  seo: {
    siteName: 'WPNuxt '
  },
  header: {
    logo: {
      alt: '',
      light: '',
      dark: ''
    },
    search: true,
    colorMode: true,
    links: [{
      icon: 'i-simple-icons-github',
      to: 'https://github.com/wpnuxt/wpnuxt-core',
      target: '_blank',
      ariaLabel: 'WPNuxt on GitHub'
    }]
  },
  footer: {
    credits: 'Copyright ©2025 WPNuxt',
    colorMode: false,
    links: [{
      icon: 'i-simple-icons-nuxtdotjs',
      to: 'https://nuxt.com',
      target: '_blank',
      ariaLabel: 'Nuxt Website'
    },
    {
      icon: 'i-simple-icons-github',
      to: 'https://github.com/wpnuxt/wpnuxt-core',
      target: '_blank',
      ariaLabel: 'WPNuxt on GitHub'
    }]
  },
  toc: {
    title: 'Table of Contents',
    wpnuxt: {
      title: 'WPNuxt',
      links: [
        {
          icon: 'i-ph-shooting-star-duotone',
          label: 'Star on GitHub',
          to: 'https://github.com/wpnuxt/wpnuxt-core',
          target: '_blank'
        },
        {
          icon: 'i-skill-icons-discord',
          iconClass: 'opacity-80 hover:opacity-100',
          label: 'Chat on Discord',
          to: 'https://discord.gg/fhkUwW98Bu',
          target: '_blank'
        },
        {
          icon: 'i-ph-x-logo',
          label: 'Follow on X',
          to: 'https://x.com/wpnuxt',
          target: '_blank'
        },
        {
          icon: 'i-ph-hand-heart-duotone',
          label: 'Become a Sponsor',
          to: 'https://github.com/sponsors/vernaillen',
          target: '_blank'
        }
      ]
    },
    bottom: {
      title: 'Nuxt Community',
      links: [
        {
          icon: 'i-simple-icons-nuxtdotjs',
          label: 'Nuxt docs',
          to: 'https://nuxt.com',
          target: '_blank'
        },
        {
          icon: 'i-ph-chat-centered-text-duotone',
          label: 'Nuxt Discord',
          to: 'https://chat.nuxt.dev',
          target: '_blank'
        }
      ]
    }
  }
})
