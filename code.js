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

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', initialiserBlocsExtensibles);