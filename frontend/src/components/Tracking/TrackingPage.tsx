// src/components/Tracking/TrackingPage.tsx
import React, { useState } from 'react';
import { trackingService, ColisTrackingDetails, MandatTrackingDetails, ColisTrackingHistoryItem, MandatTrackingHistoryItem } from '../../services/trackingService';

interface Props {
  onBack: () => void;
}

const TrackingPage: React.FC<Props> = ({ onBack }) => {
  const [reference, setReference] = useState('');
  const [trackingData, setTrackingData] = useState<ColisTrackingDetails | MandatTrackingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataType, setDataType] = useState<'colis' | 'mandat' | null>(null); // Pour savoir si c'est un colis ou un mandat

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) {
      setError('Veuillez entrer une référence.');
      return;
    }

    setLoading(true);
    setError(null);
    setTrackingData(null);
    setDataType(null);

    // Nettoyer et normaliser la référence
    const ref = reference.trim().toUpperCase();
    console.log("🔍 [TrackingPage] Référence brute:", ref);
    
    // Validation du format - le format complet doit être: PREFIX-ANNÉE-NUMÉRO (ex: CLS-2025-000001)
    const cleanRef = ref.replace(/\s+/g, '');
    if (!cleanRef.match(/^(CLS|SHP|MND)-\d{4}-\d{6}$/)) {
      setError('Format de référence invalide. Le format attendu est: CLS-2025-000001 ou SHP-2025-000001 ou MND-2025-000001 (avec l\'année à 4 chiffres et le numéro à 6 chiffres)');
      setLoading(false);
      return;
    }
    
    console.log("🔍 [TrackingPage] Recherche lancée pour la référence:", ref);

    try {
      // Essayer de suivre un colis d'abord
      try {
        console.log("🔍 [TrackingPage] Appel trackingService.trackColis..."); // <-- LOG ICI
        const colisResponse = await trackingService.trackColis(reference);
        console.log("✅ [TrackingPage] Réponse Suivi Colis reçue:", colisResponse); // <-- LOG ICI
        setTrackingData(colisResponse.data.colis);
        setDataType('colis');
      } catch (colisError: any) {
        console.error("⚠️ [TrackingPage] Erreur Suivi Colis (attrapée):", colisError); // <-- LOG ICI
        // Si le suivi colis échoue, essayer le suivi mandat
        if (colisError.response?.status === 404) {
          console.log("🔍 [TrackingPage] 404 sur colis, tentative de suivi mandat..."); // <-- LOG ICI
          try {
            const mandatResponse = await trackingService.trackMandat(reference);
            console.log("✅ [TrackingPage] Réponse Suivi Mandat reçue:", mandatResponse); // <-- LOG ICI
            setTrackingData(mandatResponse.data.mandat);
            setDataType('mandat');
          } catch (mandatError: any) {
            console.error("⚠️ [TrackingPage] Erreur Suivi Mandat (attrapée):", mandatError); // <-- LOG ICI
            if (mandatError.response?.status === 404) {
              setError('Aucun colis ou mandat trouvé avec cette référence.');
            } else {
              setError(mandatError.response?.data?.message || 'Erreur lors du suivi du mandat.');
            }
          }
        } else {
          setError(colisError.response?.data?.message || 'Erreur lors du suivi du colis.');
        }
      }
    } catch (err: any) {
      console.error("💥 [TrackingPage] Erreur générale de suivi (non attrapée):", err); // <-- LOG ICI
      setError('Une erreur inattendue s\'est produite.');
    } finally {
      console.log("🏁 [TrackingPage] Requête de suivi terminée."); // <-- LOG ICI
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      if (!reference || !dataType) return;
      const apiModule = await import('../../services/api');
      const api = apiModule.default;
      const ref = reference.trim().toUpperCase();
      if (dataType === 'colis') {
        const res = await api.get(`/api/colis/receipt/ref/${ref}` as const, { responseType: 'blob' });
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recu-colis-${ref}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else if (dataType === 'mandat') {
        const res = await api.get(`/api/mandats/receipt/ref/${ref}` as const, { responseType: 'blob' });
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recu-mandat-${ref}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Erreur lors du téléchargement du reçu:', e);
      alert("Impossible de télécharger le reçu. Veuillez réessayer.");
    }
  };

  return (
    <div className="tracking-page max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md mt-6">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
      >
        &larr; Retour
      </button>

      <h1 className="text-2xl font-bold text-center mb-6">Suivi de Commande</h1>

      <form onSubmit={handleSearch} className="mb-6 flex">
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Entrez la référence (ex: CLS-2025-000001 ou SHP-2025-000001)"
          className="flex-grow px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Recherche...' : 'Suivre'}
        </button>
      </form>

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {loading && <div className="text-center">Chargement des détails...</div>}

      {/* Affichage conditionnel des résultats */}
      {trackingData && dataType === 'colis' && (
        <div className="tracking-details space-y-4">
          <div className="detail-card p-4 border border-gray-200 rounded">
            <h2 className="text-xl font-semibold mb-2">Détails du Colis</h2>
            <p><strong>Référence:</strong> {(trackingData as ColisTrackingDetails).reference}</p>
            <p><strong>Expéditeur:</strong> {(trackingData as ColisTrackingDetails).expediteur.nom}</p>
            <p><strong>Destinataire:</strong> {(trackingData as ColisTrackingDetails).destinataire.nom}</p>
            <p><strong>Statut Actuel:</strong> <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">{(trackingData as ColisTrackingDetails).statut}</span></p>
            <p><strong>Poids:</strong> {(trackingData as ColisTrackingDetails).details_colis.poids} kg</p>
            <p><strong>Coût Total:</strong> XOF {(trackingData as ColisTrackingDetails).tarif.total}</p>
            {/* Ajouter plus de détails si nécessaire */}
          </div>

          <div className="history-section">
            <h3 className="text-lg font-medium mb-2">Historique du Suivi</h3>
            <ul className="space-y-2">
              {(trackingData as ColisTrackingDetails).historique.map((item: ColisTrackingHistoryItem, index: number) => (
                <li key={index} className="p-3 border-b border-gray-100">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.statut}</span>
                    <span className="text-sm text-gray-500">{new Date(item.date).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  {item.utilisateur && (
                    <p className="text-xs text-gray-400">
                      Mis à jour par: {item.utilisateur.prenom} {item.utilisateur.nom} ({item.utilisateur.role})
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleDownloadReceipt}
            className="mt-4 w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Télécharger le Reçu (PDF)
          </button>
        </div>
      )}

      {trackingData && dataType === 'mandat' && (
        <div className="tracking-details space-y-4">
          <div className="detail-card p-4 border border-gray-200 rounded">
            <h2 className="text-xl font-semibold mb-2">Détails du Mandat</h2>
            <p><strong>Référence:</strong> {(trackingData as MandatTrackingDetails).reference}</p>
            <p><strong>Client:</strong> {(trackingData as MandatTrackingDetails).client.nom}</p>
            <p><strong>Type de Document:</strong> {(trackingData as MandatTrackingDetails).type_document.nom}</p>
            <p><strong>Administration:</strong> {(trackingData as MandatTrackingDetails).administration.nom} ({(trackingData as MandatTrackingDetails).administration.ville})</p>
            <p><strong>Statut Actuel:</strong> <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">{(trackingData as MandatTrackingDetails).statut}</span></p>
            <p><strong>Coût Total:</strong> XOF {(trackingData as MandatTrackingDetails).tarif.total}</p>
            {/* Ajouter plus de détails si nécessaire */}
          </div>

          <div className="history-section">
            <h3 className="text-lg font-medium mb-2">Historique du Suivi</h3>
            <ul className="space-y-2">
              {(trackingData as MandatTrackingDetails).historique.map((item: MandatTrackingHistoryItem, index: number) => (
                <li key={index} className="p-3 border-b border-gray-100">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.statut}</span>
                    <span className="text-sm text-gray-500">{new Date(item.date).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  {item.utilisateur && (
                    <p className="text-xs text-gray-400">
                      Mis à jour par: {item.utilisateur.prenom} {item.utilisateur.nom} ({item.utilisateur.role})
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {(trackingData as MandatTrackingDetails).documents && (trackingData as MandatTrackingDetails).documents.length > 0 && (
            <div className="documents-section">
              <h3 className="text-lg font-medium mb-2">Documents Téléchargés</h3>
              <ul className="space-y-1">
                {(trackingData as MandatTrackingDetails).documents.map((doc: { type_document: string; nom_fichier: string; url: string }, index: number) => (
                  <li key={index} className="text-sm">
                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                      {doc.nom_fichier} ({doc.type_document})
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleDownloadReceipt}
            className="mt-4 w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Télécharger le Reçu (PDF)
          </button>
        </div>
      )}
    </div>
  );
};

export default TrackingPage;