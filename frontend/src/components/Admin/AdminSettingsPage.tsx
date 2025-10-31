import React, { useState } from 'react';
import { Settings, Save, RefreshCw, Mail, Phone, Building, CreditCard } from 'lucide-react';

interface AdminSettingsPageProps {
  onBack: () => void;
}

interface SystemSettings {
  emailSettings: {
    smtpServer: string;
    smtpPort: string;
    emailSender: string;
    emailPassword: string;
  };
  smsSettings: {
    apiKey: string;
    senderId: string;
    defaultPrefix: string;
  };
  generalSettings: {
    companyName: string;
    supportEmail: string;
    supportPhone: string;
    defaultCurrency: string;
    language: string;
  };
  businessRules: {
    maxPackageWeight: string;
    minShippingCost: string;
    maxMandateAmount: string;
    mandateCommissionRate: string;
  };
}

const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<SystemSettings>({
    emailSettings: {
      smtpServer: 'smtp.example.com',
      smtpPort: '587',
      emailSender: 'no-reply@example.com',
      emailPassword: '',
    },
    smsSettings: {
      apiKey: '',
      senderId: 'LogiExpress',
      defaultPrefix: '+223',
    },
    generalSettings: {
      companyName: 'LogiExpress',
      supportEmail: 'support@example.com',
      supportPhone: '+223 20000000',
      defaultCurrency: 'XOF',
      language: 'fr',
    },
    businessRules: {
      maxPackageWeight: '100',
      minShippingCost: '1000',
      maxMandateAmount: '1000000',
      mandateCommissionRate: '2.5',
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const handleChange = (section: keyof SystemSettings, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveMessage({ type: 'success', text: 'Paramètres enregistrés avec succès' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement des paramètres' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 hover:text-indigo-800 focus:outline-none"
        >
          ← Retour au tableau de bord
        </button>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paramètres Système</h1>
            <p className="mt-1 text-sm text-gray-600">
              Configurez les paramètres généraux de la plateforme
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Enregistrer
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className={`mb-4 p-4 rounded-md ${saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {saveMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Paramètres Email */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Mail className="h-6 w-6 text-indigo-600" />
            <h2 className="ml-3 text-lg font-medium">Paramètres Email</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Serveur SMTP</label>
              <input
                type="text"
                value={settings.emailSettings.smtpServer}
                onChange={(e) => handleChange('emailSettings', 'smtpServer', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Port SMTP</label>
              <input
                type="text"
                value={settings.emailSettings.smtpPort}
                onChange={(e) => handleChange('emailSettings', 'smtpPort', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email expéditeur</label>
              <input
                type="email"
                value={settings.emailSettings.emailSender}
                onChange={(e) => handleChange('emailSettings', 'emailSender', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe Email</label>
              <input
                type="password"
                value={settings.emailSettings.emailPassword}
                onChange={(e) => handleChange('emailSettings', 'emailPassword', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {/* Paramètres SMS */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Phone className="h-6 w-6 text-indigo-600" />
            <h2 className="ml-3 text-lg font-medium">Paramètres SMS</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Clé API</label>
              <input
                type="password"
                value={settings.smsSettings.apiKey}
                onChange={(e) => handleChange('smsSettings', 'apiKey', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Expéditeur</label>
              <input
                type="text"
                value={settings.smsSettings.senderId}
                onChange={(e) => handleChange('smsSettings', 'senderId', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Préfixe par défaut</label>
              <input
                type="text"
                value={settings.smsSettings.defaultPrefix}
                onChange={(e) => handleChange('smsSettings', 'defaultPrefix', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Paramètres Généraux */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Building className="h-6 w-6 text-indigo-600" />
            <h2 className="ml-3 text-lg font-medium">Paramètres Généraux</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
              <input
                type="text"
                value={settings.generalSettings.companyName}
                onChange={(e) => handleChange('generalSettings', 'companyName', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email de support</label>
              <input
                type="email"
                value={settings.generalSettings.supportEmail}
                onChange={(e) => handleChange('generalSettings', 'supportEmail', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone de support</label>
              <input
                type="text"
                value={settings.generalSettings.supportPhone}
                onChange={(e) => handleChange('generalSettings', 'supportPhone', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Devise par défaut</label>
              <select
                value={settings.generalSettings.defaultCurrency}
                onChange={(e) => handleChange('generalSettings', 'defaultCurrency', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="XOF">XOF - Franc CFA</option>
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - Dollar US</option>
              </select>
            </div>
          </div>
        </div>

        {/* Règles Métier */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <CreditCard className="h-6 w-6 text-indigo-600" />
            <h2 className="ml-3 text-lg font-medium">Règles Métier</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Poids max. des colis (kg)</label>
              <input
                type="number"
                value={settings.businessRules.maxPackageWeight}
                onChange={(e) => handleChange('businessRules', 'maxPackageWeight', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Coût min. d'expédition (XOF)</label>
              <input
                type="number"
                value={settings.businessRules.minShippingCost}
                onChange={(e) => handleChange('businessRules', 'minShippingCost', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Montant max. mandat (XOF)</label>
              <input
                type="number"
                value={settings.businessRules.maxMandateAmount}
                onChange={(e) => handleChange('businessRules', 'maxMandateAmount', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Taux de commission mandat (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.businessRules.mandateCommissionRate}
                onChange={(e) => handleChange('businessRules', 'mandateCommissionRate', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm text-gray-500">
          * Les changements seront appliqués après enregistrement
        </p>
      </div>
    </div>
  );
};

export default AdminSettingsPage;