export function highlightCode(raw: string): string {
  const saved: string[] = [];
  const save = (html: string) => {
    const idx = saved.length;
    saved.push(html);
    return `\x00PH${idx}END\x00`;
  };
  const esc = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const result = esc
    .replace(/\/\/.*/g, (m) => save(`<span class="cmt">${m}</span>`))
    .replace(/('[^']*')/g, (m) => save(`<span class="str">${m}</span>`))
    .replace(
      /\b(import|export|from|const|let|var|new|type|interface|class|return)\b/g,
      '<span class="kw">$1</span>',
    )
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="num">$1</span>');
  const placeholderRe = new RegExp(
    `${String.fromCharCode(0)}PH(\\d+)END${String.fromCharCode(0)}`,
    'g',
  );
  return result.replace(placeholderRe, (_, i) => saved[parseInt(i, 10)]);
}
