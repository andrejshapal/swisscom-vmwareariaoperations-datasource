import {DataSource} from "../datasource";
import {QueryBuilderOptions} from "../types/queryBuilder";

export type UseFetch = (
    datasource: DataSource,
    builderOptions: QueryBuilderOptions,
) => readonly string[];

export type SingleChangeFunction = (
    value: string,
) => void;

export type MultiChangeFunction = (
    value:string[],
) => void;

export function createEmptyStringInstance<T>(): T {
    return new Proxy({}, {
        get: () => '',
    }) as T;
}
