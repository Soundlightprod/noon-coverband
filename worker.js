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

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // ⚠️ Tant que soundlightprod.fr n'est pas vérifié sur Resend, on utilise l'adresse
        // d'onboarding fournie par Resend. Une fois le domaine vérifié dans Resend,
        // remplacer par contact@soundlightprod.fr.
        from: 'NooN Coverband <onboarding@resend.dev>',
        to: ['contact@soundlightprod.fr'],
        reply_to: email,
        subject,
        text
      })
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      const keyDebug = {
        present: !!env.RESEND_API_KEY,
        length: (env.RESEND_API_KEY || '').length,
        prefix: (env.RESEND_API_KEY || '').slice(0, 5),
        suffix: (env.RESEND_API_KEY || '').slice(-3)
      };
      return json({ ok: false, error: `Resend: ${errText}`, keyDebug }, 502);
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
