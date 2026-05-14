/* code.js — Fonctions JavaScript principales
   Projet : Œuvres littéraires par villes
   Auteurs : Joseph Gabriel
   Date : 2025–2026 */

// Données des villes: coordonnées géographiques + données littérares
// ==========================

var CARTE = {
    lonMin: -30,
    lonMax: 60,
    latMin: 30,
    latMax: 72
};

var GEO_CONTOUR = [
    [71, 28], [70, 18], [65, 14], [62, 5], [58, 5], [55, 8], [54, 10], [52, 4],
    [51, 2], [48, -5], [43, -9], [36, -9], [36, -6], [36, -5], [36, 2], [41, 3],
    [43, 5], [44, 8], [44, 12], [40, 18], [37, 15], [37, 23], [40, 26], [41, 29],
    [42, 35], [46, 30], [47, 24], [50, 24], [54, 18], [56, 21], [60, 24], [65, 25],
    [70, 28]
];

var VILLES = [
    {
        id: 'dublin',
        lat: 53.35,
        lon: -6.26,
        nom: 'Dublin',
        pays: 'Irlande',
        oeuvre: 'Ulysse',
        auteur: 'James Joyce, 1922',
        url: 'dublin.html',
        couleur: '#5a9a6a'
    },
    {
        id: 'moscou',
        lat: 55.75,
        lon: 37.62,
        nom: 'Moscou',
        pays: 'Russie',
        oeuvre: 'Le Maître et Marguerite',
        auteur: 'Boulgakov, 1966',
        url: 'moscou.html',
        couleur: '#c4a35a'
    },
    {
        id: 'saint-petersbourg',
        lat: 59.95,
        lon: 30.32,
        nom: 'Saint-Pétersbourg',
        pays: 'Russie',
        oeuvre: 'Crime et Châtiment',
        auteur: 'Dostoïevski, 1866',
        url: 'saint-petersbourg.html',
        couleur: '#8bb0d4'
    },
    {
        id: 'londres',
        lat: 51.51,
        lon: -0.13,
        nom: 'Londres',
        pays: 'Angleterre',
        oeuvre: 'Oliver Twist',
        auteur: 'Charles Dickens, 1846',
        url: 'londres.html',
        couleur: '#d4a0b0'
    },
    {
        id: 'paris',
        lat: 48.85,
        lon: 2.35,
        nom: 'Paris',
        pays: 'France',
        oeuvre: 'La peau de chagrin',
        auteur: 'Balzac, 1831',
        url: 'paris.html',
        couleur: '#a0b4d4'
    },
    {
        id: 'prague',
        lat: 50.08,
        lon: 14.44,
        nom: 'Prague',
        pays: 'République tchèque',
        oeuvre: 'La Métamorphose',
        auteur: 'Franz Kafka, 1915',
        url: 'prague.html',
        couleur: '#c4a35a'
    }
];

function geoVersPixel(lat, lon, largeur, hauteur) {
    var x = ((lon - CARTE.lonMin) / (CARTE.lonMax - CARTE.lonMin)) * largeur;
    var y = ((CARTE.latMax - lat) / (CARTE.latMax - CARTE.latMin)) * hauteur;
    return { x: x, y: y };
}

function dessinerContourSVG() {
    var svg = document.getElementById('europe-svg');
    var contour = document.querySelector('#europe-svg .europe-contour');
    var carte = document.getElementById('carte');
    if (!svg || !contour || !carte) {
        return;
    }

    var rect = carte.getBoundingClientRect();
    var largeur = rect.width;
    var hauteur = rect.height;

    svg.setAttribute('viewBox', '0 0 ' + largeur + ' ' + hauteur);
    svg.setAttribute('width', largeur);
    svg.setAttribute('height', hauteur);

    var d = GEO_CONTOUR.map(function(point, index) {
        var coord = geoVersPixel(point[0], point[1], largeur, hauteur);
        return (index === 0 ? 'M' : 'L') + coord.x + ',' + coord.y;
    }).join(' ') + ' Z';

    contour.setAttribute('d', d);
}

function positionnerVilles() {
    var carte = document.getElementById('carte');
    if (!carte) {
        return;
    }
    var rect = carte.getBoundingClientRect();
    var largeur = rect.width;
    var hauteur = rect.height;

    document.querySelectorAll('.ville').forEach(function(ville) {
        var lat = parseFloat(ville.dataset.lat);
        var lon = parseFloat(ville.dataset.lon);
        if (!isFinite(lat) || !isFinite(lon)) {
            return;
        }

        var position = geoVersPixel(lat, lon, largeur, hauteur);
        ville.style.left = position.x + 'px';
        ville.style.top = position.y + 'px';
    });
}

function mettreAJourCarteGeo() {
    dessinerContourSVG();
    positionnerVilles();
}

// TOOLTIP
// ==========================

function initialiserTooltips() {

    var villes =
        document.querySelectorAll('.ville');

    var tooltip =
        document.getElementById('tooltip-ville');

    villes.forEach(function(ville) {

        ville.addEventListener(
            'mousemove',
            function(e) {

                document.getElementById('tt-nom')
                    .textContent =
                    ville.dataset.nom;

                document.getElementById('tt-pays')
                    .textContent =
                    ville.dataset.pays;

                document.getElementById('tt-oeuvre')
                    .textContent =
                    ville.dataset.oeuvre;

                document.getElementById('tt-auteur')
                    .textContent =
                    ville.dataset.auteur;

                tooltip.style.left =
                    (e.clientX + 20) + 'px';

                tooltip.style.top =
                    (e.clientY - 120) + 'px';

                tooltip.classList.add('visible');
            }
        );

        ville.addEventListener(
            'mouseleave',
            function() {
                tooltip.classList.remove('visible');
            }
        );

    });

}

// ==========================
// CHARGEMENT
// ==========================

function appliquerStyleCarte() {

    var carte = document.getElementById('carte');
    if (!carte) {
        return;
    }

    carte.style.background = 'radial-gradient(circle at 45% 32%, rgba(196, 163, 90, 0.18), rgba(10, 8, 3, 0.96) 72%)';

    var contour = document.querySelector('#europe-svg .europe-contour');
    if (contour) {
        contour.style.fill = 'rgba(28, 20, 8, 0.55)';
        contour.style.stroke = 'rgba(139, 100, 40, 0.5)';
        contour.style.strokeWidth = '3';
        contour.style.strokeLinejoin = 'round';
        contour.style.filter = 'drop-shadow(0 18px 40px rgba(0, 0, 0, 0.22))';
    }

    document.querySelectorAll('.ville').forEach(function(ville) {
        var couleur = ville.dataset.couleur || '#c4a35a';
        var point = ville.querySelector('.point');
        if (point) {
            point.style.width = '16px';
            point.style.height = '16px';
            point.style.background = couleur;
            point.style.border = '2px solid rgba(139, 26, 26, 0.9)';
            point.style.boxShadow = '0 0 0 6px rgba(196, 163, 90, 0.18)';
        }
    });

}

function demarrerChargement() {

    setTimeout(function() {

        document
            .getElementById('ecran-chargement')
            .classList
            .add('masque');

        document
            .getElementById('carte-conteneur')
            .classList
            .add('visible');

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

// ==========================
// INITIALISATION
// ==========================

document.addEventListener('DOMContentLoaded', function() {
    initialiserBlocsExtensibles();
    initialiserPopups();
    appliquerStyleCarte();
    demarrerChargement();
    initialiserTooltips();
    mettreAJourCarteGeo();
    window.addEventListener('resize', mettreAJourCarteGeo);
});
