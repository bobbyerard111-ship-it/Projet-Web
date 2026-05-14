# Projet-Web : Quiz littéraire et carte des œuvres

Ce projet est un site web statique en HTML/CSS/JavaScript qui présente un quiz littéraire et une carte interactive des œuvres associées à des villes européennes.

## Contenu du projet

- `carte.html` : page de la carte interactive avec les villes et œuvres littéraires.
- `quiz.html` : page du quiz littéraire avec questions à choix multiples et réponses instantanées.
- `main.html` : page d'accueil du site.
- `dublin.html`, `londres.html`, `moscou.html`, `munich.html`, `paris.html`, `saint_petersbourg.html` : pages dédiées aux œuvres et villes présentées dans le projet.
- `style.css` : styles visuels partagés entre les pages.
- `code.js` : scripts JavaScript pour le comportement du site.

## Objectif

L'objectif du projet est de proposer une expérience d'apprentissage autour de la littérature et des villes associées, en combinant :

- une carte interactive des œuvres et de leurs lieux,
- un quiz avec validation immédiate des réponses.

## Comment utiliser

1. Ouvrir `main.html` dans un navigateur web.
2. Naviguer vers la page de la carte (`carte.html`) pour explorer les villes et les œuvres.
3. Aller sur `quiz.html` pour répondre aux questions et vérifier les réponses.

## Prérequis

Aucun serveur n'est nécessaire. Le projet fonctionne en mode statique dans n'importe quel navigateur moderne.

## Structure recommandée

```text
Projet-Web/
├── README.md
├── carte.html
├── code.js
├── dublin.html
├── londres.html
├── main.html
├── moscou.html
├── munich.html
├── paris.html
├── quiz.html
├── saint_petersbourg.html
└── style.css
```

## Auteur

Joseph Gabriel

## Notes

- La page `quiz.html` contient un quiz littéraire avec des questions sur des œuvres comme *Monster*, *La Peau de chagrin* et *Oliver Twist*.
- Les réponses sont validées à l'aide de la fonction JavaScript `validerQCM` ou `validerReponseQuiz` définie dans `code.js`.
