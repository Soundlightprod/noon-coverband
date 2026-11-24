export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact' && request.method === 'POST') {
      return handleContact(request, env);
    }

    // Anciennes adresses : redirection permanente vers les adresses canoniques.
    if (url.pathname === '/index.html') {
      return Response.redirect(url.origin + '/' + url.search, 301);
    }
    if (url.pathname === '/videos.html') {
      return Response.redirect(url.origin + '/videos' + url.search, 301);
    }

    // Tout le reste (index.html, videos.html, assets/...) est servi tel quel.
    return env.ASSETS.fetch(request);
  }
};

const MAX = { nom: 120, prenom: 120, email: 200, court: 200, message: 5000 };

function clean(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

async function handleContact(request, env) {
  try {
    const data = await request.json();

    const nom = clean(data.nom, MAX.nom);
    const prenom = clean(data.prenom, MAX.prenom);
    const email = clean(data.email, MAX.email);
    const jesuis = clean(data.jesuis, MAX.court);
    const objet = clean(data.objet, MAX.court);
    const evenement = clean(data.evenement, MAX.court);
    const dateADefinir = data.date_a_definir === true || data.date_a_definir === 'true';
    const date = dateADefinir ? 'Date à définir' : clean(data.date, MAX.court);
    const ville = clean(data.ville, MAX.court);
    const message = clean(data.message, MAX.message);

    if (!nom || !email || !message) {
      return json({ ok: false, error: 'Champs requis manquants (nom, e-mail ou message).' }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: 'Adresse e-mail invalide.' }, 400);
    }

    const subject = `${objet || 'Nouveau message'} — ${nom}${prenom ? ' ' + prenom : ''}${ville ? ' (' + ville + ')' : ''}`;
    const text =
`Nouvelle demande depuis le site NooN Coverband

Nom : ${nom}
Prénom : ${prenom || '-'}
E-mail : ${email}
Je suis : ${jesuis || '-'}
Objet : ${objet || '-'}

Type d'événement : ${evenement || '-'}
Date ou période : ${date || '-'}
Ville du lieu : ${ville || '-'}

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
