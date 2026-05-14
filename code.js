/* code.js — Fonctions JavaScript principales
   Projet : Œuvres littéraires par villes
   Auteurs : Joseph Gabriel
   Date : 2025–2026 */


// Récupère toutes les citations
const slides = document.querySelectorAll(".slide");

// Récupère les boutons
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

// Slide actuellement affiché
let currentSlide = 0;

// Fonction qui affiche un slide
function showSlide(index){

    // Cache tous les slides
    slides.forEach(slide => {
        slide.classList.remove("active");
    });

    // Affiche le slide demandé
    slides[index].classList.add("active");
}

// Quand on clique sur →
nextBtn.addEventListener("click", () => {

    // Passe au slide suivant
    currentSlide++;

    // Revient au début si on dépasse
    if(currentSlide >= slides.length){
        currentSlide = 0;
    }

    // Affiche le nouveau slide
    showSlide(currentSlide);
});

// Quand on clique sur ←
prevBtn.addEventListener("click", () => {

    // Revient au slide précédent
    currentSlide--;

    // Revient à la fin si on est avant le début
    if(currentSlide < 0){
        currentSlide = slides.length - 1;
    }

    // Affiche le nouveau slide
    showSlide(currentSlide);
});

// fonction personnelle qui converti les svg faits pour les pages de couverture en arrière plan
// Récupère tous les SVG
const wallpapers = document.querySelectorAll(".fond-ecran");

wallpapers.forEach(image => {

    image.addEventListener("click", () => {

        document.body.style.backgroundImage =
        `url("${image.getAttribute("src")}")`;

        document.body.style.backgroundSize = "cover";

        document.body.style.backgroundPosition = "center";

        document.body.style.backgroundAttachment = "fixed";

    });

});


// Configuration de la carte : limites géographiques pour la projection
var CARTE = {
    lonMin: -30,  // Longitude minimale de la carte (degrés)
    lonMax: 60,   // Longitude maximale de la carte (degrés)
    latMin: 30,   // Latitude minimale de la carte (degrés)
    latMax: 72    // Latitude maximale de la carte (degrés)
};

// Contour géographique de l'Europe : tableau de points [latitude, longitude]
var GEO_CONTOUR = [
    [71, 28], [70, 18], [65, 14], [62, 5], [58, 5], [55, 8], [54, 10], [52, 4],
    [51, 2], [48, -5], [43, -9], [36, -9], [36, -6], [36, -5], [36, 2], [41, 3],
    [43, 5], [44, 8], [44, 12], [40, 18], [37, 15], [37, 23], [40, 26], [41, 29],
    [42, 35], [46, 30], [47, 24], [50, 24], [54, 18], [56, 21], [60, 24], [65, 25],
    [70, 28]
];

// Données des villes avec leurs informations géographiques et littéraires
var VILLES = [
    {
        id: 'dublin',           // Identifiant unique de la ville
        lat: 53.35,             // Latitude en degrés
        lon: -6.26,             // Longitude en degrés
        nom: 'Dublin',          // Nom de la ville
        pays: 'Irlande',        // Pays de la ville
        oeuvre: 'Ulysse',       // Œuvre littéraire associée
        auteur: 'James Joyce, 1922',  // Auteur et année
        url: 'dublin.html',     // Page HTML associée
        couleur: '#5a9a6a'      // Couleur pour l'affichage
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
        id: 'munich',
        lat: 48.09,
        lon: 11.35,
        nom: 'Munich',
        pays: 'Allemagne',
        oeuvre: 'Monster',
        auteur: 'Naoki Urasawa, 1994',
        url: 'munich.html',
        couleur: '#c4a35a'
    }
];

// Convertit des coordonnées géographiques en coordonnées pixels
function geoVersPixel(lat, lon, largeur, hauteur) {
    // Calcule la position X en pixels en proportion de la longitude
    var x = ((lon - CARTE.lonMin) / (CARTE.lonMax - CARTE.lonMin)) * largeur;
    // Calcule la position Y en pixels en proportion de la latitude (inversée car Y augmente vers le bas)
    var y = ((CARTE.latMax - lat) / (CARTE.latMax - CARTE.latMin)) * hauteur;
    // Retourne un objet avec les coordonnées pixels
    return { x: x, y: y };
}

