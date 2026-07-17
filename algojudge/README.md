# CodeForge frontend

The CodeForge frontend is a React 19 and Vite application for DSA practice,
timed coding assessments, and faculty test management. It uses Tailwind CSS for
the interface, React Router for student/faculty flows, and Monaco Editor for the
coding workspace.

## Development

```bash
cp .env.example .env
npm install
npm run dev
```

`VITE_API_ORIGIN` defaults to `http://localhost:8080`.

## Verification

```bash
npm run check
```

This runs linting, unit tests, and a production build. See the
[repository README](../README.md) for architecture and full-stack setup.
