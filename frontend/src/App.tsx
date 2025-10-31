// src/App.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext'; // Hook d'authentification

// --- IMPORTS DES COMPOSANTS D'AUTHENTIFICATION ---
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// --- IMPORTS DES COMPOSANTS DE NAVIGATION/TABLEAUX DE BORD ---
import ClientDashboard from './components/Dashboard/ClientDashboard';
import GerantDashboard from './components/Dashboard/GerantDashboard';
import LivreurDashboard from './components/Dashboard/LivreurDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';

// --- IMPORTS DES COMPOSANTS ADMIN ---
import UsersPage from './components/Admin/UsersPage';
import AgencesPage from './components/Admin/AgencesPage';
import ColisPage from './components/Admin/ColisPage';
import MandatsPage from './components/Admin/MandatsPage';
import AdminSettingsPage from './components/Admin/AdminSettingsPage';

// --- IMPORTS DES COMPOSANTS GÉRANT ---
import ManageShipmentsPage from './components/Gerant/ManageShipmentsPage';
import ManageMandatesPage from './components/Gerant/ManageMandatesPage';
import AssignCouriersPage from './components/Gerant/AssignCouriersPage';
import ReportsPage from './components/Gerant/ReportsPage';
import AdminReportsPage from './components/Admin/AdminReportsPage';
import MissionsPage from './components/Livreur/MissionsPage';
import LivreurHistoryPage from './components/Livreur/HistoryPage';
import GerantHistoryPage from './components/Gerant/HistoryPage';
import AdminHistoryPage from './components/Admin/AdminHistoryPage';

// --- IMPORTS DES COMPOSANTS DE PROFIL/SUIVI/AUTRES ---
import ProfilePage from './components/Profile/ProfilePage';
import TrackingPage from './components/Tracking/TrackingPage'; // Assure-toi que ce composant existe
import HistoryPage from './components/History/HistoryPage'; // Page d'historique

// --- IMPORTS DES COMPOSANTS DE FORMULAIRES ---
import ShippingForm from './components/Shipping/ShippingForm';
import ShippingConfirmation from './components/Shipping/ShippingConfirmation';
import MandateForm from './components/Mandate/MandateForm';
import MandateConfirmation from './components/Mandate/MandateConfirmation';

// --- TYPES POUR LES DONNÉES ---
import { ShippingData, MandateData } from './types/shipping';
import { Page } from './types'; // Assure-toi que Page inclut toutes les pages possibles

/**
 * Composant principal de l'application.
 * Gère l'authentification, la navigation et le rendu des différentes pages.
 */
