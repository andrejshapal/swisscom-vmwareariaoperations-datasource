import {QueryBuilderOptions, QueryType} from "../../types/queryBuilder";
import {DataSource} from "../../datasource";
import {retrieveQueryParams} from "../../queryparser/utils";


export function getQueryOptionsFromCustom(query: string, queryType?: QueryType, datasource?: DataSource): QueryBuilderOptions {
    const builderOptions = retrieveQueryParams(query)

    return {
        functions: {
            adapterKind: builderOptions.functions['adapterKind'],
            resourceKind: builderOptions.functions['resourceKind'],
            withMetric: builderOptions.functions['withMetric'],
        },
        filters: {
            whereHealth: builderOptions.filters['whereHealth'],
            whereState: builderOptions.filters['whereState'],
            whereStatus: builderOptions.filters['whereStatus'],
            whereTag: builderOptions.filters['whereTag'],
        },
        collectors: {
            withProperty: builderOptions.collectors['withProperty']
        },
        customFilters: builderOptions.customFilters
    } as QueryBuilderOptions;
}

/**
 * Converts QueryType to Grafana format
 * src: https://github.com/grafana/sqlds/blob/main/query.go#L20
 */
export const mapQueryTypeToGrafanaFormat = (t?: QueryType): number => {
    switch (t) {
        case QueryType.Table:
            return 1;
        case QueryType.TimeSeries:
            return 0;
        default:
            return 1 << 8; // an unused u32, defaults to timeseries/graph on plugin backend.
    }
};