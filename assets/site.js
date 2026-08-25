const SITE = (() => {
  const catalogUrl = 'content/catalog.json';

  const escapeHtml = value => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const slugify = text => String(text)
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'section';

  function inline(text) {
    let s = escapeHtml(text);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    return s;
  }

  function renderMarkdown(markdown) {
    const lines = String(markdown).replace(/\r\n/g, '\n').split('\n');
    const html = [];
    const headings = [];
    let inCode = false;
    let code = [];
    let codeLang = '';
    let listType = null;
    let paragraph = [];

    const flushParagraph = () => {
      if (!paragraph.length) return;
      html.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    };
    const closeList = () => {
      if (!listType) return;
      html.push(`</${listType}>`);
      listType = null;
    };
    const openList = type => {
      if (listType === type) return;
      closeList();
      listType = type;
      html.push(`<${type}>`);
    };

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const trimmed = raw.trim();

      if (inCode) {
        if (trimmed.startsWith('```')) {
          html.push(`<pre><code data-lang="${escapeHtml(codeLang)}">${escapeHtml(code.join('\n'))}</code></pre>`);
          inCode = false;
          code = [];
          codeLang = '';
        } else {
          code.push(raw);
        }
        continue;
      }

      if (trimmed.startsWith('```')) {
        flushParagraph();
        closeList();
        inCode = true;
        codeLang = trimmed.slice(3).trim();
        continue;
      }

      if (!trimmed) {
        flushParagraph();
        closeList();
        continue;
      }

      const heading = raw.match(/^(#{1,4})\s+(.+)$/);
      if (heading) {
        flushParagraph();
        closeList();
        const depth = heading[1].length;
        const text = heading[2].replace(/\s+#+\s*$/, '');
        const id = `${slugify(text)}-${headings.length + 1}`;
        headings.push({depth, text: text.replace(/[`*_~]/g, ''), id});
        html.push(`<h${depth} id="${id}">${inline(text)}</h${depth}>`);
        continue;
      }

      if (trimmed.startsWith('> ')) {
        flushParagraph();
        closeList();
        const quote = [trimmed.slice(2)];
        while (i + 1 < lines.length && lines[i + 1].trim().startsWith('> ')) {
          i++;
          quote.push(lines[i].trim().slice(2));
        }
        html.push(`<blockquote>${quote.map(x => `<p>${inline(x)}</p>`).join('')}</blockquote>`);
        continue;
      }

      const tableSep = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;
      if (raw.includes('|') && i + 1 < lines.length && tableSep.test(lines[i + 1])) {
        flushParagraph();
        closeList();
        const splitRow = line => line.trim().replace(/^\||\|$/g, '').split('|').map(x => x.trim());
        const header = splitRow(raw);
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
          rows.push(splitRow(lines[i]));
          i++;
        }
        i--;
        html.push('<table><thead><tr>' + header.map(x => `<th>${inline(x)}</th>`).join('') + '</tr></thead><tbody>' +
          rows.map(row => '<tr>' + row.map(x => `<td>${inline(x)}</td>`).join('') + '</tr>').join('') +
          '</tbody></table>');
        continue;
      }

      const bullet = raw.match(/^\s*[-*+]\s+(.+)$/);
      if (bullet) {
        flushParagraph();
        openList('ul');
        html.push(`<li>${inline(bullet[1])}</li>`);
        continue;
      }

      const numbered = raw.match(/^\s*\d+[.)]\s+(.+)$/);
      if (numbered) {
        flushParagraph();
        openList('ol');
        html.push(`<li>${inline(numbered[1])}</li>`);
        continue;
      }

      if (/^---+$/.test(trimmed)) {
        flushParagraph();
        closeList();
        html.push('<hr>');
        continue;
      }

      paragraph.push(trimmed);
    }

    if (inCode) html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
    flushParagraph();
    closeList();
    return {html: html.join('\n'), headings};
  }

  async function loadCatalog() {
    const r = await fetch(catalogUrl, {cache: 'no-store'});
    if (!r.ok) throw new Error(`目錄載入失敗（${r.status}）`);
    return r.json();
  }

  function chrome(active) {
    const links = [
      ['home', 'index.html', '研究入口'],
      ['results', 'results.html', '實驗結果'],
      ['docs', 'reader.html?id=spec', '研究文件'],
      ['code', 'code.html?id=ataxx-cpp', '程式碼'],
      ['viewer', 'viewer.html', '對局檢視器'],
    ];
    return `<header class="topbar"><div class="topbar-inner"><a class="brand" href="index.html">ATAXX-VarBench</a><nav class="nav">${links.map(([id, href, label]) => `<a href="${href}"${id === active ? ' style="font-weight:800;color:#15213a"' : ''}>${label}</a>`).join('')}</nav></div></header>`;
  }

  function footer(snapshot) {
    return `<footer class="footer">本公開 Pages 是唯讀展示快照。正式研究權威仍為 private C++ repository、凍結的 protocol 與通過驗證的 artifacts。${snapshot ? ` 快照來源 commit：<code>${escapeHtml(snapshot)}</code>。` : ''}</footer>`;
  }

  async function initHome() {
    document.body.insertAdjacentHTML('afterbegin', chrome('home'));
    const catalog = await loadCatalog();
    const docs = catalog.items.filter(x => x.type === 'doc');
    const code = catalog.items.filter(x => x.type === 'code');
    const docGrid = document.querySelector('#docGrid');
    const codeGrid = document.querySelector('#codeGrid');
    docGrid.innerHTML = docs.slice(0, 6).map(item => `<a class="card card-link" href="reader.html?id=${encodeURIComponent(item.id)}"><span class="pill">${escapeHtml(item.group)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description || '')}</p></a>`).join('');
    codeGrid.innerHTML = code.slice(0, 6).map(item => `<a class="card card-link" href="code.html?id=${encodeURIComponent(item.id)}"><span class="pill">${escapeHtml(item.group)}</span><h3>${escapeHtml(item.title)}</h3><p><code>${escapeHtml(item.source_path)}</code></p></a>`).join('');
    document.body.insertAdjacentHTML('beforeend', footer(catalog.private_source_commit));
  }

  async function initResults() {
    document.body.insertAdjacentHTML('afterbegin', chrome('results'));
    const catalog = await loadCatalog();
    document.body.insertAdjacentHTML('beforeend', footer(catalog.private_source_commit));
  }

  async function initReader() {
    document.body.insertAdjacentHTML('afterbegin', chrome('docs'));
    const catalog = await loadCatalog();
    const id = new URLSearchParams(location.search).get('id') || 'spec';
    const item = catalog.items.find(x => x.id === id && x.type === 'doc');
    if (!item) throw new Error(`找不到文件：${id}`);
    const r = await fetch(item.snapshot_path, {cache: 'no-store'});
    if (!r.ok) throw new Error(`文件載入失敗（${r.status}）`);
    const text = await r.text();
    const rendered = renderMarkdown(text);
    document.title = `${item.title} · ATAXX-VarBench`;
    document.querySelector('#docTitle').textContent = item.title;
    document.querySelector('#docMeta').innerHTML = `<span class="pill">${escapeHtml(item.group)}</span><span>來源：<code>${escapeHtml(item.source_path)}</code></span><span>快照：<code>${escapeHtml(item.source_commit || catalog.private_source_commit)}</code></span>`;
    document.querySelector('#article').innerHTML = rendered.html;
    document.querySelector('#toc').innerHTML = '<h3>本頁目錄</h3>' + rendered.headings.filter(x => x.depth <= 3).map(x => `<a class="depth-${x.depth}" href="#${x.id}">${escapeHtml(x.text)}</a>`).join('');
    const select = document.querySelector('#docSelect');
    catalog.items.filter(x => x.type === 'doc').forEach(x => {
      const o = document.createElement('option');
      o.value = x.id;
      o.textContent = x.title;
      o.selected = x.id === id;
      select.appendChild(o);
    });
    select.onchange = () => location.href = `reader.html?id=${encodeURIComponent(select.value)}`;
    document.body.insertAdjacentHTML('beforeend', footer(catalog.private_source_commit));
  }

  async function initCode() {
    document.body.insertAdjacentHTML('afterbegin', chrome('code'));
    const catalog = await loadCatalog();
    const id = new URLSearchParams(location.search).get('id') || 'ataxx-cpp';
    const item = catalog.items.find(x => x.id === id && x.type === 'code');
    if (!item) throw new Error(`找不到程式碼檔案：${id}`);
    const r = await fetch(item.snapshot_path, {cache: 'no-store'});
    if (!r.ok) throw new Error(`程式碼載入失敗（${r.status}）`);
    const text = await r.text();
    document.title = `${item.title} · 程式碼 · ATAXX-VarBench`;
    document.querySelector('#codeTitle').textContent = item.title;
    document.querySelector('#codeMeta').innerHTML = `<span class="pill">${escapeHtml(item.group)}</span><span><code>${escapeHtml(item.source_path)}</code></span><span>快照 <code>${escapeHtml(item.source_commit || catalog.private_source_commit)}</code></span>`;
    const tbody = document.querySelector('#codeBody');
    tbody.innerHTML = text.split('\n').map((line, i) => `<tr id="L${i + 1}"><td class="line-no"><a href="#L${i + 1}">${i + 1}</a></td><td class="line-code">${escapeHtml(line)}</td></tr>`).join('');
    document.querySelector('#copyCode').onclick = async () => {
      await navigator.clipboard.writeText(text);
      const b = document.querySelector('#copyCode');
      b.textContent = '已複製';
      setTimeout(() => b.textContent = '複製程式碼', 1200);
    };
    const panel = document.querySelector('#filePanel');
    panel.innerHTML = '<strong>核心程式碼快照</strong>' + catalog.items.filter(x => x.type === 'code').map(x => `<a class="file-link${x.id === id ? ' active' : ''}" href="code.html?id=${encodeURIComponent(x.id)}">${escapeHtml(x.title)}</a>`).join('');
    document.body.insertAdjacentHTML('beforeend', footer(catalog.private_source_commit));
  }

  async function safeInit(fn) {
    try { await fn(); }
    catch (e) {
      console.error(e);
      const target = document.querySelector('#app') || document.querySelector('.page') || document.body;
      target.insertAdjacentHTML('beforeend', `<div class="notice warning">載入失敗：${escapeHtml(e.message)}</div>`);
    }
  }

  return {initHome, initResults, initReader, initCode, safeInit};
})();
