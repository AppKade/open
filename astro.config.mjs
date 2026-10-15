import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import lucode from 'lucode-starlight';

export default defineConfig({
  site: 'https://open.appkade.lk',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'AppKade Open',
      customCss: ['./src/styles/site.css','./src/styles/brand.css'],
      plugins: [lucode({navLinks: [
        { label: 'Projects', link: '/projects/' },
        { label: 'Contributors', link: '/contributors/' },
        { label: 'Leaderboard', link: '/leaderboard/' },
        { label: 'Contribute', link: '/contribute/' },
      ]})],
      sidebar: [
        { label: 'AppKade Open', items: [
          {label: 'Introduction', link: '/docs/'},
          {label: 'Getting started', link: '/docs/getting-started/'},
          {label: 'Contributing', link: '/docs/contributing/'},
        ] },
      ],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/AppKade/open' }],
      editLink: { baseUrl: 'https://github.com/AppKade/open/edit/main/' },
    })
  ],
});
