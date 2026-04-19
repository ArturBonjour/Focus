// Inlined script to avoid flash of wrong theme on first render
export function ThemeScript() {
  const script = `
(function() {
  try {
    var t = localStorage.getItem('nt-theme');
    if (!t) {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {}
})();
  `.trim();

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