// Dessine le contour géographique de l'Europe sur le SVG
function dessinerContourSVG() {
    // Récupère l'élément SVG de la carte
    var svg = document.getElementById('europe-svg');
    // Récupère l'élément path du contour dans le SVG
    var contour = document.querySelector('#europe-svg .europe-contour');
    // Récupère l'élément conteneur de la carte
    var carte = document.getElementById('carte');
    // Vérifie que tous les éléments existent, sinon arrête la fonction
    if (!svg || !contour || !carte) {
        return;
    }

    // Récupère les dimensions actuelles de la carte
    var rect = carte.getBoundingClientRect();
    var largeur = rect.width;
    var hauteur = rect.height;

    // Configure les attributs du SVG pour qu'il s'adapte à la taille de la carte
    svg.setAttribute('viewBox', '0 0 ' + largeur + ' ' + hauteur);
    svg.setAttribute('width', largeur);
    svg.setAttribute('height', hauteur);

    // Crée le chemin SVG en transformant chaque point géographique en coordonnées pixels
    var d = GEO_CONTOUR.map(function(point, index) {
        // Convertit le point géographique en coordonnées pixels
        var coord = geoVersPixel(point[0], point[1], largeur, hauteur);
        // Commence par 'M' (move to) pour le premier point, puis 'L' (line to) pour les suivants
        return (index === 0 ? 'M' : 'L') + coord.x + ',' + coord.y;
    // Joint tous les segments avec des espaces et ferme le chemin avec 'Z'
    }).join(' ') + ' Z';

    // Applique le chemin au contour SVG
    contour.setAttribute('d', d);
}

// Positionne les éléments des villes sur la carte
function positionnerVilles() {
    // Récupère l'élément conteneur de la carte
    var carte = document.getElementById('carte');
    // Si la carte n'existe pas, arrête la fonction
    if (!carte) {
        return;
    }
    // Récupère les dimensions actuelles de la carte
    var rect = carte.getBoundingClientRect();
    var largeur = rect.width;
    var hauteur = rect.height;

    // Parcourt tous les éléments avec la classe 'ville'
    document.querySelectorAll('.ville').forEach(function(ville) {
        // Récupère les coordonnées depuis les attributs data
        var lat = parseFloat(ville.dataset.lat);
        var lon = parseFloat(ville.dataset.lon);
        // Vérifie que les coordonnées sont valides
        if (!isFinite(lat) || !isFinite(lon)) {
            return;
        }

        // Convertit les coordonnées géographiques en position pixels
        var position = geoVersPixel(lat, lon, largeur, hauteur);
        // Positionne l'élément ville sur la carte
        ville.style.left = position.x + 'px';
        ville.style.top = position.y + 'px';
    });
}

// Met à jour l'affichage de la carte géographique
function mettreAJourCarteGeo() {
    // Redessine le contour de l'Europe
    dessinerContourSVG();
    // Repositionne toutes les villes
    positionnerVilles();
}


// Initialise les tooltips pour les villes
function initialiserTooltips() {
    // Sélectionne tous les éléments avec la classe 'ville'
    var villes = document.querySelectorAll('.ville');
    // Récupère l'élément tooltip
    var tooltip = document.getElementById('tooltip-ville');

    // Parcourt chaque ville pour ajouter les événements
    villes.forEach(function(ville) {
        // Ajoute un écouteur pour le mouvement de la souris
        ville.addEventListener('mousemove', function(e) {
            // Met à jour le contenu du tooltip avec les données de la ville
            document.getElementById('tt-nom').textContent = ville.dataset.nom;
            document.getElementById('tt-pays').textContent = ville.dataset.pays;
            document.getElementById('tt-oeuvre').textContent = ville.dataset.oeuvre;
            document.getElementById('tt-auteur').textContent = ville.dataset.auteur;

            // Positionne le tooltip près du curseur (20px à droite, 120px au-dessus)
            tooltip.style.left = (e.clientX + 20) + 'px';
            tooltip.style.top = (e.clientY - 120) + 'px';

            // Rend le tooltip visible
            tooltip.classList.add('visible');
        });

        // Ajoute un écouteur pour quand la souris quitte la ville
        ville.addEventListener('mouseleave', function() {
            // Masque le tooltip
            tooltip.classList.remove('visible');
        });
    });
}

// ==========================
// CHARGEMENT
// ==========================

