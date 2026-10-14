// Gera as páginas públicas do Caburé Studio a partir de apps.json (sem dependências): node build.js
//
//   index.html                       lista de apps
//   <slug>/index.html                links do app (política e testadores)
//   <slug>/privacy/index.html        política de privacidade (PT, EN, ES), a partir de `privacy`
//   <slug>/testers/index.html        como testar antes da publicação, a partir de `testers`
//
// Um app novo = um item em apps.json; o que ainda não existe fica vazio ("") e a página mostra "Em breve".
// Um app sem `privacy` ou sem `testers` não ganha a página correspondente.
const fs = require('node:fs');
const path = require('node:path');

const { studio, apps } = JSON.parse(fs.readFileSync(path.join(__dirname, 'apps.json'), 'utf8'));

const esc = (text) =>
  String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const STYLE = `
  :root { --bg: #fbfaf7; --fg: #1f1d1a; --muted: #5d584f; --accent: #405642; --on-accent: #fff; --card: #fff; --line: #ddd7cb; --warn: #fff3d6; --warn-line: #d9b45a; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #16140f; --fg: #ece7dc; --muted: #a8a193; --accent: #5a7d5e; --on-accent: #fff; --card: #211e17; --line: #36322a; --warn: #3a2f12; --warn-line: #8c7747; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 19px/1.55 system-ui, sans-serif; }
  main { max-width: 36rem; margin: 0 auto; padding: 1.5rem 1rem 4rem; }
  h1 { font-size: 1.7rem; line-height: 1.2; margin: .5rem 0; }
  h2 { font-size: 1.25rem; margin: 2rem 0 .5rem; }
  p { margin: .5rem 0; }
  ul { padding-left: 1.2rem; }
  .muted { color: var(--muted); font-size: .9rem; }
  .step { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 1.1rem; margin: 1rem 0; }
  .step h2 { margin: 0 0 .4rem; font-size: 1.2rem; }
  .num { display: inline-grid; place-items: center; width: 2rem; height: 2rem; border-radius: 50%; background: var(--accent); color: var(--on-accent); font-weight: 700; margin-right: .5rem; }
  .button { display: block; text-align: center; padding: 1rem; margin-top: .8rem; border-radius: 12px; background: var(--accent); color: var(--on-accent); font-weight: 700; text-decoration: none; font-size: 1.1rem; }
  .button[aria-disabled="true"] { background: var(--line); color: var(--muted); pointer-events: none; }
  .warn { background: var(--warn); border: 1px solid var(--warn-line); border-radius: 12px; padding: 1rem; margin: 1.5rem 0; }
  a { color: var(--accent); }
  nav.langs { display: flex; gap: 1rem; margin: 1rem 0 0; }
  section.lang { border-top: 1px solid var(--line); padding-top: 1rem; margin-top: 2rem; }
  details { border-top: 1px solid var(--line); padding: .7rem 0; }
  summary { cursor: pointer; font-weight: 600; }
  ul.apps { list-style: none; padding: 0; }
  ul.apps li { margin: .6rem 0; padding: 1rem; background: var(--card); border: 1px solid var(--line); border-radius: 12px; }
  ul.apps a { margin-right: 1rem; }
`;

