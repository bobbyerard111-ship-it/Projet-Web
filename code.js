/* scripts/main.js — Fonctions JavaScript principales
   Projet : Œuvres littéraires par villes
   Auteurs : Joseph Gabriel
   Date : 2025–2026 */

/* MONTRER / MASQUER */

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

/* POPUP D'ACCUEIL */

function afficherPopup() {
    // Vérifie si la clé 'popupVue' existe dans le sessionStorage (ce qui indiquerait que le popup a déjà été vu)
    if (sessionStorage.getItem('popupVue')) return;
    // Récupère l'élémet HTML avec l'ID 'overlay-popup' (le conteneur du popup)
    var overlay = document.getElementById('overlay-popup');
    // Si l'élément existe, on affiche en définissant son stule 'display sur 'flex'
    if (overlay) {
        overlay.style.display = 'flex'
    }
}

function fermerPopup() {
    // Récupère l'élémet HTML avec l'ID 'overlay-popup' (le conteneur du popup)
    var overlay = document.getElementById('overlay-popup');
    if (overlay) {
        // Masque le popup en définissant son style 'display' sur 'none'
        overlay.style.display = 'none';
        // Enregistre dans le sessionStorage que la popup a été vue (valeur '1')
        sessionStorage.setItem('popupVue', '1');
    }
}

// CARTE INTERACTIVE

//Données des villes: coordonnée géographiques + données littérares
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
        auteur: "Mikhaïl Boulgakov, 1966",
        url: "moscou.html",
        couleur: "#c4a35a"
    },
    {
        id: "saint-petersbourg",
        nom: "Saint-Pétersbourg",
        pays: "Russie",
        lat: 59.94,
        lon: 30.31,
        oeuvre: "Crime et Châtiment",
        auteur: "Fyodor Dostoïevsky, 1866",
        couleur: "#8bb0d4"
    },
    {
        id: "londres",
        nom: "Londres",
        pays: "Angleterre",
        lat: 51.51,
        lon: -0.13,
        oeuvre: "Page à venir",
        auteur: "—",
        url: "londres.html",
        couleur: "#d4a0b0"
    },
    {
        id: "paris",
        nom: "Paris",
        pays: "France",
        lat: 48.85,
        lon: 2.35,
        oeuvre: "Page à venir",
        auteur: "—",
        url: "paris.html",
        couleur: "#a0b4d4"
    },
    {
        id: "prague",
        nom: "Prague",
        pays: "République tchèque",
        lat: 50.08,
        lon: 14.44,
        oeuvre: "Page à venir",
        auteur: "—",
        url: "prague.html",
        couleur: "#c4a35a"
    }
];

var CARTE = {
    lonMin: -30,    // bord gauche
    lonMax: 60,     // bord droit
    latMin: 30,     // bord bas
    latMax: 72,     // bord gauche
};

var etat = {
    canvas: null,
    contexte: null,
    largeur: 0,
    hauteur: 0,
    villeActive: null,   // ville survolée
    particules: [],       // Particules flottantes
    tempsDebut: null,   // pour animations temporelles
    rayonPulsation: {}, // RAYON ANIMES PAR VILLE
    echelle: 1,         // pour animation d'entrée
    chargementTermine: false

};

