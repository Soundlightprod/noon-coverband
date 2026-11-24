/* NooN Coverband — menu, lecteurs vidéo au clic, galerie, formulaire */
(function () {
  'use strict';

  /* ---------- Menu mobile ---------- */
  var toggle = document.getElementById('navToggle');
  var navList = document.querySelector('nav ul');
  var overlay = document.getElementById('navOverlay');
  if (toggle && navList && overlay) {
    var setMenu = function (open) {
      navList.classList.toggle('open', open);
      toggle.classList.toggle('active', open);
      overlay.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    toggle.addEventListener('click', function () { setMenu(!navList.classList.contains('open')); });
    overlay.addEventListener('click', function () { setMenu(false); });
    navList.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navList.classList.contains('open')) { setMenu(false); toggle.focus(); }
    });
  }

  /* ---------- Vidéos : la lecture et le son démarrent au clic ---------- */
  document.querySelectorAll('.yt[data-id]').forEach(function (box) {
    var id = box.getAttribute('data-id');
    var btn = box.querySelector('.yt-btn');
    var img = box.querySelector('img');
    if (!btn) return;
    if (img) {
      img.addEventListener('error', function () { img.style.display = 'none'; });
      if (box.hasAttribute('data-hd')) { // vignette haute définition si elle existe
        var hd = new Image();
        hd.onload = function () { if (hd.naturalWidth >= 1000) img.src = hd.src; };
        hd.src = 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg';
      }
    }
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1';
      f.title = box.getAttribute('data-title') || 'Vidéo NooN Coverband';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.setAttribute('allowfullscreen', '');
      box.textContent = '';
      box.appendChild(f);
      f.focus();
    });
  });

  /* ---------- Galerie : visionneuse ouverte et fermée au clavier ---------- */
  var dlg = document.getElementById('lightbox');
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery button[data-full]'));
  if (dlg && items.length && typeof dlg.showModal === 'function') {
    var lbImg = dlg.querySelector('img');
    var lbCount = dlg.querySelector('.lb-count');
    var current = 0, opener = null;
    var show = function (i) {
      current = (i + items.length) % items.length;
      var b = items[current];
      lbImg.src = b.getAttribute('data-full');
      lbImg.alt = b.getAttribute('data-alt') || '';
      lbCount.textContent = (current + 1) + ' / ' + items.length;
    };
    items.forEach(function (b, i) {
      b.addEventListener('click', function () { opener = b; show(i); dlg.showModal(); dlg.querySelector('.lb-close').focus(); });
    });
    dlg.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
    dlg.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
    dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.classList.contains('lb-stage')) dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    });
    dlg.addEventListener('close', function () { lbImg.removeAttribute('src'); if (opener) opener.focus(); });
  }

  /* ---------- Formulaire ---------- */
  var form = document.getElementById('contact-form');
  if (!form) return;
  var statusEl = document.getElementById('form-status');
  var dateInput = document.getElementById('f-date');
  var dateTbd = document.getElementById('f-date-tbd');
  dateTbd.addEventListener('change', function () {
    dateInput.disabled = dateTbd.checked;
    if (dateTbd.checked) dateInput.value = '';
  });
  form.addEventListener('reset', function () { setTimeout(function () { dateInput.disabled = false; }, 0); });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = form.querySelector('.submit-btn');
    var val = function (id) { return document.getElementById(id).value; };
    var payload = {
      nom: val('f-nom'), prenom: val('f-prenom'), email: val('f-email'),
      jesuis: val('f-jesuis'), objet: val('f-objet'),
      evenement: val('f-evenement'),
      date: dateTbd.checked ? '' : val('f-date'),
      date_a_definir: dateTbd.checked,
      ville: val('f-ville'),
      message: val('f-message')
    };
    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';
    statusEl.textContent = '';
    statusEl.className = 'form-status';
    try {
      var res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      var data = await res.json();
      if (res.ok && data.ok) {
        statusEl.textContent = 'Merci, votre demande est bien envoyée. Nous revenons vers vous rapidement.';
        statusEl.classList.add('success');
        form.reset();
      } else {
        throw new Error((data && data.error) || 'Erreur inconnue');
      }
    } catch (err) {
      // Les données saisies sont conservées : le formulaire n'est pas réinitialisé.
      statusEl.textContent = "L'envoi n'a pas abouti. Vos informations sont conservées : réessayez, ou écrivez à contact@soundlightprod.fr ou appelez le 06 31 94 96 53.";
      statusEl.classList.add('error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Envoyer ma demande';
      statusEl.setAttribute('tabindex', '-1');
      statusEl.focus({ preventScroll: false });
    }
  });
})();
