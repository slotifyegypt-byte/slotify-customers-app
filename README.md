# Slotify (customer app)

Expo / React Native app where customers find businesses and book. Design and conventions: [docs/DESIGN.md](docs/DESIGN.md).
Backend and its docs: the Backend repo (`docs/developer-guide.md`).

## Environments and branches

| Branch | EAS build profile / environment | Supabase project |
| --- | --- | --- |
| `main` | `production` / `production` | **Slotify** (`razxudowdgluavqycujt`): production, real data only |
| `staging` | `staging` / `preview` | **Slotify Beta** (`umkucasbfmizfjpvhund`): development and testing, demo data |
| `development` | `development` / `development` | **Slotify Beta** |

Local runs use `.env.local`, which points to Slotify Beta. Demo customers there: `lina@slotify.dev`,
`customer1@seed.slotify.dev` … (password `password123`; "Sign in with password" on the sign-in screen in development
and staging builds).

## Commands

```
npm start              # Expo dev server
npx tsc --noEmit       # types
npx jest               # tests
```
