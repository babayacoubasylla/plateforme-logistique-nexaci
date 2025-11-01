// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';

// Interface pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email?: string; telephone?: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  register: (userData: { nom: string; prenom: string; email: string; telephone: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Propriétés attendues par le fournisseur de contexte
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Fournisseur de contexte d'authentification.
 * Gère l'état de connexion, le token JWT, et les fonctions de login/logout.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // État de l'utilisateur
  const [loading, setLoading] = useState(true);          // État de chargement initial (vérification du token)

  // Effet pour vérifier le token au chargement de l'application
  useEffect(() => {
    const token = localStorage.getItem('token'); // Récupérer le token du localStorage
    console.log("[AuthContext] useEffect: Vérification du token au démarrage. Token trouvé:", !!token); // <-- LOG TEMPORAIRE
    if (token) {
      // Vérifier le token en appelant l'API (ou décodant le JWT localement si possible et sécurisé)
      authService.getMe()
        .then(response => {
          console.log("[AuthContext] useEffect: Token valide, utilisateur récupéré:", response.data.user); // <-- LOG TEMPORAIRE
          setUser(response.data.user); // Mettre à jour l'état utilisateur
        })
        .catch((error) => {
          console.error("[AuthContext] useEffect: Erreur lors de la vérification du token:", error); // <-- LOG TEMPORAIRE
          localStorage.removeItem('token'); // Nettoyer le token invalide
        })
        .finally(() => {
          console.log("[AuthContext] useEffect: Fin du chargement initial (token vérifié ou non)"); // <-- LOG TEMPORAIRE
          setLoading(false); // Arrêter le chargement
        });
    } else {
      console.log("[AuthContext] useEffect: Aucun token trouvé dans localStorage"); // <-- LOG TEMPORAIRE
      setLoading(false); // Arrêter le chargement si aucun token
    }
  }, []);

  /**
   * Fonction de connexion
   * @param credentials Identifiants de connexion (email/tel + mot de passe)
   * @returns Promesse résolue avec le résultat de la connexion
   */
  const login = async (credentials: { email?: string; telephone?: string; password: string }) => {
    console.log("🔐 [AuthContext] Fonction login ENTREE avec:", credentials); // <-- LOG ICI
    try {
      console.log("📡 [AuthContext] Appel de authService.login..."); // <-- LOG ICI
      const response = await authService.login(credentials);
      console.log("✅ [AuthContext] Réponse authService.login reçue:", response); // <-- LOG ICI
      // Supporter à la fois { status, message, data: { token, user } } et directement { token, user }
      const payload: any = (response as any)?.data ?? response;
      const token = payload?.token;
      const user = payload?.user;
      if (!token || !user) {
        throw new Error('Réponse de connexion invalide');
      }
      console.log("💾 [AuthContext] Stockage du token et mise à jour de l'utilisateur..."); // <-- LOG ICI
      localStorage.setItem('token', token); // Stocker le token
      setUser(user); // Mettre à jour l'état utilisateur
      console.log("🎉 [AuthContext] Utilisateur connecté et état mis à jour:", user); // <-- LOG ICI
      return { success: true };
    } catch (error: any) {
      console.error("💥 [AuthContext] Erreur dans login (attrapée):", error); // <-- LOG ICI
      // Vérifier si error.response existe et son contenu
      if (error.response) {
        console.error("🚫 [AuthContext] Erreur réponse:", error.response); // <-- LOG ICI
        console.error("📄 [AuthContext] Données erreur:", error.response.data); // <-- LOG ICI
        console.error("🔢 [AuthContext] Statut erreur:", error.response.status); // <-- LOG ICI
      }
      return { success: false, message: error.response?.data?.message || "Erreur de connexion" };
    }
  };

  /**
   * Fonction d'inscription
   * @param userData Données de l'utilisateur à inscrire
   * @returns Promesse résolue avec le résultat de l'inscription
   */
  const register = async (userData: { nom: string; prenom: string; email: string; telephone: string; password: string }) => {
    console.log("🔐 [AuthContext] Fonction register ENTREE avec:", userData); // <-- LOG ICI
    try {
      console.log("📡 [AuthContext] Appel de authService.register..."); // <-- LOG ICI
      const response = await authService.register(userData);
      console.log("✅ [AuthContext] Réponse authService.register reçue:", response); // <-- LOG ICI
      const payload: any = (response as any)?.data ?? response;
      const token = payload?.token;
      const user = payload?.user;
      if (!token || !user) {
        throw new Error("Réponse d'inscription invalide");
      }
      console.log("💾 [AuthContext] Stockage du token et mise à jour de l'utilisateur (inscription)..."); // <-- LOG ICI
      localStorage.setItem('token', token); // Connecter automatiquement après l'inscription
      setUser(user);
      console.log("🎉 [AuthContext] Utilisateur inscrit et connecté:", user); // <-- LOG ICI
      return { success: true };
    } catch (error: any) {
      console.error("💥 [AuthContext] Erreur dans register (attrapée):", error); // <-- LOG ICI
      if (error.response) {
        console.error("🚫 [AuthContext] Erreur réponse (register):", error.response); // <-- LOG ICI
        console.error("📄 [AuthContext] Données erreur (register):", error.response.data); // <-- LOG ICI
        console.error("🔢 [AuthContext] Statut erreur (register):", error.response.status); // <-- LOG ICI
      }
      return { success: false, message: error.response?.data?.message || "Erreur d'inscription" };
    }
  };

  /**
   * Fonction de déconnexion
   */
  const logout = () => {
    console.log("🚪 [AuthContext] Déconnexion, suppression du token et de l'utilisateur..."); // <-- LOG ICI
    localStorage.removeItem('token'); // Supprimer le token
    setUser(null); // Réinitialiser l'état utilisateur
    // Optionnel: Appeler un endpoint de logout côté backend si nécessaire
    // authService.logout().catch(console.error);
  };

  // Valeur fournie par le contexte
  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  // Rendu du fournisseur avec la valeur
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
