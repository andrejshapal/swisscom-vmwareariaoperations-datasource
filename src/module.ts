import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { AriaSourceOptions } from './types';
import { AriaQuery } from './types/queryBuilder';
import { QueryEditor } from './views/QueryEditor';

export const plugin = new DataSourcePlugin<DataSource, AriaQuery, AriaSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
