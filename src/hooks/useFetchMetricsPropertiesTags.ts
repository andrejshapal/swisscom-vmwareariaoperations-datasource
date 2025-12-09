import {useState, useEffect} from 'react';
import { DataSource } from "../datasource";
import {QueryBuilderOptions} from "../types/queryBuilder";

export default (datasource: DataSource, builderOptions: QueryBuilderOptions): readonly [string[], string[], string[]] => {
    const [metrics, setMetrics] = useState<string[]>([]);
    const [properties, setProperties] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [cache, setCache] = useState<Map<string, [string[], string[], string[]]>>(new Map<string, [string[], string[], string[]]>());

    useEffect(() => {

        let ignore = false;
        if (!datasource) {return;}
        const keyString = `${builderOptions.functions.adapterKind}:${builderOptions.functions.resourceKind}`;
        const fromCache = cache.get(keyString)
        if(fromCache) {
            const [metrics, properties, tags] = fromCache
            if(metrics) {setMetrics(metrics);}
            if(properties) {setProperties(properties);}
            if(tags) {setTags(tags);}
        }
        else {
            datasource
                .fetchMetricsProperties(builderOptions)
                .then(response => {
                    if (!ignore) {
                        if (response && response.metrics) {setMetrics(response.metrics);}
                        if (response && response.properties) {setProperties(response.properties);}
                        if (response && response.tags) {setTags(response.tags);}
                        setCache(cache.set(keyString, [response.metrics || [], response.properties || [], response.tags || []]))
                    }
                })
                .catch((ex: any) => {
                    console.error('Failed to fetch metrics.', ex);
                });
        }
        return () => { ignore = true; };

    }, [datasource, builderOptions.functions.resourceKind, builderOptions.functions.adapterKind]);

    return [metrics, properties, tags];
};
