import { useState, useEffect, useCallback } from "react";
import { lawsService } from "../services/lawsService";
import { getToken, removeToken } from "../services/api";

export const useLaws = (currentTab, searchQuery) => {
  const [laws, setLaws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLaws = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError("Please log in first");
        setLoading(false);
        return;
      }

      let response;
      const params = searchQuery.trim() ? { search: searchQuery.trim() } : {};

      if (currentTab === 1) {
        response = await lawsService.getByStatus("published", params);
      } else if (currentTab === 2) {
        response = await lawsService.getByStatus("draft", params);
      } else if (currentTab === 3) {
        response = await lawsService.getByStatus("archived", params);
      } else {
        response = await lawsService.getAll(params);
      }

      const lawsData = response.data.data || response.data || [];
      setLaws(lawsData);
    } catch (err) {
      console.error("Error fetching laws:", err);
      setError("An error occurred while fetching laws");
      setLaws([]);

      if (err.response?.status === 401) {
        removeToken();
      }
    } finally {
      setLoading(false);
    }
  }, [currentTab, searchQuery]);

  useEffect(() => {
    fetchLaws();
  }, [fetchLaws]);

  return { laws, loading, error, refetch: fetchLaws };
};

