// Cloudflare Worker — Cartelera proxy
// Deploy at: https://cartelera-proxy.felipestesta.workers.dev/
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const tag = url.searchParams.get('tag');
    if (!id) return new Response('missing id', {status:400});
    let target = `https://cartelera.med.unlp.edu.ar/catedra/${id}`;
    if (tag) target += `/etiqueta/${tag}`;
    const html = await (await fetch(target)).text();
    return new Response(html, { headers: {
      'Access-Control-Allow-Origin':'*',
      'Content-Type':'text/html; charset=utf-8'
    }});
  }
};
