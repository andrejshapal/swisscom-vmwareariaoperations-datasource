import {AriaQuery, QueryBuilderOptions} from "../types/queryBuilder";

export const generateQuery = (options: QueryBuilderOptions): string => {
    const params: string[] = []
    Object.entries(options.functions).forEach(([key, value]) => {
        if (value && value.length > 0) {
            params.push(`${key}(${value})`);
        }
    });
    Object.entries(options.filters).forEach(([key, value]) => {
        if (value && value.length > 0) {
            params.push(`${key}(${value})`);
        }
    });
    Object.entries(options.collectors).forEach(([key, value]) => {
        if (value && value.length > 0) {
            params.push(`${key}(${value})`);
        }
    });
    options.customFilters.forEach((value) => {
        if (value) {
            params.push(`where(${value.type || ""}${value.operand || ""}${value.value || ""})`);
        }
    });

    return params.join('.');
}

/**
 * Takes a Query and transforms it to the latest interface.
 */
export const migrateQuery = (savedQuery: AriaQuery): AriaQuery => {
    const isGrafanaDefaultQuery = savedQuery.rawQuery === undefined;
    if (isGrafanaDefaultQuery) {
        return savedQuery;
    }

    return savedQuery;
};