function geoVersPixel(lat, lon, largeur, hauteur) {
  // Calcul de la coordonnée x en pixels :
  // - (lon - CARTE.lonMin) : calcule la distance entre la longitude du point et la longitude minimale de la carte.
  // - (CARTE.lonMax - CARTE.lonMin) : calcule la largeur totale de la carte en degrés de longitude.
  // - Le rapport entre ces deux valeurs donne la position relative du point sur l'axe horizontal (entre 0 et 1).
  // - On multiplie par "largeur" pour obtenir la coordonnée x en pixels.
  var x = ((lon - CARTE.lonMin) / (CARTE.lonMax - CARTE.lonMin)) * largeur;

  // Calcul de la coordonnée y en pixels :
  // - (CARTE.latMax - lat) : calcule la distance entre la latitude maximale de la carte et la latitude du point. 
  // - (CARTE.latMax - CARTE.latMin) : calcul la hauteur totale de la carte en degrés de latitude.
  // - Le rapport entre ces deux valeurs donne la position relative du point sur l'axe vertical (entre 0 et 1).
  // - On multiplie par "hauteur" pour obtenir la coordonnée y en pixels.
  var y = ((CARTE.latMax - lat) / (CARTE.latMax - CARTE.latMin)) * hauteur;

  // Retourne un objet avec les coordonnées x et y en pixels.
  return { x: x, y: y };
}

function initialiserCanvas() {
    // Récupère l'élément HTML du canvas avec l'ID 'carte-canvas' et le stocke dans l'objet 'etat' (défini ci-dessus)
    etat.canvas = document.getElementById('carte-canvas');
    // Récupère le contexte de rendu 2D du canvas pour dessiner dessus
    etat.contexte = etat.canvas.getContext('2d');
    redimensionnerCanvas();
    // Ajoute un écouteur d'événement pour redimensionner le canvas à chaque fois que la fenêtre est redimensionnée par l'utilisateur
    window.addEventListener('resize', redimensionnerCanvas);
}
 
function redimensionnerCanvas() {
    // Stocke la largeur de la fenêtre dnas l'objet 'etat'
    etat.largeur = window.innerWidth;
    // Stocke la hauteur de la fenêtre dans l'objet 'etat'
    etat.hauteur = window.innerHeight;
    // Définit la largeur du canvas égal à la largeur de la fenêtre
    etat.canvas.width = etat.largeur;
    // Définit la hauteur du canvas égal à la hauteur de la fenêtre
    etat.canvas.height = etat.hauteur;
    // Initialisation des rayons de pulsations pour chaque ville
    // Parcourt chaque ville dans la table Ville définie ci-dessus
    VILLES.forEach(function(v) {
        // Si la ville n'a pas encore de propriété `rayonPulsation` dans l'objet `etat`
        if (!etat.rayonPulsation[v.id]) {
            // Initialise un objet pour cette ville avec :
            // - 'r' : rayon de la pulsation (initialisé à 0)
            // - 'alpha' : transparence de la pulsation (initialisée à 0)
            // - 'actif' : état de la pulsation (initialisé à false)
            etat.rayonPulsation[v.id] = {r: 0, alpha: 0, actif: false};
        };
    });
}

function genererParticules() {
    if (!window.location.pathname.includes("carte.html")) {
        return;
    } else {
        // Initialise un tableau vide pour stocker les particules dans l'objet 'etat'
        etat.particules = [];

        // Calcule le nombre de particules en fonction de la surface de la fenêtre (largeur × hauteur)
        // Divise par 8000 pour ajuster la densité (plus la fenêtre est grande, plus il y aura de particules)
        var nb = Math.floor((etat.largeur * etat.hauteur) / 8000);

        // Boucle pour créer 'nb' particules
        for (var i = 0; i < nb; i++) {
            // Ajoute une nouvelle particule au tableau 'etat.particules' avec des propriétés aléatoires
            etat.particules.push({
                // Position horizontale aléatoire entre 0 et la largeur du canvas
                x: Math.random() * etat.largeur,

                // Position verticale aléatoire entre 0 et la hauteur du canvas
                y: Math.random() * etat.hauteur,

                // Rayon de la particule aléatoire entre 0.2 et 1.4 (0.2 + 1.2)
                r: Math.random() * 1.2 + 0.2,

                // Transparence (alpha) aléatoire entre 0.1 et 0.6 (0.1 + 0.5)
                alpha: Math.random() * 0.5 + 0.1,

                // Vitesse de déplacement aléatoire entre 0.05 et 0.2 (0.05 + 0.15)
                vitesse: Math.random() * 0.15 + 0.05,

                // Phase initiale aléatoire pour une animation cyclique (entre 0 et 2π)
                phase: Math.random() * Math.PI * 2
            });
        }
    }
}

