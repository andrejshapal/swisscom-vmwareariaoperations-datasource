import { DataSourceJsonData } from '@grafana/data';

export interface DataPoint {
  Time: number;
  Value: number;
}

export interface DataSourceResponse {
  datapoints: DataPoint[];
}

/**
 * These are options configured for each DataSource instance
 */
export interface AriaSourceOptions extends DataSourceJsonData {
  host: string;
  username: string;
  authSource: string;
  tlsSkipVerify: boolean;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface AriaSecureJsonData {
  password?: string;
}
export interface KeyValue<T> {
  [key: string]: T;
}

export interface MetricPropertyTagResponse {
  tags?: string[]; // Optional array of strings
  metrics?: string[]; // Optional array of strings
  properties?: string[]; // Optional array of strings
}
