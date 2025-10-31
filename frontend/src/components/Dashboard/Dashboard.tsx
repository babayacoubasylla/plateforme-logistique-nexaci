import { Package, FileText, MapPin, History, User } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
  userName: string;
}

export default function Dashboard({ onNavigate, userName }: DashboardProps) {
  const services = [
    {
      id: 'shipping',
      title: 'Envoi de Colis',
      description: 'Envoyez vos colis rapidement avec tracking en temps réel',
      icon: Package,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'mandate',
      title: 'Mandat Administratif',
      description: 'Obtenez vos documents administratifs sans vous déplacer',
      icon: FileText,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'tracking',
      title: 'Suivi de Commande',
      description: 'Suivez vos colis et mandats en temps réel',
      icon: MapPin,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      id: 'history',
      title: 'Historique',
      description: 'Consultez l\'historique de vos envois et demandes',
      icon: History,
      color: 'violet',
      gradient: 'from-violet-500 to-purple-600'
    }
  ];

  const stats = [
    { label: 'Envois actifs', value: '0', color: 'text-emerald-600' },
    { label: 'Mandats en cours', value: '0', color: 'text-blue-600' },
    { label: 'Total livraisons', value: '0', color: 'text-amber-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">ExpressLogis</h1>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <User className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">{userName}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, {userName.split(' ')[0]} !
          </h2>
          <p className="text-gray-600">
            Votre plateforme de logistique et de services administratifs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => onNavigate(service.id)}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className={`h-2 bg-gradient-to-r ${service.gradient}`} />
                <div className="p-6">
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Notre Engagement</h3>
              <p className="text-emerald-50 max-w-2xl leading-relaxed">
                Nous simplifions votre vie avec une logistique rapide et fiable,
                et facilitons vos démarches administratives où que vous soyez en Côte d'Ivoire.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
