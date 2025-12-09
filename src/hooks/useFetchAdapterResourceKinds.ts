import { useState, useEffect } from 'react';
import { DataSource } from '../datasource';

export default (datasource: DataSource): Record<string, string[]> => {
  const [adapterKinds, setAdapterResponseKinds] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let ignore = false;
    if (!datasource) {
      return;
    }

    datasource
      .fetchAdapterResourceKinds()
      .then((response) => {
        if (ignore) {
          return;
        }
        if (!ignore) {
          setAdapterResponseKinds(response);
        }
      })
      .catch((ex: any) => {
        console.error('Failed to fetch adapter kinds.', ex);
      });

    return () => {
      ignore = true;
    };
  }, [datasource]);

  return adapterKinds;
};
