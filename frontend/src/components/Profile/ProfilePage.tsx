import { useState } from 'react';
import { User, Package, FileText, MapPin, Phone, Mail, ArrowLeft, Edit2, History } from 'lucide-react';

interface ProfilePageProps {
  onBack: () => void;
  userName: string;
  userEmail: string;
  userPhone: string;
}

interface Order {
  id: string;
  type: 'shipping' | 'mandate';
  title: string;
  status: string;
  date: string;
  amount: string;
}

export default function ProfilePage({ onBack, userName, userEmail, userPhone }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');

  const recentOrders: Order[] = [
    {
      id: 'SHP123456',
      type: 'shipping',
      title: 'Envoi de colis',
      status: 'En livraison',
      date: '2025-10-13',
      amount: '2.500 FCFA'
    },
    {
      id: 'MND789012',
      type: 'mandate',
      title: 'Extrait de naissance',
      status: 'En cours',
      date: '2025-10-12',
      amount: '5.000 FCFA'
    },
    {
      id: 'SHP098765',
      type: 'shipping',
      title: 'Envoi de colis',
      status: 'Livré',
      date: '2025-10-10',
      amount: '3.000 FCFA'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Livré':
        return 'bg-emerald-100 text-emerald-800';
      case 'En livraison':
      case 'En cours':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations et consultez votre historique</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-16 mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <User className="w-12 h-12 text-emerald-600" />
                </div>
                <div className="mt-16">
                  <h2 className="text-2xl font-bold text-gray-900">{userName}</h2>
                  <p className="text-gray-600">Membre depuis Octobre 2025</p>
                </div>
              </div>
              <button className="mt-16 px-4 py-2 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'profile'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  Informations
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'history'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <History className="w-5 h-5" />
                  Historique
                </div>
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <User className="w-4 h-4" />
                        Nom complet
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {userName}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Phone className="w-4 h-4" />
                        Téléphone
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {userPhone}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {userEmail}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresses enregistrées</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-gray-900">Domicile</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Cocody, Angré 8ème tranche
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Près de la pharmacie centrale
                            </div>
                          </div>
                        </div>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                          Principale
                        </span>
                      </div>
                    </div>

                    <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                      + Ajouter une nouvelle adresse
                    </button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">3</div>
                      <div className="text-sm text-gray-600 mt-1">Envois totaux</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">2</div>
                      <div className="text-sm text-gray-600 mt-1">Mandats</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">2</div>
                      <div className="text-sm text-gray-600 mt-1">En cours</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">100%</div>
                      <div className="text-sm text-gray-600 mt-1">Satisfaction</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Historique des commandes</h3>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <option>Tous</option>
                    <option>Envois de colis</option>
                    <option>Mandats administratifs</option>
                  </select>
                </div>

                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          order.type === 'mandate' ? 'bg-blue-100' : 'bg-emerald-100'
                        }`}>
                          {order.type === 'mandate' ? (
                            <FileText className={`w-5 h-5 ${
                              order.type === 'mandate' ? 'text-blue-600' : 'text-emerald-600'
                            }`} />
                          ) : (
                            <Package className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">{order.title}</div>
                              <div className="text-sm text-gray-600 mt-1">N° {order.id}</div>
                              <div className="text-sm text-gray-500 mt-1">{order.date}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">{order.amount}</div>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Voir détails
                      </button>
                      <button className="flex-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                        Suivre
                      </button>
                    </div>
                  </div>
                ))}

                {recentOrders.length === 0 && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <History className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Aucune commande
                    </h3>
                    <p className="text-gray-600">
                      Vous n'avez pas encore effectué de commande
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
