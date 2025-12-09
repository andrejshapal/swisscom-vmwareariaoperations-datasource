import {DataQuery} from "@grafana/schema";
import {QueryEditorProps} from "@grafana/data";
import {DataSource} from "../datasource";
import {AriaSourceOptions} from "../types";

/**
 * QueryType determines the display/query format.
 */
export enum QueryType {
    Table = 'table',
    TimeSeries = 'timeseries',
}

export interface Functions {
    adapterKind: string;
    resourceKind: string;
    withMetric: string;
}

export interface Filters {
    whereHealth: string[];
    whereState: string[];
    whereStatus: string[];
    whereTag: string[];
}

export interface Collectors {
    withProperty: string[];
}

export enum Operand {
    Eq = '=',
    NotEq = '!=',
    Like = '=~',
    NotLike = '!~',
}

export enum CustomFilterType {
    Name = 'resourceName',
}

export interface CustomFilter {
    type: CustomFilterType | string | null,
    operand: Operand | null,
    value: string | null,
}

export interface QueryBuilderOptionsBase {
    functions: Functions;
    filters: Filters;
    collectors: Collectors;
    customFilters: CustomFilter[];
}

export interface QueryBuilderOptions extends QueryBuilderOptionsBase{
    queryType: QueryType;
}

export enum EditorType {
    Custom = 'custom',
    Builder = 'builder',
}

export interface QueryBase extends DataQuery {
    pluginVersion: string,
    editorType: EditorType;
    rawQuery: string;

    /**
     * REQUIRED by backend for auto selecting preferredVisualizationType.
     * Only used in explore view.
     * src: https://github.com/grafana/sqlds/blob/dda2dc0a54b128961fc9f7885baabf555f3ddfdc/query.go#L36
     */
    format?: number;
}

export interface AriaQuery extends QueryBase {
    editorType: EditorType;
    queryType?: QueryType; // only used in explore view
    builderOptions: QueryBuilderOptions;
    meta?: {
        timezone?: string;
        // meta fields to be used just for building builder options when migrating back to EditorType.Builder
    };
    expand?: boolean;
}

export const defaultBuilderQuery: Omit<AriaQuery, 'refId'> = {
    pluginVersion: '',
    editorType: EditorType.Builder,
    rawQuery: '',
    builderOptions: {
        functions: {
            adapterKind: "",
            resourceKind: "",
            withMetric: "",
        },
        filters: {
            whereHealth: [],
            whereState: [],
            whereStatus: [],
            whereTag: [],
        },
        collectors: {
            withProperty: []
        },
        customFilters: [],
        queryType: QueryType.TimeSeries
    },
};

export type vROPsQueryEditorProps = QueryEditorProps<DataSource, AriaQuery, AriaSourceOptions>;