// Applique les styles CSS à la carte et aux éléments
function appliquerStyleCarte() {
    // Récupère l'élément conteneur de la carte
    var carte = document.getElementById('carte');
    // Si la carte n'existe pas, arrête la fonction
    if (!carte) {
        return;
    }

    // Applique un fond dégradé à la carte
    carte.style.background = 'radial-gradient(circle at 45% 32%, rgba(196, 163, 90, 0.18), rgba(10, 8, 3, 0.96) 72%)';

    // Récupère l'élément contour du SVG
    var contour = document.querySelector('#europe-svg .europe-contour');
    // Si le contour existe, applique les styles
    if (contour) {
        // Couleur de remplissage du contour
        contour.style.fill = 'rgba(28, 20, 8, 0.55)';
        // Couleur de la bordure
        contour.style.stroke = 'rgba(139, 100, 40, 0.5)';
        // Épaisseur de la bordure
        contour.style.strokeWidth = '3';
        // Type de jointure des lignes
        contour.style.strokeLinejoin = 'round';
        // Effet d'ombre portée
        contour.style.filter = 'drop-shadow(0 18px 40px rgba(0, 0, 0, 0.22))';
    }

    // Parcourt toutes les villes pour appliquer les styles aux points
    document.querySelectorAll('.ville').forEach(function(ville) {
        // Récupère la couleur associée à la ville (ou une couleur par défaut)
        var couleur = ville.dataset.couleur || '#c4a35a';
        // Récupère l'élément point dans la ville
        var point = ville.querySelector('.point');
        // Si le point existe, applique les styles
        if (point) {
            // Dimensions du point
            point.style.width = '16px';
            point.style.height = '16px';
            // Couleur de fond du point
            point.style.background = couleur;
            // Bordure du point
            point.style.border = '2px solid rgba(139, 26, 26, 0.9)';
            // Ombre du point
            point.style.boxShadow = '0 0 0 6px rgba(196, 163, 90, 0.18)';
        }
    });
}

// Démarre l'animation de chargement et affiche la carte après un délai
function demarrerChargement() {
    // Attend 2.6 secondes avant d'afficher la carte
    setTimeout(function() {
        // Masque l'écran de chargement
        document.getElementById('ecran-chargement').classList.add('masque');
        // Affiche le conteneur de la carte
        document.getElementById('carte-conteneur').classList.add('visible');
    }, 2600);
}

// FORMULAIRE

// Valide la réponse d'un champ de texte dans le quiz
function validerReponseQuiz(idChamp, idMessage, bonneReponse) {
    // Récupère l'élément champ de saisie
    var champ = document.getElementById(idChamp);
    // Récupère l'élément pour afficher le message
    var message = document.getElementById(idMessage);
    // Si l'un des éléments n'existe pas, arrête la fonction
    if (!champ || !message) return;

    // Récupère la valeur saisie, enlève les espaces et met en minuscules
    var rep = champ.value.trim().toLowerCase();
    // Rend le message visible et enlève les classes de validation précédente
    message.classList.add('visible');
    message.classList.remove('correct', 'incorrect');

    // Si la réponse est vide, affiche un message d'erreur
    if (rep === '') {
        message.textContent = 'Merci de saisir une réponse avant de valider.';
        return;
    }
    // Si la réponse est correcte, affiche le message de succès
    if (rep === bonneReponse.toLowerCase()) {
        message.classList.add('correct');
        message.textContent = '✓ Bonne réponse !';
    } else {
        // Sinon, affiche le message d'erreur
        message.classList.add('incorrect');
        message.textContent = '✗ Mauvaise réponse. Consultez les pages du site pour trouver la réponse.';
    }
}

// Valide la réponse d'un QCM
function validerQCM(nomGroupe, idMessage, valeurCorrecte) {
    // Récupère tous les boutons radio du groupe
    var radios = document.querySelectorAll('input[name="' + nomGroupe + '"]');
    // Récupère l'élément pour afficher le message
    var message = document.getElementById(idMessage);
    // Si le message n'existe pas, arrête la fonction
    if (!message) return;

    // Variable pour stocker la valeur sélectionnée
    var selection = null;
    // Parcourt les boutons radio pour trouver celui qui est coché
    radios.forEach(function(r) { if (r.checked) selection = r.value; });

    // Rend le message visible et enlève les classes de validation précédente
    message.classList.add('visible');
    message.classList.remove('correct', 'incorrect');

    // Si aucun bouton n'est sélectionné, affiche un message d'erreur
    if (selection === null) {
        message.textContent = 'Veuillez choisir une réponse.';
        return;
    }
    // Si la réponse est correcte, affiche le message de succès
    if (selection === valeurCorrecte) {
        message.classList.add('correct');
        message.textContent = '✓ Exact ! Bonne réponse.';
    } else {
        // Sinon, affiche le message d'erreur
        message.classList.add('incorrect');
        message.textContent = '✗ Pas tout à fait — relisez les pages correspondantes.';
    }
}

// MONTRER / MASQUER