function App() {
  const { user, loading, login } = useAuth(); // Récupérer l'utilisateur, l'état de chargement et la fonction login
  console.log("[App] État 'user' dans App.tsx:", user); // <-- LOG ICI
  console.log("[App] État 'loading' dans App.tsx:", loading); // <-- LOG ICI
  const [currentPage, setCurrentPage] = useState<Page>('login'); // Page actuelle
  console.log("[App] État 'currentPage' dans App.tsx:", currentPage); // <-- LOG ICI
  const [shippingData, setShippingData] = useState<ShippingData | null>(null); // Données du colis en cours
  const [mandateData, setMandateData] = useState<MandateData | null>(null); // Données du mandat en cours
  const [trackingNumber, setTrackingNumber] = useState<string>(''); // Numéro de suivi
  const [selectedColisId, setSelectedColisId] = useState<string | null>(null);

  // Effet pour rediriger vers le bon dashboard si l'utilisateur est connecté
  useEffect(() => {
    console.log("[App] Effet useEffect déclenché dans App.tsx. user =", user); // <-- LOG ICI
    if (user) {
      // Déterminer la page de dashboard en fonction du rôle
      switch (user.role) {
        case 'client':
          console.log("[App] Utilisateur 'client' détecté. Navigation vers 'client-dashboard'."); // <-- LOG ICI
          setCurrentPage('client-dashboard');
          break;
        case 'gerant':
          console.log("[App] Utilisateur 'gerant' détecté. Navigation vers 'gerant-dashboard'."); // <-- LOG ICI
          setCurrentPage('gerant-dashboard');
          break;
        case 'livreur':
          console.log("[App] Utilisateur 'livreur' détecté. Navigation vers 'livreur-dashboard'."); // <-- LOG ICI
          setCurrentPage('livreur-dashboard');
          break;
        case 'admin':
        case 'super_admin': // Gérer aussi super_admin si applicable
          console.log("[App] Utilisateur 'admin' ou 'super_admin' détecté. Navigation vers 'admin-dashboard'."); // <-- LOG ICI
          setCurrentPage('admin-dashboard');
          break;
        default:
          // Rôle inconnu, rediriger vers une page par défaut ou login
          console.warn(`[App] Rôle inconnu: ${user.role}. Redirection vers login.`); // <-- LOG ICI
          setCurrentPage('login');
          // Optionnel: déconnecter l'utilisateur si le rôle est invalide
          // logout(); // Nécessite d'importer logout de useAuth()
      }
    } else {
       console.log("[App] Aucun utilisateur connecté (user est null/undefined)."); // <-- LOG ICI
       // setCurrentPage('login'); // Normalement déjà 'login' par défaut
    }
  }, [user]); // Dépendance sur 'user'

  // Afficher un indicateur de chargement pendant la vérification du token
  if (loading) {
    return <div className="app-loading">Chargement de l'authentification...</div>;
  }

  // --- GESTION DE LA NAVIGATION ---
  const navigateTo = (page: Page) => {
    console.log(`[App] navigateTo appelé avec: ${page}`); // <-- LOG ICI
    setCurrentPage(page);
  };

  const handleBackToHome = () => {
    console.log("[App] handleBackToHome appelé"); // <-- LOG ICI
    // Rediriger vers le dashboard en fonction du rôle
    if (user) {
      switch (user.role) {
        case 'client':
          setCurrentPage('client-dashboard');
          break;
        case 'gerant':
          setCurrentPage('gerant-dashboard');
          break;
        case 'livreur':
          setCurrentPage('livreur-dashboard');
          break;
        case 'admin':
        case 'super_admin':
          setCurrentPage('admin-dashboard');
          break;
        default:
          setCurrentPage('login');
      }
    } else {
      setCurrentPage('login');
    }
  };

  const handleShippingSubmit = async (data: ShippingData) => {
    console.log("[App] handleShippingSubmit appelé avec:", data);
    
    try {
      let transactionId = 'CASH-' + Date.now();
      
      // Étape 1: Paiement en ligne (si ce n'est pas espèces)
      if (data.paymentMethod !== 'especes') {
        console.log("💳 Simulation du paiement...");
        const { paymentService } = await import('./services/paymentService');
        
        const paymentData = {
          amount: 2500, // Prix estimé (à calculer dynamiquement)
          method: data.paymentMethod as 'orange' | 'moov' | 'wave' | 'momo',
          phoneNumber: data.senderPhone,
          orderId: `TEMP-${Date.now()}`,
          orderType: 'colis' as const
        };
        
        const paymentResult = await paymentService.simulatePayment(paymentData);
        
        if (paymentResult.status !== 'success') {
          throw new Error('Le paiement a échoué');
        }
        
        transactionId = paymentResult.data.transactionId;
        console.log("✅ Paiement réussi:", transactionId);
      } else {
        console.log("💵 Paiement en espèces à la livraison");
      }
      
      // Mapper les méthodes de paiement
      const paymentMethodMap: Record<string, string> = {
        'orange': 'orange_money',
        'moov': 'moov_money',
        'wave': 'wave',
        'momo': 'mtn_money',
        'especes': 'especes'
      };
      
      console.log("🔍 Méthode de paiement reçue:", data.paymentMethod);
      console.log("🔍 Méthode mappée:", paymentMethodMap[data.paymentMethod] || data.paymentMethod);
      
      // Étape 2: Créer le colis
      const typeLivraison = data.deliveryOption === 'home' ? 'domicile' : 'point_relais';
      
      console.log("🔍 deliveryOption:", data.deliveryOption);
      console.log("🔍 typeLivraison:", typeLivraison);
      console.log("🔍 receiverAgence:", data.receiverAgence);
      
      // Validation : vérifier que l'agence est sélectionnée pour point relais
      if (typeLivraison === 'point_relais' && !data.receiverAgence) {
        alert('⚠️ Veuillez sélectionner un point relais pour le retrait');
        return;
      }
      
      const colisData: any = {
        details_colis: {
          poids: parseFloat(data.packageWeight.split('-')[0]) || 1,
          description: data.packageDescription
        },
        paiement: {
          methode: paymentMethodMap[data.paymentMethod] || data.paymentMethod,
          transactionId: transactionId
        },
        typeLivraison: typeLivraison as 'domicile' | 'point_relais'
      };
      
      // Ajouter destinataire pour livraison à domicile
      if (typeLivraison === 'domicile') {
        colisData.destinataire = {
          nom: data.receiverName,
          telephone: data.receiverPhone,
          adresse: data.receiverAddress,
          ville: data.receiverAddress.split(',').pop()?.trim() || 'Abidjan'
        };
      }
      
      // Ajouter l'agence et destinataire pour retrait en point relais
      if (typeLivraison === 'point_relais' && data.receiverAgence) {
        // L'objet agence a _id (avec underscore)
        colisData.agenceId = data.receiverAgence._id || data.receiverAgence.id;
        console.log("🔍 agenceId extrait:", colisData.agenceId);
        
        // Ajouter nom et téléphone du destinataire pour les notifications
        colisData.destinataire = {
          nom: data.receiverName,
          telephone: data.receiverPhone
        };
      }

      console.log("📦 Création du colis avec les données:", colisData);

      const { colisService } = await import('./services/colisService');
      const response = await colisService.createColis(colisData);
      
      console.log("✅ Colis créé avec succès:", response.data.colis.reference);
      
      setShippingData(data);
      setTrackingNumber(response.data.colis.reference);
      setCurrentPage('shipping-confirmation');
    } catch (error: any) {
      console.error("❌ Erreur lors de la création du colis:", error);
      console.error("Détails de l'erreur:", error.response?.data);
      alert(`Erreur: ${error.response?.data?.message || error.message || 'Impossible de créer le colis'}`);
    }
  };

  const handleMandateSubmit = async (data: MandateData) => {
    console.log("[App] handleMandateSubmit appelé avec:", data);
    
    try {
      // Préparer les données pour l'API backend
      const mandatData = {
        type_document: data.documentType,
        administration: data.administration || '',
        informations_document: {
          nom_complet: data.fullName,
          date_naissance: data.dateOfBirth,
          lieu_naissance: data.placeOfBirth
        },
        livraison: {
          adresse: data.deliveryAddress,
          ville: data.deliveryAddress.split(',').pop()?.trim() || 'Abidjan',
          telephone: data.senderPhone
        },
        paiement: {
          methode: data.paymentMethod
        }
      };

      // Importer le service dynamiquement
      const { mandatService } = await import('./services/mandatService');
      
      // Appeler l'API pour créer le mandat
      const response = await mandatService.createMandat(mandatData);
      
      // Stocker les données et la référence réelle
      setMandateData(data);
      setTrackingNumber(response.data.mandat.reference);
      setCurrentPage('mandate-confirmation');
    } catch (error: any) {
      console.error("Erreur lors de la création du mandat:", error);
      alert(`Erreur: ${error.response?.data?.message || 'Impossible de créer le mandat'}`);
    }
  };

  // --- AFFICHAGE SELON L'ÉTAT D'AUTHENTIFICATION ET LA PAGE COURANTE ---

  // Si l'utilisateur n'est pas connecté, afficher Login ou Register
  if (!user) {
    console.log("[App] Utilisateur non connecté. Affichage de Login ou Register."); // <-- LOG ICI
    if (currentPage === 'register') {
      return (
        <Register
          onSwitchToLogin={() => setCurrentPage('login')}
          // Assure-toi que Register gère la logique d'inscription
          onRegister={async (userData) => {
             console.log("Inscription demandée:", userData);
             // Implémenter la logique d'inscription ici si nécessaire
             // Par exemple, appeler useAuth().register
             // Pour cet exemple, on bascule vers login après.
             setCurrentPage('login');
          }}
        />
      );
    }
      return (
        <Login
          onSwitchToRegister={() => setCurrentPage('register')}
          // Passer la fonction de login de useAuth ici
          onLogin={async (credentials) => {
            console.log("Connexion demandée:", credentials);
            const result = await login(credentials);
            if (!result.success) {
              console.error("Erreur de connexion:", result.message);
              // Optionnel: Afficher un message d'erreur à l'utilisateur
            }
            // La redirection post-login est gérée par l'effet useEffect ci-dessus
            // qui réagit au changement de 'user'
          }}
        />
      );
  }

  // Si l'utilisateur est connecté, afficher les pages de l'application
  // en fonction de la page courante (qui est déterminée par le rôle via useEffect)
  console.log(`[App] Utilisateur connecté. Affichage de la page: ${currentPage}`); // <-- LOG ICI
  switch (currentPage) {
    // --- TABLEAUX DE BORD SPÉCIFIQUES PAR RÔLE ---
    case 'client-dashboard':
      console.log("[App] Rendu de ClientDashboard"); // <-- LOG ICI
      return <ClientDashboard onNavigate={navigateTo} userName={user.prenom || user.nom || 'Client'} />;
    case 'gerant-dashboard':
      console.log("[App] Rendu de GerantDashboard"); // <-- LOG ICI
      return <GerantDashboard onNavigate={navigateTo} userName={user.prenom || user.nom || 'Gérant'} />;
    case 'livreur-dashboard':
      console.log("[App] Rendu de LivreurDashboard"); // <-- LOG ICI
      return <LivreurDashboard onNavigate={navigateTo} userName={user.prenom || user.nom || 'Livreur'} />;
    case 'livreur_missions':
      console.log("[App] Rendu de MissionsPage (Livreur)");
      if (user.role !== 'livreur') {
        handleBackToHome();
        return null;
      }
      return <MissionsPage onBack={() => navigateTo('livreur-dashboard')} />;
    case 'livreur_history':
      console.log("[App] Rendu de LivreurHistoryPage");
      if (user.role !== 'livreur') {
        handleBackToHome();
        return null;
      }
      return <LivreurHistoryPage onBack={() => navigateTo('livreur-dashboard')} />;
    case 'gerant_history':
      console.log("[App] Rendu de GerantHistoryPage");
      if (user.role !== 'gerant' || !user.profile?.agence) {
        handleBackToHome();
        return null;
      }
      return <GerantHistoryPage onBack={() => navigateTo('gerant-dashboard')} agenceId={user.profile.agence} />;
    case 'admin_history':
      console.log("[App] Rendu de AdminHistoryPage");
      if (!['admin', 'super_admin'].includes(user.role)) {
        handleBackToHome();
        return null;
      }
      return <AdminHistoryPage onBack={() => navigateTo('admin-dashboard')} />;
    case 'admin-dashboard':
      console.log("[App] Rendu de AdminDashboard"); // <-- LOG ICI
      return <AdminDashboard onNavigate={navigateTo} userName={user.prenom || user.nom || 'Admin'} />;

    // --- AUTRES PAGES COMMUNES (accessibles par plusieurs rôles) ---
    case 'profile':
      console.log("[App] Rendu de ProfilePage"); // <-- LOG ICI
      return <ProfilePage onBack={handleBackToHome} userName={user.prenom || user.nom || 'Utilisateur'} userEmail={user.email || ''} userPhone={user.telephone || ''} />;
    case 'tracking':
      console.log("[App] Rendu de TrackingPage"); // <-- LOG ICI
      return <TrackingPage onBack={handleBackToHome} />;
    case 'shipping':
      console.log("[App] Rendu de ShippingForm"); // <-- LOG ICI
      // Vérifier si l'utilisateur a le droit d'accéder à cette page
      if (user.role === 'client') {
         return <ShippingForm onBack={handleBackToHome} onSubmit={handleShippingSubmit} />;
      } else {
         // Rediriger vers le dashboard si l'accès n'est pas autorisé
         console.log("[App] Accès refusé à ShippingForm pour le rôle:", user.role); // <-- LOG ICI
         handleBackToHome();
         return null; // Ou un message d'erreur
      }
    case 'shipping-confirmation':
      console.log("[App] Rendu de ShippingConfirmation"); // <-- LOG ICI
      return shippingData ? (
        <ShippingConfirmation data={shippingData} trackingNumber={trackingNumber} onBackToHome={handleBackToHome} />
      ) : null;
    case 'mandate':
       console.log("[App] Rendu de MandateForm"); // <-- LOG ICI
       // Vérifier si l'utilisateur a le droit d'accéder à cette page
       if (user.role === 'client') {
          return <MandateForm onBack={handleBackToHome} onSubmit={handleMandateSubmit} />;
       } else {
          // Rediriger vers le dashboard si l'accès n'est pas autorisé
          console.log("[App] Accès refusé à MandateForm pour le rôle:", user.role); // <-- LOG ICI
          handleBackToHome();
          return null; // Ou un message d'erreur
       }
    case 'mandate-confirmation':
      console.log("[App] Rendu de MandateConfirmation"); // <-- LOG ICI
      return mandateData ? (
        <MandateConfirmation data={mandateData} requestNumber={trackingNumber} onBackToHome={handleBackToHome} />
      ) : null;
    case 'history':
      console.log("[App] Rendu de la page d'historique"); // <-- LOG ICI
      return <HistoryPage 
        onBack={handleBackToHome} 
        onViewDetails={(ref, type) => {
          setTrackingNumber(ref);
          navigateTo('tracking');
        }}
      />;

    // --- PAGES ADMIN ---
    case 'admin/users':
      console.log("[App] Rendu de UsersPage");
      return <UsersPage onBack={() => navigateTo('admin-dashboard')} />;
    case 'admin/agences':
      console.log("[App] Rendu de AgencesPage");
      return <AgencesPage onBack={() => navigateTo('admin-dashboard')} />;
    case 'admin/colis':
      console.log("[App] Rendu de ColisPage");
      return <ColisPage onBack={() => navigateTo('admin-dashboard')} />;
    case 'admin/mandats':
      console.log("[App] Rendu de MandatsPage");
      return <MandatsPage onBack={() => navigateTo('admin-dashboard')} />;
    case 'admin/reports':
      console.log("[App] Rendu de AdminReportsPage");
      return <AdminReportsPage onBack={() => navigateTo('admin-dashboard')} />;
    case 'admin/settings':
      console.log("[App] Rendu de AdminSettingsPage");
      return <AdminSettingsPage onBack={() => navigateTo('admin-dashboard')} />;

    // --- PAGES GÉRANT ---
    case 'manage_shipments':
    case 'manage_mandates':
    case 'assign_couriers':
    case 'view_reports':
      console.log(`[App] Rendu de ${currentPage}`);
      // Assurez-vous que l'utilisateur est un gérant et a une agence associée
      if (user.role !== 'gerant') {
        console.error("Erreur : L'utilisateur n'est pas un gérant");
        handleBackToHome();
        return null;
      }
      
      if (!user?.profile?.agence && !user?.profile?.agence_id) {
        console.error("Erreur : L'utilisateur n'a pas d'agence associée");
        // Afficher un message d'erreur à l'utilisateur
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur d'Accès</h2>
              <p className="text-gray-700 mb-6">
                Vous n'avez pas d'agence associée à votre compte. Veuillez contacter l'administrateur pour résoudre ce problème.
              </p>
              <button
                onClick={handleBackToHome}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Retour au tableau de bord
              </button>
            </div>
          </div>
        );
      }

      // Retourner le composant approprié en fonction de la page courante
      switch (currentPage) {
        case 'manage_shipments':
          return (
            <ManageShipmentsPage
              onBack={() => navigateTo('gerant-dashboard')}
              agenceId={String(user.profile.agence || user.profile.agence_id || '')}
              onManageShipment={(shipment) => { setSelectedColisId(shipment._id); navigateTo('assign_couriers'); }}
            />
          );
        case 'manage_mandates':
          return <ManageMandatesPage onBack={() => navigateTo('gerant-dashboard')} agenceId={String(user.profile.agence || user.profile.agence_id || '')} />;
        case 'assign_couriers':
          return (
            <AssignCouriersPage
              onBack={() => navigateTo('gerant-dashboard')}
              agenceId={String(user.profile.agence || user.profile.agence_id || '')}
              colisId={selectedColisId || undefined}
            />
          );
        case 'view_reports':
          return <ReportsPage onBack={() => navigateTo('gerant-dashboard')} agenceId={String(user.profile.agence || user.profile.agence_id || '')} />;
      }

    // --- REDIRECTION PAR DÉFAUT ---
    default:
      console.log("[App] Page inconnue ou par défaut. Redirection via handleBackToHome."); // <-- LOG ICI
      // Si pour une raison inconnue currentPage n'est pas un dashboard connu,
      // rediriger vers le bon en fonction du rôle
      handleBackToHome();
      return null; // Ou un indicateur de chargement rapide
  }
}

export default App;
