import {QueryBuilderOptions, QueryType} from "../types/queryBuilder";

export const isBuilderOptionsRunnable = (builderOptions: QueryBuilderOptions): boolean => {
    return (
        (builderOptions.functions.adapterKind?.length || 0) > 0
    );
};

/**
 * Converts QueryBuilderOptions to Grafana format
 * src: https://github.com/grafana/sqlds/blob/main/query.go#L20
 */
export const mapQueryBuilderOptionsToGrafanaFormat = (t?: QueryBuilderOptions): number => {
    switch (t?.queryType) {
        case QueryType.Table:
            return 1;
        case QueryType.TimeSeries:
            return 0;
        default:
            return 1 << 8; // an unused u32, defaults to timeseries/graph on plugin backend.
    }
};
