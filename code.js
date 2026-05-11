/* code.js — Fonctions JavaScript principales
   Projet : Œuvres littéraires par villes
   Auteurs : Joseph Gabriel
   Date : 2025–2026 */

// Données des villes: coordonnées géographiques + données littérares
var VILLES = [
      {
        id: "dublin",
        nom: "Dublin",
        pays: "Irlande",
        lat: 53.35,
        lon: -6.26,
        oeuvre: "Ulysse",
        auteur: "James Joyce, 1922",
        url: "dublin.html",
        couleur: "#5a9a6a"
      },
      {
        id: "moscou",
        nom: "Moscou",
        pays: "Russie",
        lat: 55.75,
        lon: 37.62,
        oeuvre: "Le Maître et Marguerite",
        auteur: "Boulgakov, 1966",
        url: "moscou.html",
        couleur: "#c4a35a"
      },
      {
        id: "saint-petersbourg",
        nom: "Saint-Pétersbourg",
        pays: "Russie",
        lat: 59.95,
        lon: 30.32,
        oeuvre: "Crime et Châtiment",
        auteur: "Dostoïevski, 1866",
        url: "saint-petersbourg.html",
        couleur: "#8bb0d4"
      },
      {
        id: "londres",
        nom: "Londres",
        pays: "Angleterre",
        lat: 51.51,
        lon: -0.13,
        oeuvre: "Oliver Twist",
        auteur: "Dickens, 1846",
        url: "londres.html",
        couleur: "#d4a0b0"
      },
      {
        id: "paris",
        nom: "Paris",
        pays: "France",
        lat: 48.85,
        lon: 2.35,
        oeuvre: "La peau de chagrin",
        auteur: "Balzac, 1831",
        url: "paris.html",
        couleur: "#a0b4d4"
      },
      {
        id: "prague",
        nom: "Prague",
        pays: "République tchèque",
        lat: 50.08,
        lon: 14.44,
        oeuvre: "La Métamorphose",
        auteur: "Franz Kafka, 1915",
        url: "prague.html",
        couleur: "#c4a35a"
      }
    ];

var CARTE = {
  lonMin: -30,   // bord gauche
  lonMax: 60,    // bord droit
  latMin: 30,    // bord bas
  latMax: 72     // bord haut
};

var etat = {
  canvas: null,
  contexte: null,
  largeur: 0,
  hauteur: 0,
  villeActive: null,        // ville survolée
  tempsDebut: null,         // pour les animations temporelles
  chargementTermine: false
};

var curseur = {
  x: 0,
  y: 0,
  visible: false
};

// Fonctions utilitaires

