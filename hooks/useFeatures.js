import { useState, useEffect } from 'react';
import config from '@/config';

export const useFeatures = () => {
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "TenantId": config.tenantId,
          },
          body: JSON.stringify({
            operation: "",
            procedureName: "SP_EcomItem",
            parameters: { QueryChecker: 15 }, // 15 = Get all feature flags
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch features');
        }

        const data = await response.json();
        
        // Convert array to object with FeatureKey as key and IsActive as value
        const featureMap = data.reduce((acc, feature) => {
          if (feature.FeatureKey) {
            acc[feature.FeatureKey] = feature.IsActive;
          }
          return acc;
        }, {});
        
        setFeatures(featureMap);
      } catch (error) {
        console.error('Error fetching features:', error);
        setFeatures({});
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  return { features, loading };
};