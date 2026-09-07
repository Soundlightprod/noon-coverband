export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact' && request.method === 'POST') {
      return handleContact(request, env);
    }

    // Tout le reste (index.html, videos.html, assets/...) est servi tel quel.
    return env.ASSETS.fetch(request);
  }
};

async function handleContact(request, env) {
  try {
    const data = await request.json();

    const nom = (data.nom || '').trim();
    const prenom = (data.prenom || '').trim();
    const email = (data.email || '').trim();
    const jesuis = (data.jesuis || '').trim();
    const objet = (data.objet || '').trim();
    const message = (data.message || '').trim();

    if (!nom || !email || !message) {
      return json({ ok: false, error: 'Champs requis manquants (nom, e-mail ou message).' }, 400);
    }

    const subject = `${objet || 'Nouveau message'} — ${nom}${prenom ? ' ' + prenom : ''}`;
    const text =
`Nouvelle demande depuis le site NooN Coverband

Nom : ${nom}
Prénom : ${prenom || '-'}
E-mail : ${email}
Je suis : ${jesuis || '-'}
Objet : ${objet || '-'}

Message :
${message}`;

    const apiKey = await env.RESEND_API_KEY.get();

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'NooN Coverband <contact@soundlightprod.fr>',
        to: ['contact@soundlightprod.fr'],
        reply_to: email,
        subject,
        text
      })
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      return json({ ok: false, error: `Resend: ${errText}` }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