function hexVersRgba(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

function latVersString(lat) {
  var deg = Math.abs(lat).toFixed(1);
  return deg + '°' + (lat >= 0 ? 'N' : 'S');
}

function lonVersString(lon) {
  var deg = Math.abs(lon).toFixed(1);
  return deg + '°' + (lon >= 0 ? 'E' : 'W');
}

function latLonVersString(lat, lon) {
  return latVersString(lat) + ' / ' + lonVersString(lon);
}

function geoVersPixel(lat, lon, largeur, hauteur) {
  var x = ((lon - CARTE.lonMin) / (CARTE.lonMax - CARTE.lonMin)) * largeur;
  var y = ((CARTE.latMax - lat)  / (CARTE.latMax - CARTE.latMin)) * hauteur;
  return { x: x, y: y };
}

// Initialisation

function redimensionnerCanvas() {
  etat.largeur  = window.innerWidth;
  etat.hauteur  = window.innerHeight;
  etat.canvas.width  = etat.largeur;
  etat.canvas.height = etat.hauteur;
}

function initialiserCanvas() {
  etat.canvas = document.getElementById('carte-canvas');
  // Si pas de canvas (pages non-carte), on arrête
  if (!etat.canvas) return;
  etat.contexte = etat.canvas.getContext('2d');
  redimensionnerCanvas();
  window.addEventListener('resize', redimensionnerCanvas);
}

// Dessin

// Fond de carte
function dessinerFond(t) {
  var ctx = etat.contexte;
  var W   = etat.largeur;
  var H   = etat.hauteur;

  // Fond dégradé sombre
  var grad = ctx.createRadialGradient(W * 0.45, H * 0.5, 0, W * 0.45, H * 0.5, W * 0.7);
  grad.addColorStop(0,   '#1e180a');
  grad.addColorStop(0.5, '#160f06');
  grad.addColorStop(1,   '#0a0805');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(90, 74, 42, 0.18)';
  ctx.lineWidth   = 0.5;
  for (var lon = -30; lon <= 60; lon += 10) {
    var p1 = geoVersPixel(CARTE.latMax, lon, W, H);
    var p2 = geoVersPixel(CARTE.latMin, lon, W, H);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Etiquette de la longitude
    ctx.fillStyle = 'rgba(90, 74, 42, 0.35)';
    ctx.font      = '9px "Courier Prime", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(lon + '°', p2.x, p2.y - 6);
  }

  // Grilles de parallèles (latitudes, longitudes)
  for (var lat = 30; lat <= 72; lat += 10) {
    var pp1 = geoVersPixel(lat, CARTE.lonMin, W, H);
    var pp2 = geoVersPixel(lat, CARTE.lonMax, W, H);
    ctx.strokeStyle = 'rgba(90, 74, 42, 0.18)';
    ctx.lineWidth   = 0.5;
    ctx.beginPath();
    ctx.moveTo(pp1.x, pp1.y);
    ctx.lineTo(pp2.x, pp2.y);
    ctx.stroke();

    // Affichage de la latitude (étiquette)
    ctx.fillStyle = 'rgba(90, 74, 42, 0.35)';
    ctx.font      = '9px "Courier Prime", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(lat + '°N', pp1.x + 4, pp1.y - 3);
  }
}

// dessin de la carte
function dessinerContourEurope() {
  var ctx = etat.contexte;
  var W   = etat.largeur;
  var H   = etat.hauteur;

  // Points de contour de l'europe occidentale (très approximatif mais nécessaire pour pouvoir bien gérer les animations)
  var contour = [
    [71, 28],  // Cap Nord (Norvège)
    [70, 18],
    [65, 14],  // Norvège côte ouest
    [62, 5],
    [58, 5],   // Scandinavie sud
    [55, 8],   // Danemark
    [54, 10],
    [52, 4],   // Pays-Bas
    [51, 2],   // Belgique/Nord France
    [48, -5],  // Bretagne
    [43, -9],  // Nord Portugal
    [36, -9],  // Portugal sud
    [36, -6],
    [36, -5],  // Détroit de Gibraltar
    [36, 2],   // Espagne est
    [41, 3],   // Barcelone
    [43, 5],   // Côte d'Azur
    [44, 8],   // Gênes
    [44, 12],  // Adriatique
    [40, 18],
    [37, 15],  // Sicile
    [37, 23],  // Grèce
    [40, 26],
    [41, 29],  // Istanbul
    [42, 35],  // Mer Noire
    [46, 30],
    [47, 24],  // Carpates
    [50, 24],
    [54, 18],  // Pologne
    [56, 21],  // Pays Baltes
    [60, 24],  // Finlande
    [65, 25],
    [70, 28],
    [71, 28]   // retour Nord
  ];

  ctx.beginPath();
  var premier = geoVersPixel(contour[0][0], contour[0][1], W, H);
  ctx.moveTo(premier.x, premier.y);
  for (var i = 1; i < contour.length; i++) {
    var pt = geoVersPixel(contour[i][0], contour[i][1], W, H);
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.closePath();

  // remplissage plus clair
  var gradTerre = ctx.createLinearGradient(0, 0, W, H);
  gradTerre.addColorStop(0, 'rgba(40, 30, 15, 0.55)');
  gradTerre.addColorStop(1, 'rgba(28, 20, 8, 0.55)');
  ctx.fillStyle   = gradTerre;
  ctx.fill();

  // Contour doré
  ctx.strokeStyle = 'rgba(139, 100, 40, 0.5)';
  ctx.lineWidth   = 1.2;
  ctx.stroke();
}

// Dessin des points des villes
function dessinerVilles(t) {
  var ctx = etat.contexte;
  var W   = etat.largeur;
  var H   = etat.hauteur;

  VILLES.forEach(function(ville) {
    var pos = geoVersPixel(ville.lat, ville.lon, W, H);

    // Cercle simple
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = ville.couleur;
    ctx.fill();

    // Etiquette
    ctx.fillStyle = ville.couleur;
    ctx.font = '12px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(ville.nom, pos.x, pos.y - 10);
  });
}

// Événements

function villeSousCurseur(x, y) {
  var W = etat.largeur;
  var H = etat.hauteur;
  var rayon = 22; // zone de clic en pixels

  for (var i = 0; i < VILLES.length; i++) {
    var v   = VILLES[i];
    var pos = geoVersPixel(v.lat, v.lon, W, H);
    var dx  = x - pos.x;
    var dy  = y - pos.y;
    if (Math.sqrt(dx * dx + dy * dy) < rayon) return v;
  }
  return null;
}

function gererSurvol(e) {
  var rect = etat.canvas.getBoundingClientRect();
  var x    = e.clientX - rect.left;
  var y    = e.clientY - rect.top;

  curseur.x = e.clientX;
  curseur.y = e.clientY;
  curseur.visible = true;

  var ville = villeSousCurseur(x, y);
  etat.villeActive = ville;

  if (ville) {
    etat.canvas.style.cursor = 'pointer';
    afficherTooltip(ville, e.clientX, e.clientY);
    mettreAJourHUD(ville);
  } else {
    etat.canvas.style.cursor = 'crosshair';
    cacherTooltip();
    mettreAJourHUD(null, x, y);
  }
}

function gererClic(e) {
  var rect = etat.canvas.getBoundingClientRect();
  var x    = e.clientX - rect.left;
  var y    = e.clientY - rect.top;
  var ville = villeSousCurseur(x, y);

  if (ville) {
    declencherTransition(ville);
  }
}

function gererSortie() {
  curseur.visible  = false;
  etat.villeActive = null;
  cacherTooltip();
}

// TOOLTIP
function afficherTooltip(ville, clientX, clientY) {
  var tooltip = document.getElementById('tooltip-ville');

  document.getElementById('tt-nom').textContent    = ville.nom;
  document.getElementById('tt-pays').textContent   = ville.pays;
  document.getElementById('tt-oeuvre').textContent = ville.oeuvre;
  document.getElementById('tt-auteur').textContent = ville.auteur;

  // Positionnement : au-dessus du curseur, éviter les bords
  var tx = clientX - 80;
  var ty = clientY - 160;
  if (tx < 10) tx = 10;
  if (ty < 10) ty = clientY + 20;
  if (tx + 200 > window.innerWidth) tx = window.innerWidth - 210;

  tooltip.style.left = tx + 'px';
  tooltip.style.top  = ty + 'px';
  tooltip.classList.add('visible');
}

function cacherTooltip() {
    document.getElementById('tooltip-ville').classList.remove('visible');
}

// coordonnées
function mettreAJourHUD(ville, x, y) {
  if (ville) {
    document.getElementById('hud-lat').textContent = latVersString(ville.lat);
    document.getElementById('hud-lon').textContent = lonVersString(ville.lon);
    document.getElementById('ville-active-nom').textContent = ville.nom.toUpperCase();
  } else if (x !== undefined && y !== undefined) {
    var W   = etat.largeur;
    var H   = etat.hauteur;
    var lon = CARTE.lonMin + (x / W) * (CARTE.lonMax - CARTE.lonMin);
    var lat = CARTE.latMax - (y / H) * (CARTE.latMax - CARTE.latMin);
    document.getElementById('hud-lat').textContent = latVersString(lat);
    document.getElementById('hud-lon').textContent = lonVersString(lon);
    document.getElementById('ville-active-nom').textContent = '—';
  }
}

function declencherTransition(ville) {
  var overlay = document.getElementById('overlay-transition');
  document.getElementById('transition-nom-ville').textContent = ville.nom;

  // Fondu entrant
  overlay.classList.add('actif');

  // Navigation après 700ms
  setTimeout(function() {
      window.location.href = ville.url;
  }, 700);
}

// Boucle d'animation principale (requestAnimationFrame)

function boucleAnimation(timestamp) {
  // Ne rien faire si pas de contexte (pas sur la page carte)
  if (!etat.contexte) return;
  
  if (!etat.tempsDebut) etat.tempsDebut = timestamp;
  var t = (timestamp - etat.tempsDebut) / 1000; // temps en secondes

  var ctx = etat.contexte;
  ctx.clearRect(0, 0, etat.largeur, etat.hauteur);

  dessinerFond(t);
  dessinerContourEurope();
  dessinerVilles(t);

  requestAnimationFrame(boucleAnimation);
}

function demarrerChargement() {
  // Ne rien faire si pas de canvas (pas sur la page carte)
  if (!etat.canvas) return;
  
  setTimeout(function() {
    var ecran = document.getElementById('ecran-chargement');
    var conteneur = document.getElementById('carte-conteneur');

    ecran.classList.add('masque');
    conteneur.classList.add('visible');
    etat.chargementTermine = true;

    etat.canvas.addEventListener('mousemove', gererSurvol);
    etat.canvas.addEventListener('click',     gererClic);
    etat.canvas.addEventListener('mouseleave', gererSortie);

  }, 2600);
}

// MONTRER / MASQUER

function basculerBloc(bouton) {
    // Récupère l'élément frère suivant du bouton (le contenu à afficher ou masquer)
    var contenu = bouton.nextElementSibling;
    // Récupère l'icône à l'interieur du bouton (pour mettre à jour le visuel)
    var icone   = bouton.querySelector('.icone-toggle');
    // Si il n'y a pas de contenu (normalement pas nécessaire), on arrête la fonction
    if (!contenu) return;
    
    // Vérifie si le contenu est déjà visible (en checking la présence de la classe 'visible' dans mon CSS)
    var estOuvert = contenu.classList.contains('visible');
    if (estOuvert) {
        // Masque le contenu en retirant la classe 'visible'
        contenu.classList.remove('visible');
        //Retire la classe ouvert du bouton (pour mettre à jour son CSS, dans ce cas, la rotation à 45deg)
        bouton.classList.remove('ouvert');
        // Mise à jour de l'attribut ARIA pour indiquer que les contenu est fermé
        bouton.setAttribute('aria-expanded', 'false');
    } else {
        // Affiche le contenu en ajoutant la classe 'visible'
        contenu.classList.add('visible');
        // Ajoute a classe 'ouvert' au bouton (pour mettre à jour son style)
        bouton.classList.add('ouvert');
        // Met à jour l'attirvut ARIA pour indiquer quue le contenu est ouvert
        bouton.setAttribute('aria-expanded', 'true');
    }
}

function initialiserPopups() {
  var overlay = document.getElementById('overlay-popup');
  if (!overlay) return;

  // Ajouter l'écouteur pour fermer le popup
  var btnFermer = document.getElementById('btn-fermer-popup');
  if (btnFermer) {
    btnFermer.addEventListener('click', fermerPopup);
  }

  // Toujours afficher le popup
  overlay.style.display = 'flex';
}

function fermerPopup() {
  var overlay = document.getElementById('overlay-popup');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

function initialiserBlocsExtensibles() {
    // Sélectionne tous les éléments avec la classe 'btn.toggle' dans le document
    var boutons = document.querySelectorAll('.btn-toggle');

    // Parcourt chaque bouton trouvé
    boutons.forEach(function(bouton) {
        // définit l'attribut 'aria-expanded' à 'false' pour chaque bouton pour indiquer aux lecteurs d'écran que le contenu associé au bouton est fermé par défaut.
        bouton.setAttribute('aria-expanded', 'false');
        // Ajoute un écouteur d'événement pour le clic sur le bouton avec une fonction anonyme pour capturer le contexte du bouton cliqué.
        bouton.addEventListener('click', function() {
            // Appelle la fonction basculerBloc avec le bouton cliqué comme argument (this parce que ça fait régérence à l'élément sur lequel l'événement a été déclenché).
            basculerBloc(this);
    });
  });
}

// Initialisation globale au chargement de la page (chargement compet du DOM)
document.addEventListener('DOMContentLoaded', function() {
    initialiserCanvas();
    requestAnimationFrame(boucleAnimation);
    demarrerChargement();
    initialiserBlocsExtensibles();
    initialiserPopups();
})