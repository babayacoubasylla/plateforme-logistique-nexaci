# TODO - Réorganisation du système de colis et mandats

## Workflow Global de la Plateforme

### FLUX 1 : SERVICE LOGISTIQUE EXPRESS (Envoi d'un colis)
#### Étape 1 : Commande & Paiement
- [ ] Client crée un envoi dans l'application (détails colis, destinataire, adressage par repères)
- [ ] Système calcule les frais de livraison
- [ ] Client paie via paiement mobile (Moov Money, Orange Money, Wave, Momo)
- [ ] Système confirme paiement et crée numéro de suivi

#### Étape 2 : Prise en Charge & Expédition
- [ ] Client dépose colis dans point relais ou confie à livreur pour collecte
- [ ] Système scanne colis, statut "Pris en charge", tracking activé
- [ ] Notifications SMS/WhatsApp à client et destinataire

#### Étape 3 : Livraison
- [ ] Livreur utilise app mobile avec optimisation itinéraire et géolocalisation par repères
- [ ] Système met à jour statuts ("En transit", "En livraison", "Livré") même avec connexion faible
- [ ] Notifications de livraison réussie

### FLUX 2 : SERVICE DE MANDAT ADMINISTRATIF (Commande d'un document)
#### Étape 1 : Demande & Devis
- [ ] Client sélectionne document administratif (ex: extrait de naissance), précise mairie/autorité
- [ ] Système présente devis détaillant frais administratifs, prestation, livraison
- [ ] Client accepte devis et paie via paiement mobile

#### Étape 2 : Mandat & Documentation
- [ ] Système/Client : Téléchargement de documents sécurisés (procuration)
- [ ] Client upload documents personnels (carte d'identité, etc.) de manière sécurisée

#### Étape 3 : Exécution du Mandat & Suivi
- [ ] Opérations : Assignation coursier spécialisé via outil gérant
- [ ] Coursier se rend à l'administration pour démarche
- [ ] Système met à jour statuts ("Mandat déposé", "En traitement", "Document obtenu")
- [ ] Client reçoit notifications sur statut

#### Étape 4 : Retour & Livraison du Document
- [ ] Opérations : Document traité comme colis, scanné, intégré au flux logistique
- [ ] Système/Livreur : Livraison via réseau logistique (domicile/point relais)

### Workflow de Pilotage et de Support (En parallèle)

#### 1. Workflow du CLIENT
**Pour un Envoi de Colis :**
- [ ] Commande : Ouvrir l'application, créer un nouvel envoi, saisir informations destinataire avec repères précis (ex: "face station Total, maison bleue")
- [ ] Paiement : Choisir "Paiement Mobile", générer code pour payer via Orange Money, Moov Money, etc., valider paiement
- [ ] Suivi : Recevoir notification SMS/WhatsApp de prise en charge, suivre trajet en temps réel
- [ ] Livraison : Notification de livraison à client et destinataire

**Pour un Mandat Administratif :**
- [ ] Demande : Sélectionner "Obtenir un document", choisir type (ex: Extrait de naissance) et autorité (ex: Mairie d'Abidjan)
- [ ] Devis & Paiement : Présentation devis transparent (frais admin + prestation + livraison), paiement via mobile
- [ ] Mandat : Téléchargement procuration et pièces d'identité sécurisées
- [ ] Suivi Double : Suivi déplacement coursier ET avancement démarche ("Document déposé", "Document signé", etc.) via notifications
- [ ] Réception : Réception document officiel en livraison directe ou point relais

#### 2. Workflow du LIVREUR/COURSIER
- [ ] Réception des Missions : Ouvrir app mobile, recevoir liste missions assignées (livraisons colis ET/OU démarches administratives)
- [ ] Planification : Calcul itinéraire optimisé pour toutes courses

**Exécution (Pour un colis) :**
- [ ] Rendez-vous au point de collecte/livraison suivant géolocalisation par repères
- [ ] Scanner colis à chaque étape (pris en charge, en livraison, livré), fonctionne avec connexion faible
- [ ] Mise à jour statut, notification automatique client

**Exécution (Pour un mandat) :**
- [ ] Rendez-vous à l'administration (mairie, préfecture) avec documents (procuration, pièces client)
- [ ] Effectuer démarche au nom du client
- [ ] Mise à jour statut ("Démarche en cours", "Document obtenu")
- [ ] Scanner document comme colis classique pour réintégrer flux logistique et livraison

#### 3. Workflow du GÉRANT D'AGENCE
- [ ] Supervision : Connexion tableau de bord opérationnel, vue ensemble colis/mandats agence
- [ ] Affectation : Affecter/réaffecter livraisons/démarches aux livreurs/coursiers selon localisation/charge
- [ ] Gestion des Stocks : Surveillance temps réel stocks colis agence/réseau points relais
- [ ] Résolution de Problèmes : Intervention sur problèmes (adresse introuvable, administration fermée), réaffectation missions

#### 4. Workflow de la DIRECTION
- [ ] Pilotage : Consultation tableau de bord stratégique
- [ ] Analyse Financière : Visualisation revenus séparés logistique/mandat
- [ ] Analyse de Performance : Surveillance indicateurs clés (OTD) pour identifier forces/faiblesses
- [ ] Prise de Décision : Utilisation données pour décisions stratégiques (nouvelle agence, promotion service, etc.)

## Tâches Techniques Prioritaires

## 1. Géolocalisation GPS automatique
- [ ] Ajouter service de géolocalisation côté backend
- [ ] Modifier le contrôleur colis pour capturer les coordonnées GPS
- [ ] Mettre à jour le modèle Colis pour stocker les coordonnées GPS
- [ ] Ajouter validation des coordonnées GPS
- [ ] Tester la fonctionnalité GPS

## 2. Génération et téléchargement de reçus PDF
- [ ] Installer bibliothèque PDF (pdfkit ou puppeteer)
- [ ] Créer service de génération PDF pour colis
- [ ] Créer service de génération PDF pour mandats
- [ ] Ajouter routes API pour téléchargement de reçus
- [ ] Mettre à jour les composants frontend pour appeler l'API de téléchargement
- [ ] Tester la génération et le téléchargement de PDF

## 3. Remplacement des données mockées
- [ ] Modifier ClientDashboard pour utiliser l'API réelle
- [ ] Vérifier que les appels API fonctionnent correctement
- [ ] Gérer les erreurs d'API dans le frontend
- [ ] Tester l'affichage des vraies données

## 4. Amélioration du workflow et informations
- [ ] Ajouter plus de détails sur les destinataires dans les listes
- [ ] Améliorer l'affichage des statuts avec descriptions claires
- [ ] Ajouter historique détaillé des actions
- [ ] Créer composants pour afficher les informations de workflow
- [ ] Tester l'affichage amélioré

## 5. Notifications et suivi en temps réel
- [ ] Implémenter WebSocket ou Server-Sent Events
- [ ] Ajouter notifications pour changements de statut
- [ ] Créer système de notifications frontend
- [ ] Ajouter suivi en temps réel des colis/mandats
- [ ] Tester les notifications

## 6. Tests et validation
- [ ] Tester toutes les fonctionnalités
- [ ] Vérifier la compatibilité mobile
- [ ] Optimiser les performances
- [ ] Corriger les bugs identifiés
