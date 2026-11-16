// Mon Petit Cuistot — animations du site (sans dépendance).
(function () {
  'use strict';
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var deux = function (n) { return String(n).padStart(2, '0'); };

  // ---------------------------------------------------------- Navigation
  var nav = document.getElementById('nav');
  if (nav) {
    var majNav = function () { nav.classList.toggle('defile', window.scrollY > 8); };
    window.addEventListener('scroll', majNav, { passive: true });
    majNav();
  }

  // ---------------------------------------------------------- Apparition au défilement
  var aMontrer = document.querySelectorAll('.apparait');
  if ('IntersectionObserver' in window && !calme) {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('vu'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    aMontrer.forEach(function (el) { obs.observe(el); });
  } else {
    aMontrer.forEach(function (el) { el.classList.add('vu'); });
  }

  // ---------------------------------------------------------- Téléphone : le générateur
  var CATS = { vege: 'Végétarien', viande: 'Viande', poisson: 'Poisson' };
  var SCENARIOS = [
    { envie: 'Un plat réconfortant pour ce soir', mode: 0, idees: [
      ['Gratin dauphinois bien crémeux', '45 min', 'vege', 'Tout dans ton stock'],
      ['Blanquette de poulet express', '35 min', 'viande', '1 ingrédient à acheter'],
      ['Soupe à l’oignon gratinée', '40 min', 'vege', 'Tout dans ton stock']] },
    { envie: 'Léger, avec mes courgettes', mode: 2, idees: [
      ['Tian de courgettes au chèvre', '40 min', 'vege', 'Tout dans ton stock'],
      ['Saumon et courgettes à la plancha', '20 min', 'poisson', 'Tout dans ton stock'],
      ['Velouté courgette et menthe', '25 min', 'vege', 'Tout dans ton stock']] },
    { envie: 'Rapide, moins de 20 minutes', mode: 1, idees: [
      ['Linguine au citron et parmesan', '15 min', 'vege', '1 ingrédient à acheter'],
      ['Wok de poulet au gingembre', '18 min', 'viande', '2 ingrédients à acheter'],
      ['Tartines sardines et tomates', '10 min', 'poisson', 'Tout dans ton stock']] }
  ];
  var envie = document.getElementById('envie');
  var idees = document.getElementById('idees');
  var modes = document.getElementById('modes');
  var reflexion = document.getElementById('reflexion');

  function carteIdee(i) {
    var d = document.createElement('div');
    d.className = 'idee';
    var titre = document.createElement('strong');
    titre.textContent = i[0];
    var meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = '<svg><use href="#i-horloge"/></svg><span></span><span class="cat ' + i[2] + '"></span>';
    meta.children[1].textContent = i[1];
    meta.children[2].textContent = CATS[i[2]];
    var dispo = document.createElement('div');
    dispo.className = 'meta';
    dispo.textContent = i[3];
    d.append(titre, meta, dispo);
    return d;
  }

  function afficherScenario(s, anime) {
    Array.prototype.forEach.call(modes.children, function (m, n) { m.classList.toggle('actif', n === s.mode); });
    idees.textContent = '';
    var cartes = s.idees.map(carteIdee);
    cartes.forEach(function (c) { idees.appendChild(c); });
    if (!anime) { cartes.forEach(function (c) { c.classList.add('visible'); }); return Promise.resolve(); }
    return new Promise(function (fin) {
      cartes.forEach(function (c, n) { setTimeout(function () { c.classList.add('visible'); if (n === cartes.length - 1) fin(); }, 250 + n * 320); });
    });
  }

  var attendre = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  async function boucle() {
    for (var n = 0; ; n = (n + 1) % SCENARIOS.length) {
      var s = SCENARIOS[n];
      idees.querySelectorAll('.idee').forEach(function (c) { c.classList.remove('visible'); });
      await attendre(400);
      idees.textContent = '';
      envie.textContent = '';
      for (var k = 1; k <= s.envie.length; k++) { envie.textContent = s.envie.slice(0, k); await attendre(45 + Math.random() * 40); }
      await attendre(350);
      Array.prototype.forEach.call(modes.children, function (m, i) { m.classList.toggle('actif', i === s.mode); });
      reflexion.classList.add('visible');
      await attendre(1300);
      reflexion.classList.remove('visible');
      await afficherScenario(s, true);
      await attendre(4200);
    }
  }

  if (envie && idees) {
    if (calme) { envie.textContent = SCENARIOS[0].envie; afficherScenario(SCENARIOS[0], false); }
    else boucle();
  }

  // ---------------------------------------------------------- Heures réalistes
  var maintenant = new Date();
  var hhmm = function (d) { return deux(d.getHours()) + ':' + deux(d.getMinutes()); };
  ['heure-tel', 'heure-verrou'].forEach(function (id) { var el = document.getElementById(id); if (el) el.textContent = hhmm(maintenant); });
  var dateVerrou = document.getElementById('date-verrou');
  if (dateVerrou) dateVerrou.textContent = maintenant.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  // ---------------------------------------------------------- Écran verrouillé : chrono de la Live Activity
  var chrono = document.getElementById('chrono');
  if (chrono) {
    var total = 25 * 60;
    var fin = Date.now() + (15 * 60 + 42) * 1000;
    var pretA = document.getElementById('pret-a');
    var barre = document.getElementById('barre-chrono');
    var tic = function () {
      var reste = Math.max(0, Math.round((fin - Date.now()) / 1000));
      if (reste === 0) { fin = Date.now() + (15 * 60 + 42) * 1000; reste = 15 * 60 + 42; }
      chrono.textContent = deux(Math.floor(reste / 60)) + ':' + deux(reste % 60);
      barre.style.width = ((1 - reste / total) * 100).toFixed(1) + '%';
    };
    pretA.textContent = 'prêt à ' + hhmm(new Date(fin));
    tic();
    if (!calme) setInterval(tic, 1000);
  }

  // ---------------------------------------------------------- La marmite
  var INGREDIENTS = {
    tomate: 'Tomates', oeuf: 'Œufs', pates: 'Pâtes', riz: 'Riz', poulet: 'Poulet', courgette: 'Courgettes',
    fromage: 'Fromage râpé', pdt: 'Pommes de terre', oignon: 'Oignon', champi: 'Champignons', creme: 'Crème',
    citron: 'Citron', lardons: 'Lardons', saumon: 'Saumon', poischiches: 'Pois chiches', epinards: 'Épinards'
  };
  var RECETTES = [
    ['Omelette baveuse aux champignons', ['oeuf', 'champi'], '10 minutes, une poêle, et c’est prêt.'],
    ['Carbonara à la française', ['pates', 'lardons', 'creme', 'oeuf'], 'Le classique du soir qui met tout le monde d’accord.'],
    ['Pâtes à la tomate fraîche', ['pates', 'tomate', 'oignon'], 'Une sauce qui mijote pendant que l’eau chauffe.'],
    ['Risotto crémeux aux champignons', ['riz', 'champi', 'oignon', 'fromage'], 'On remue, on goûte, on remue encore.'],
    ['Poulet rôti au citron', ['poulet', 'citron', 'oignon'], 'Doré dehors, fondant dedans, parfumé partout.'],
    ['Tian de courgettes et tomates', ['courgette', 'tomate', 'fromage'], 'Des rondelles bien rangées, un four, et voilà.'],
    ['Gratin dauphinois', ['pdt', 'creme', 'fromage'], 'Réconfort garanti, croûte dorée comprise.'],
    ['Tortilla espagnole', ['oeuf', 'pdt', 'oignon'], 'Épaisse, moelleuse, aussi bonne froide le lendemain.'],
    ['Curry de pois chiches aux épinards', ['poischiches', 'epinards', 'oignon', 'tomate'], 'Végétarien, rassasiant et plein d’épices douces.'],
    ['Saumon et riz au citron', ['saumon', 'riz', 'citron'], 'Simple, frais, et prêt en 20 minutes.'],
    ['Quiche lorraine', ['oeuf', 'lardons', 'creme', 'fromage'], 'La pâte dorée, l’appareil tremblotant.'],
    ['Shakshuka', ['oeuf', 'tomate', 'oignon'], 'Des œufs pochés dans une sauce tomate épicée.'],
    ['Pâtes crème et saumon', ['pates', 'saumon', 'creme', 'citron'], 'Un zeste de citron pour réveiller le tout.'],
    ['Riz cantonais maison', ['riz', 'oeuf', 'oignon'], 'Le meilleur ami du riz de la veille.'],
    ['Épinards à la crème, œuf mollet', ['epinards', 'creme', 'oeuf'], 'Doux, vert et coulant.'],
    ['Poulet et courgettes sautés', ['poulet', 'courgette', 'oignon'], 'Un sauté rapide, tout dans la même poêle.'],
    ['Gratin de pâtes', ['pates', 'fromage', 'creme'], 'Le plat qui recycle les restes avec les honneurs.'],
    ['Houmous maison', ['poischiches', 'citron'], 'À tartiner, à tremper, à partager.'],
    ['Pommes de terre sautées aux lardons', ['pdt', 'lardons', 'oignon'], 'Croustillantes, comme à la maison de campagne.'],
    ['Velouté de champignons', ['champi', 'creme', 'oignon'], 'Une soupe soyeuse pour les soirs frais.']
  ];

  var zone = document.getElementById('ingredients');
  var bouton = document.getElementById('mijoter');
  var resultat = document.getElementById('resultat');
  var nomPlat = document.getElementById('plat-propose');
  var detail = document.getElementById('plat-detail');
  if (zone && bouton) {
    var choisis = new Set(['oeuf', 'tomate', 'oignon']);
    Object.keys(INGREDIENTS).forEach(function (cle) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ingredient';
      b.textContent = INGREDIENTS[cle];
      b.setAttribute('aria-pressed', choisis.has(cle) ? 'true' : 'false');
      b.addEventListener('click', function () {
        if (choisis.has(cle)) choisis.delete(cle); else choisis.add(cle);
        b.setAttribute('aria-pressed', choisis.has(cle) ? 'true' : 'false');
      });
      zone.appendChild(b);
    });

    var precedent = null;
    var liste = function (cles) {
      var noms = cles.map(function (c) { return INGREDIENTS[c].toLowerCase(); });
      return noms.length < 2 ? noms.join('') : noms.slice(0, -1).join(', ') + ' et ' + noms[noms.length - 1];
    };

    bouton.addEventListener('click', function () {
      if (choisis.size === 0) {
        nomPlat.textContent = 'Ta marmite est vide';
        detail.textContent = 'Choisis au moins un ingrédient, le cuistot n’est pas magicien.';
        return;
      }
      var classees = RECETTES.map(function (r) {
        var avec = r[1].filter(function (i) { return choisis.has(i); });
        return { r: r, avec: avec, score: avec.length / r[1].length + avec.length * 0.15 + Math.random() * 0.05 };
      }).filter(function (x) { return x.avec.length > 0; })
        .sort(function (a, b) { return b.score - a.score; });
      // Pas deux fois de suite la même idée si une autre fait l'affaire.
      var choix = classees[0];
      if (choix && precedent === choix.r[0] && classees[1] && classees[1].score > 0.5) choix = classees[1];

      resultat.classList.remove('mijote');
      void resultat.offsetWidth;
      if (!calme) resultat.classList.add('mijote');
      nomPlat.textContent = '…';
      detail.textContent = 'Le cuistot touille…';
      setTimeout(function () {
        if (!choix) {
          nomPlat.textContent = 'Tartine du placard';
          detail.textContent = 'Avec ça, le cuistot improvise. Dans l’app, il te proposerait trois vraies idées.';
          precedent = null;
          return;
        }
        precedent = choix.r[0];
        var manque = choix.r[1].filter(function (i) { return !choisis.has(i); });
        nomPlat.textContent = choix.r[0];
        detail.textContent = choix.r[2] + ' ' + (manque.length
          ? 'Il te manque ' + liste(manque) + ' : direction la liste de courses.'
          : 'Tu as tout ce qu’il faut.');
      }, calme ? 0 : 1100);
    });
  }
})();