function page({ title, body, description, lang = 'pt-BR', noindex = false }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<style>${STYLE}</style>
</head>
<body>
<main>
${body}
</main>
</body>
</html>
`;
}

const footer = () =>
  `<p class="muted">${esc(studio.name)} · <a href="mailto:${esc(studio.contact)}">${esc(studio.contact)}</a></p>`;

const write = (file, content) => {
  const target = path.join(__dirname, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
};

// ---------- política de privacidade ----------

const POLICY_TEXT = {
  pt: {
    code: 'pt-BR', label: 'Português', title: 'Política de Privacidade', updated: 'Última atualização',
    intro: (app, about) => `O ${app} é ${about}, feito pelo ${studio.name}. Esta política explica, de forma direta, o que o app faz com os seus dados.`,
    summaryH: 'Resumo',
    summary: (app, extra) => `<strong>O ${app} não coleta, não envia e não vende nenhum dado seu.</strong> Tudo fica no seu aparelho. ${extra}`,
    storedH: 'O que fica guardado no aparelho', sharingH: 'O que você pode exportar e compartilhar',
    permissionsH: 'Permissões do Android', childrenH: 'Crianças',
    children: (age) => `O app é indicado para maiores de ${age} anos. Ele não coleta dados de ninguém, inclusive de menores.`,
    changesH: 'Mudanças', changes: 'Se o app passar a tratar dados de outra forma, esta política será atualizada antes e a data acima mudará.',
    contactH: 'Contato', contact: 'Dúvidas',
  },
  en: {
    code: 'en', label: 'English', title: 'Privacy Policy', updated: 'Last updated',
    intro: (app, about) => `${app} is ${about}, made by ${studio.name}. This policy explains plainly what the app does with your data.`,
    summaryH: 'Summary',
    summary: (app, extra) => `<strong>${app} does not collect, send or sell any of your data.</strong> Everything stays on your device. ${extra}`,
    storedH: 'What is stored on your device', sharingH: 'What you can export and share',
    permissionsH: 'Android permissions', childrenH: 'Children',
    children: (age) => `The app is intended for people aged ${age} and over. It does not collect data from anyone, including minors.`,
    changesH: 'Changes', changes: 'If the app starts handling data differently, this policy will be updated first and the date above will change.',
    contactH: 'Contact', contact: 'Questions',
  },
  es: {
    code: 'es', label: 'Español', title: 'Política de Privacidad', updated: 'Última actualización',
    intro: (app, about) => `${app} es ${about}, hecha por ${studio.name}. Esta política explica de forma directa qué hace la app con tus datos.`,
    summaryH: 'Resumen',
    summary: (app, extra) => `<strong>${app} no recopila, no envía y no vende ninguno de tus datos.</strong> Todo queda en tu dispositivo. ${extra}`,
    storedH: 'Qué se guarda en el dispositivo', sharingH: 'Qué puedes exportar y compartir',
    permissionsH: 'Permisos de Android', childrenH: 'Niños',
    children: (age) => `La app está indicada para mayores de ${age} años. No recopila datos de nadie, tampoco de menores.`,
    changesH: 'Cambios', changes: 'Si la app pasa a tratar datos de otra forma, esta política se actualizará antes y la fecha de arriba cambiará.',
    contactH: 'Contacto', contact: 'Dudas',
  },
};

const MONTHS = {
  pt: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
};

function longDate(lang, iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const month = MONTHS[lang][m - 1];
  if (lang === 'en') return `${month} ${d}, ${y}`;
  return `${d} de ${month} de ${y}`;
}

function policySection(app, lang) {
  const t = POLICY_TEXT[lang];
  const p = app.privacy;
  const list = p.stored[lang].map((item) => `  <li>${esc(item)}</li>`).join('\n');
  return `<section id="${lang}" class="lang" lang="${t.code}">
<h1>${t.title}</h1>
<p class="muted">${t.updated}: ${longDate(lang, p.updated)}</p>
<p>${t.intro(esc(app.name), esc(p.about[lang]))}</p>
<h2>${t.summaryH}</h2>
<p>${t.summary(esc(app.name), esc(p.noAccountFeatures[lang]))}</p>
<h2>${t.storedH}</h2>
<ul>
${list}
</ul>
<p>${esc(p.storedNote[lang])}</p>
<h2>${t.sharingH}</h2>
<p>${p.sharing[lang]}</p>
<h2>${t.permissionsH}</h2>
<p>${esc(p.permissions[lang])}</p>
<h2>${t.childrenH}</h2>
<p>${t.children(p.minAge)}</p>
<h2>${t.changesH}</h2>
<p>${t.changes}</p>
<h2>${t.contactH}</h2>
<p>${t.contact}: <a href="mailto:${esc(studio.contact)}">${esc(studio.contact)}</a>.</p>
</section>`;
}

function privacyPage(app) {
  const langs = ['pt', 'en', 'es'];
  const nav = langs.map((l) => `<a href="#${l}">${POLICY_TEXT[l].label}</a>`).join('\n  ');
  return page({
    title: `${app.name} — Política de Privacidade / Privacy Policy / Política de Privacidad`,
    description: `Política de privacidade do app ${app.name}, do ${studio.name}.`,
    body: `<h1>${esc(app.name)}</h1>
<p class="muted">${esc(studio.name)} · ${esc(app.package)}</p>
<nav class="langs" aria-label="Language / Idioma">
  ${nav}
</nav>
${langs.map((l) => policySection(app, l)).join('\n\n')}`,
  });
}

// ---------- testadores ----------

function button(url, label, soon) {
  return url
    ? `<a class="button" href="${esc(url)}">${esc(label)}</a>`
    : `<a class="button" aria-disabled="true" href="#">${esc(soon)}</a>`;
}

function testersPage(app) {
  const t = app.testers;
  return page({
    title: `Testar o ${app.name}`,
    description: `Como testar o ${app.name} antes da publicação.`,
    noindex: true,
    body: `<h1>Testar o ${esc(app.name)}</h1>
<p>${esc(app.tagline)}. Obrigado por ajudar! O Google exige que um grupo de pessoas teste o app por <strong>${t.days} dias</strong> antes de ele ser publicado. Você só precisa de um <strong>celular Android</strong> e de uma <strong>conta Google</strong> (a mesma do Gmail e da Play Store).</p>

<section class="step">
  <h2><span class="num">1</span>Peça seu acesso</h2>
  <p>Informe seu nome e o <strong>e-mail da conta Google do celular</strong>. Eu libero o seu acesso, o que pode levar até 1 dia.</p>
  ${button(t.signupUrl, 'Pedir acesso', 'Em breve')}
</section>

<section class="step">
  <h2><span class="num">2</span>Aceite o convite</h2>
  <p>Quando eu avisar que está liberado, toque no botão abaixo <strong>no celular</strong> e depois em <strong>“Tornar-se testador”</strong>.</p>
  ${button(t.optinUrl, 'Aceitar o convite', 'Em breve: eu aviso quando abrir')}
</section>

<section class="step">
  <h2><span class="num">3</span>Instale e use</h2>
  <p>Toque em <strong>“Instalar”</strong> na Play Store e abra o ${esc(app.name)}. Use algumas vezes nos próximos ${t.days} dias, por exemplo numa noite de jogos com os amigos.</p>
</section>

<div class="warn">
  <strong>Importante:</strong> não saia do teste nem desinstale o app durante os ${t.days} dias. O Google conta os dias seguidos: se você sair, a sua contagem recomeça.
</div>

<h2>Dúvidas comuns</h2>
<details><summary>Não tenho Android</summary><p>Infelizmente o teste é só para celulares Android.</p></details>
<details><summary>Apareceu “app não encontrado” ou “indisponível”</summary><p>Confira se você está logado no celular com o <strong>mesmo e-mail</strong> que me passou. Se estiver, espere algumas horas e tente de novo: o Google demora um pouco para liberar.</p></details>
<details><summary>O que o app faz com os meus dados?</summary><p>Nada sai do seu celular. Seu e-mail só é usado para liberar o teste.${app.privacy ? ` Veja a <a href="../privacy/">política de privacidade</a>.` : ''}</p></details>
<details><summary>Quero sair do teste</summary><p>Pode sair quando quiser, é só me avisar. Se puder, fique até o fim dos ${t.days} dias: ajuda muito.</p></details>
${footer()}`,
  });
}

// ---------- páginas de entrada ----------

function appHub(app) {
  const links = [
    app.testers && `<li><a href="testers/">Testar o app (teste fechado)</a></li>`,
    app.privacy && `<li><a href="privacy/">Política de privacidade</a></li>`,
  ].filter(Boolean);
  return page({
    title: `${app.name} · ${studio.name}`,
    description: `${app.name}: ${app.tagline}.`,
    body: `<h1>${esc(app.name)}</h1>
<p>${esc(app.tagline)}.</p>
<ul>
${links.join('\n')}
</ul>
${footer()}`,
  });
}

function indexPage() {
  const items = apps
    .map((app) => {
      const links = [
        app.testers && `<a href="${esc(app.slug)}/testers/">Testar</a>`,
        app.privacy && `<a href="${esc(app.slug)}/privacy/">Privacidade</a>`,
      ].filter(Boolean);
      return `<li><strong>${esc(app.name)}</strong><br><span class="muted">${esc(app.tagline)}</span><br>${links.join(' ')}</li>`;
    })
    .join('\n');
  return page({
    title: studio.name,
    description: `Apps do ${studio.name}: testes e política de privacidade.`,
    body: `<h1>${esc(studio.name)}</h1>
<p>Aplicativos, testes e políticas de privacidade.</p>
<ul class="apps">
${items}
</ul>
${footer()}`,
  });
}

write('index.html', indexPage());
const made = ['index.html'];
for (const app of apps) {
  write(`${app.slug}/index.html`, appHub(app));
  made.push(`${app.slug}/index.html`);
  if (app.privacy) {
    write(`${app.slug}/privacy/index.html`, privacyPage(app));
    made.push(`${app.slug}/privacy/index.html`);
  }
  if (app.testers) {
    write(`${app.slug}/testers/index.html`, testersPage(app));
    made.push(`${app.slug}/testers/index.html`);
  }
}
console.log(`Gerado: ${made.join(', ')}`);