function basculerBloc(bouton) {
    // Récupère l'élément frère suivant du bouton (le contenu à afficher ou masquer)
    var contenu = bouton.nextElementSibling;
    // Récupère l'icône à l'intérieur du bouton (pour mettre à jour le visuel)
    var icone = bouton.querySelector('.icone-toggle');
    // S'il n'y a pas de contenu (normalement inutile), on arrête la fonction
    if (!contenu) return;

    // Vérifie si le contenu est déjà visible (en regardant la présence de la classe 'visible' dans mon CSS)
    var estOuvert = contenu.classList.contains('visible');
    if (estOuvert) {
        // Masque le contenu en retirant la classe 'visible'
        contenu.classList.remove('visible');
        // Retire la classe 'ouvert' du bouton (pour mettre à jour son CSS, par exemple la rotation à 45deg)
        bouton.classList.remove('ouvert');
        // Mise à jour de l'attribut ARIA pour indiquer que le contenu est fermé
        bouton.setAttribute('aria-expanded', 'false');
    } else {
        // Affiche le contenu en ajoutant la classe 'visible'
        contenu.classList.add('visible');
        // Ajoute la classe 'ouvert' au bouton (pour mettre à jour son style)
        bouton.classList.add('ouvert');
        // Met à jour l'attribut ARIA pour indiquer que le contenu est ouvert
        bouton.setAttribute('aria-expanded', 'true');
    }
}

// Initialise les popups du site
function initialiserPopups() {
    // Récupère l'élément overlay du popup
    var overlay = document.getElementById('overlay-popup');
    // Si l'overlay n'existe pas, arrête la fonction
    if (!overlay) return;

    // Récupère le bouton de fermeture du popup
    var btnFermer = document.getElementById('btn-fermer-popup');
    // Si le bouton existe, ajoute un écouteur pour fermer le popup au clic
    if (btnFermer) {
        btnFermer.addEventListener('click', fermerPopup);
    }

    // Affiche toujours le popup (display: flex)
    overlay.style.display = 'flex';
}

// Ferme le popup en masquant l'overlay
function fermerPopup() {
    // Récupère l'élément overlay du popup
    var overlay = document.getElementById('overlay-popup');
    // Si l'overlay existe, le masque
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Initialise les blocs extensibles
function initialiserBlocsExtensibles() {
    // Sélectionne tous les éléments avec la classe 'btn-toggle' dans le document
    var boutons = document.querySelectorAll('.btn-toggle');

    // Parcourt chaque bouton trouvé
    boutons.forEach(function(bouton) {
        // Définit l'attribut 'aria-expanded' à 'false' pour chaque bouton pour indiquer aux lecteurs d'écran que le contenu associé au bouton est fermé par défaut.
        bouton.setAttribute('aria-expanded', 'false');
        // Ajoute un écouteur d'événement pour le clic sur le bouton avec une fonction anonyme pour capturer le contexte du bouton cliqué.
        bouton.addEventListener('click', function() {
            // Appelle la fonction basculerBloc avec le bouton cliqué comme argument (this parce que ça fait référence à l'élément sur lequel l'événement a été déclenché).
            basculerBloc(this);
        });
    });
}

// CLAIR - SOMBRE

var THEMES       = ['', 'theme-sombre', 'theme-principal'];
var LABELS       = ['Sombre', 'Principale', 'Clair'];
var indexTheme   = 0;


function changerTheme() {
  var body   = document.body;
  var bouton = document.getElementById('btn-theme');

  body.classList.remove(THEMES[indexTheme]);
  indexTheme = (indexTheme + 1) % THEMES.length;
  if (THEMES[indexTheme]) body.classList.add(THEMES[indexTheme]);
  if (bouton) bouton.textContent = LABELS[indexTheme];

  localStorage.setItem('theme', indexTheme.toString());
}

function restaurerTheme() {
  var sauvegarde = localStorage.getItem('theme');
  if (sauvegarde === null) return;
  var index = parseInt(sauvegarde, 10);
  if (isNaN(index) || index < 0 || index >= THEMES.length) return;

  indexTheme = index;
  if (THEMES[index]) document.body.classList.add(THEMES[index]);
  var bouton = document.getElementById('btn-theme');
  if (bouton) bouton.textContent = LABELS[index];
}

// Fonction d'initialisation appelée lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    var btnTheme = document.getElementById('btn-theme');
    if (btnTheme) {
        btnTheme.addEventListener('click', changerTheme());
    }
    // Initialise les boutons toggle pour les blocs extensibles
    initialiserBlocsExtensibles();
    // Configure les popups du site
    initialiserPopups();
    // Applique les styles visuels à la carte
    appliquerStyleCarte();
    // Démarre l'animation de chargement
    demarrerChargement();
    // Active les tooltips pour les villes
    initialiserTooltips();
    // Met à jour l'affichage initial de la carte
    mettreAJourCarteGeo();
    // Ajoute un écouteur pour redessiner la carte lors du redimensionnement de la fenêtre
    window.addEventListener('resize', mettreAJourCarteGeo);
});
