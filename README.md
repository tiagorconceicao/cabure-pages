# cabure-pages

Páginas públicas do Caburé Studio (GitHub Pages): política de privacidade e página de testadores de cada app.

- `apps.json`: um item por app. `privacy` gera `/<app>/privacy/` (PT, EN, ES); `testers` gera
  `/<app>/testers/` (`signupUrl`: formulário; `optinUrl`: link de participação do teste fechado, vazio
  até existir). Sem a chave, a página não é gerada.
- `node build.js`: gera `index.html` e as páginas de cada app (sem dependências). Os HTML gerados vão
  no repositório, porque o Pages publica a branch `main`.
- Roteiro completo: `docs/metodo/07-publicacao-e-testadores.md` do repositório `rummiclock`.

Endereços (com o usuário do GitHub; com domínio próprio, só trocar a base):
`/<app>/privacy/`, `/<app>/testers/`.
