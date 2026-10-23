import type {Project} from './data';

export const siteUrl = 'https://open.appkade.lk/';
export const homeTitle = 'Open-source Developer Tools, CLIs & MCP Servers';
export const homeDescription = 'Explore AppKade Open: developer tools, QR utilities, SOAP/WSDL inspection, MCP servers and WebGL components. Read the code and contribute on GitHub.';

// Render these same answers in HTML and JSON-LD so they stay consistent.
export const questions = [
  {
    id: 'what-is-appkade-open',
    question: 'What is AppKade Open?',
    answer: 'AppKade Open is the public hub for AppKade developer projects and GitHub contributions. It brings together command-line tools, Model Context Protocol (MCP) servers and web components. Each project links to its source code, setup instructions, license and open issues.',
  },
  {
    id: 'choose-a-tool',
    question: 'Which project should I start with?',
    answer: 'Use LankaQR CLI to inspect payment QR payloads, Legacy Bridge to explore SOAP/WSDL contracts, and Singularity for an animated WebGL black hole. LK Tax MCP is a Sri Lankan income-tax development preview. LK Transit MCP is a synthetic transit prototype with no live transport data.',
  },
  {
    id: 'what-is-mcp',
    question: 'What does MCP mean?',
    answer: 'MCP stands for Model Context Protocol. It lets compatible AI applications discover and call tools and read resources exposed by a server. AppKade projects document their supported hosts, local setup and current limitations in their GitHub repositories.',
  },
  {
    id: 'licenses-and-commercial-use',
    question: 'Can I use these projects commercially?',
    answer: 'Check the license in each repository before reusing or redistributing code. Licenses differ: LankaQR CLI and Legacy Bridge use MIT; LK Transit MCP uses Apache-2.0. The Singularity shader uses CC BY-NC-SA 3.0, which restricts commercial reuse. A public repository without a license does not grant an open-source license.',
  },
  {
    id: 'production-readiness',
    question: 'Are these tools ready for production?',
    answer: 'Check each project’s status and README. The collection includes experimental tools and development previews. LankaQR CLI is not a certified payment implementation. LK Tax MCP is not ready for filing, and LK Transit MCP uses invented demonstration data. Planned features are not available functionality.',
  },
  {
    id: 'how-to-contribute',
    question: 'How can I contribute without an AppKade account?',
    answer: 'Choose a repository, read its README and contribution guide, then report a reproducible bug, improve documentation or open a focused pull request on GitHub. Eligible merged pull requests on registered public AppKade repositories receive contribution points after the next successful sync. No AppKade account is required.',
  },
];

export function homeStructuredData(projects: Project[]) {
  const organization = 'https://appkade.lk/#organization';
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {'@type': 'Organization', '@id': organization, name: 'AppKade', url: 'https://appkade.lk/', logo: `${siteUrl}appkade-mark.svg`, sameAs: ['https://github.com/AppKade']},
      {'@type': 'WebSite', '@id': `${siteUrl}#website`, name: 'AppKade Open', url: siteUrl, description: homeDescription, inLanguage: 'en', publisher: {'@id': organization}},
      {
        '@type': ['CollectionPage', 'FAQPage'], '@id': `${siteUrl}#webpage`, url: siteUrl,
        name: `${homeTitle} | AppKade Open`, description: homeDescription, inLanguage: 'en',
        isPartOf: {'@id': `${siteUrl}#website`}, publisher: {'@id': organization},
        about: {'@id': `${siteUrl}#projects`},
        mainEntity: questions.map(({id, question, answer}) => ({'@type': 'Question', '@id': `${siteUrl}#${id}`, name: question, acceptedAnswer: {'@type': 'Answer', text: answer}})),
      },
      {
        '@type': 'ItemList', '@id': `${siteUrl}#projects`, name: 'AppKade developer projects', numberOfItems: projects.length,
        itemListElement: projects.map((project, index) => ({
          '@type': 'ListItem', position: index + 1,
          item: {
            '@type': 'SoftwareSourceCode', '@id': `${siteUrl}#project-${project.slug}`,
            name: project.name, description: project.description, url: `${siteUrl}#project-${project.slug}`,
            codeRepository: `https://github.com/${project.repo}`,
            ...(project.language !== 'Not implemented' ? {programmingLanguage: project.language} : {}),
            keywords: project.tags, creativeWorkStatus: project.status,
            // Avoid presenting unspecified or mixed licenses as a single SPDX license.
            ...(['MIT', 'Apache-2.0'].includes(project.license) ? {license: `https://spdx.org/licenses/${project.license}.html`} : {}),
          },
        })),
      },
    ],
  }).replace(/</g, '\\u003c');
}
