import {
    Collectors,
    defaultBuilderQuery,
    Filters,
    Functions, Operand,
    QueryBuilderOptionsBase
} from "../types/queryBuilder";

export const retrieveQueryParams = (query: string): QueryBuilderOptionsBase => {
    const builderOptions: QueryBuilderOptionsBase = defaultBuilderQuery.builderOptions
    Object.keys(builderOptions.functions).map(key => {
        const word = key as keyof Functions;
        const regexp = new RegExp(`\\s*${word}\\(([^)]+)`);
        const match = query.match(regexp)
        if (match && match[1]){
            builderOptions.functions[word] = match[1]
        }
    })
    Object.keys(builderOptions.collectors).map(key => {
        const word = key as keyof Collectors;
        const regexp = new RegExp(`\\s*${word}\\(([^)]+)`);
        const match = query.match(regexp)
        if (match && match[1]){
            builderOptions.collectors[word] = match[1].split(",")
        }
    })
    Object.keys(builderOptions.filters).map(key => {
        const word = key as keyof Filters;
        const regexp = new RegExp(`\\s*${word}\\(([^)]+)`);
        const match = query.match(regexp)
        if (match && match[1]){
            builderOptions.filters[word] = match[1].split(",")
        }
    })
        const regexp = new RegExp(`\\s*where\\(([^)]+)`, 'g');
        const matchesIterator = query.matchAll(regexp)
        const regexp_exp = new RegExp(`(\\w*\\|?\\w*)(=~|!~|=|!=)(.*)`);
        let k = 0;
        for (const match of matchesIterator) {
            const capturedGroup = match.slice(1);
            capturedGroup.map(g => {
                const exp = g.match(regexp_exp)
                if (exp) {
                    builderOptions.customFilters[k] = {
                        type: exp[1] || null,
                        operand: exp[2] as Operand || null,
                        value: exp[3] || ""
                    }
                }
            })
            k++
        }
return builderOptions
}
// adapterKind(APPLICATIONDISCOVERY).resourceKind(ApplicationDiscoveryAdapterInstance).where(=).where(name!~).where(tag|Name=~.*sas.*)
