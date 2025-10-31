// src/services/api.ts
import axios, { AxiosHeaders } from 'axios';

// L'URL de base du serveur backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configuration d'Axios avec les options par défaut
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Pour gérer les cookies CORS si nécessaire
}) as typeof axios;

// Intercepteur pour ajouter le token JWT aux requêtes sortantes
api.interceptors.request.use(
  (config) => {
    console.log("🔄 [API Intercepteur] Préparation de la requête pour:", config.url);
    
    // Créer une nouvelle instance de AxiosHeaders si nécessaire
    config.headers = config.headers || new axios.AxiosHeaders();

    // Ajouter le Content-Type par défaut si non défini
    if (!config.headers['Content-Type']) {
      config.headers.set('Content-Type', 'application/json');
    }

    // Récupérer le token depuis le localStorage
    const token = localStorage.getItem('token');
    if (token) {
      console.log("🔑 [API Intercepteur] Token trouvé, ajout aux headers");
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.log("⚠️ [API Intercepteur] Pas de token trouvé pour la requête");
    }

    // Log des headers finaux (pour débogage)
    console.log("📨 [API Intercepteur] Headers de la requête:", config.headers);
    
    return config;
  },
  (error) => {
    console.error("❌ [API Intercepteur] Erreur dans l'intercepteur de requête:", error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses entrantes (ex: déconnexion si token invalide)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🔴 [API Intercepteur] Erreur détectée:", {
      config: error.config,
      status: error.response?.status,
      data: error.response?.data
    });

    // Vérifier si l'erreur est une réponse HTTP
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Jeton invalide ou expiré - déconnecter l'utilisateur
          console.warn("🔑 [API Intercepteur] Jeton invalide/expiré. Déconnexion.");
          localStorage.removeItem('token');
          window.location.href = '/'; // Rediriger vers la page d'accueil/login
          break;
        case 403:
          console.warn("⛔ [API Intercepteur] Accès refusé.");
          // Optionnel: rediriger vers une page d'erreur 403
          break;
        case 404:
          console.error("❌ [API Intercepteur] Ressource non trouvée (404).");
          break;
        case 500:
          console.error("💥 [API Intercepteur] Erreur interne du serveur (500).");
          break;
        default:
          console.error(`❗ [API Intercepteur] Erreur serveur: ${error.response.status}`);
      }

      // Enrichir l'erreur avec des détails pour un meilleur débogage
      error.customData = {
        endpoint: error.config.url,
        method: error.config.method,
        requestData: error.config.data,
        responseData: error.response.data
      };
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error("📡 [API Intercepteur] Aucune réponse du serveur:", error.request);
      error.customData = {
        type: 'NO_RESPONSE',
        endpoint: error.config.url,
        method: error.config.method
      };
    } else {
      // Quelque chose s'est mal passé lors de la configuration de la requête
      console.error("⚠️ [API Intercepteur] Erreur de configuration de la requête:", error.message);
      error.customData = {
        type: 'CONFIG_ERROR',
        message: error.message
      };
    }

    // Rejeter la promesse avec l'erreur enrichie
    return Promise.reject(error);
  }
);

export default api;
