// plateforme-logistique/frontend/src/services/authService.ts
import api from './api';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'client' | 'livreur' | 'gerant' | 'admin' | 'super_admin';
  profile: {
    adresse?: string;
    ville?: string;
    date_naissance?: Date;
    cin?: string;
    numero_permis?: string;
    agence_id?: string;
    agence?: string;
    statut: 'actif' | 'inactif' | 'suspendu';
    solde: number;
  };
  date_creation: Date;
  date_modification: Date;
}

interface LoginCredentials {
  email?: string;
  telephone?: string;
  password: string;
}

interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  role?: string;
}

interface LoginResponse {
  status: 'success';
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

interface RegisterResponse {
  status: 'success';
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

interface MeResponse {
  status: 'success';
  data: {
    user: User;
  };
}

const transformUser = (rawUser: any): User => {
  return {
    id: rawUser.id || rawUser._id,
    nom: rawUser.nom,
    prenom: rawUser.prenom,
    email: rawUser.email,
    telephone: rawUser.telephone,
    role: rawUser.role,
    profile: {
      adresse: rawUser.profile?.adresse,
      ville: rawUser.profile?.ville,
      date_naissance: rawUser.profile?.date_naissance ? new Date(rawUser.profile.date_naissance) : undefined,
      cin: rawUser.profile?.cin,
      numero_permis: rawUser.profile?.numero_permis,
      agence_id: rawUser.profile?.agence_id,
      agence: rawUser.profile?.agence,
      statut: rawUser.profile?.statut || 'actif',
      solde: rawUser.profile?.solde || 0
    },
    date_creation: new Date(rawUser.date_creation || rawUser.createdAt),
    date_modification: new Date(rawUser.date_modification || rawUser.updatedAt)
  };
};

export const authService = {
  login: (credentials: LoginCredentials): Promise<LoginResponse> =>
    api.post('/api/auth/login', credentials)
      .then(res => ({
        ...res.data,
        data: {
          ...res.data.data,
          user: transformUser(res.data.data.user)
        }
      })),

  register: (userData: RegisterData): Promise<RegisterResponse> =>
    api.post('/api/auth/register', userData)
      .then(res => ({
        ...res.data,
        data: {
          ...res.data.data,
          user: transformUser(res.data.data.user)
        }
      })),

  getMe: (): Promise<MeResponse> =>
    api.get('/api/auth/me')
      .then(res => ({
        ...res.data,
        data: {
          user: transformUser(res.data.data.user)
        }
      })),
};