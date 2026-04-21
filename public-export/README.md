# Graft

Graft is a desktop plugin marketplace that lets users install and manage community-built extensions for supported apps.

This is the public repository for the Graft desktop app code and community collaboration.

## Status

Graft is under active development.

## What This Public Repo Includes

- Desktop app UI and marketplace experience
- Auth and account flow integration (Supabase anon client)
- Plugin discovery and install UX scaffolding
- Electron shell and routing

## What Stays Private

To protect users and infrastructure, these stay in the private repository:

- Supabase project internals (`supabase/` migrations, config, schema)
- Internal security operations and incident processes
- Production deployment and secret management scripts
- Sensitive roadmap and internal business docs

## Getting Started

### Requirements

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Security

Please do not open public issues for sensitive vulnerabilities.

Use [SECURITY.md](./SECURITY.md) for coordinated disclosure.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT. See [LICENSE](./LICENSE).