function demarrerChargement() {
    if (window.location.pathname.includes("carte.html")) {
        setTimeout(function() {
            var ecran = document.getElementById('ecran-chargement');
            var conteneur = document.getElementById('carte-conteneur');

            ecran.classList.add('masque');
            conteneur.classList.add('visible');
            etat.chargementTermine = true;
        }, 2600)
    }
}

function afficherVilles() {
    if (!window.location.pathname.includes("carte.html")) {
        return; 
    } else {
        var contexte = etat.contexte
        var l = etat.largeur
        var h = etat.hauteur

        VILLES.forEach(function(v) {
            var pos = geoVersPixel(v.lat, v.lon, l, h)
            var p = v.rayonPulsation[v.id]

            if (p && p.actif) {
                contexte.beginPath()
                contexte.arc(pos.x, pos.y, p.r, 0, Math.PI * 2);
                contexte.strokeStyle = v.couleur + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
                contexte.lineWidth = 1.5;
                contexte.stroke();
            }

            var estActive  = etat.villeActive && etat.villeActive.id === v.id;
            var rayon = estActive ? 7 : 5

            // Halo extérieur
            contexte.beginPath();
            contexte.arc(pos.x, pos.y, rayon + 4, 0, Math.PI * 2);
            contexte.fillStyle = v.couleur + '33'; // ~20% opacité
            contexte.fill();

            // Disque principal
            contexte.beginPath();
            contexte.arc(pos.x, pos.y, rayon, 0, Math.PI * 2);
            contexte.fillStyle = v.couleur;
            contexte.fill();

            // Contour blanc fin
            contexte.strokeStyle = 'rgba(255,255,255,0.4)';
            contexte.lineWidth = 1;
            contexte.stroke();

            // Croix centrale (style cartographique)
            contexte.strokeStyle = 'rgba(10,8,3,0.6)';
            contexte.lineWidth = 1;
            contexte.beginPath();
            contexte.moveTo(pos.x - 3, pos.y);
            contexte.lineTo(pos.x + 3, pos.y);
            contexte.moveTo(pos.x, pos.y - 3);
            contexte.lineTo(pos.x, pos.y + 3);
            contexte.stroke();

            // Label de la ville
            var labelY = pos.y - rayon - 8;
            contexte.font = estActive
            ? 'italic 13px "Playfair Display", Georgia, serif'
            : 'italic 11px "Playfair Display", Georgia, serif';
            contexte.fillStyle = estActive ? '#c4a35a' : '#8a7a5a';
            contexte.textAlign = 'center';
            contexte.fillText(v.nom, pos.x, labelY);
        });
    }
}

// Initialisation globale au chargement de la page (chargement compet du DOM)
document.addEventListener('DOMContentLoaded', function() {
    demarrerChargement();
    genererParticules();
    afficherPopup();
    initialiserBlocsExtensibles();
    afficherVilles()

    // Récupère le bouton de fermeture du popup par son ID
    var btnFermer = document.getElementById('btn-fermer-popup');
    if (btnFermer) {
        // Ajoute un écouteur d'événerment pour fermer le popup au clic sur le bouton
        btnFermer.addEventListener('click', fermerPopup);
    }
    // Récupère à nouveau l'élément overlay du popup
    var overlay = document.getElementById('overlay-popup');
    if (overlay) {
        // Ajoute un écouteur d'événement pour fermer le popup si on clique en dehors de son contenu
        overlay.addEventListener('click', function(e) {
            // Vérifie si le clic a été effectué directement sur l'overlay (élément de la page qui n'est pas le popup)
            if (e.target === overlay) fermerPopup();
        });
    }
})