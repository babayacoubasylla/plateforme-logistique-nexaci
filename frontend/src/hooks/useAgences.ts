import { useState, useEffect } from 'react';
import axios from 'axios';

interface AgenceData {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
}

interface UseAgencesHook {
  agences: AgenceData[];
  loading: boolean;
  error: string | null;
  fetchAgences: () => Promise<void>;
}

export const useAgences = (): UseAgencesHook => {
  const [agences, setAgences] = useState<AgenceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgences = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/agences');
      setAgences(response.data.data.agences);
    } catch (err) {
      setError('Erreur lors du chargement des points relais');
      console.error('Erreur de chargement des agences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgences();
  }, []);

  return { agences, loading, error, fetchAgences };
};