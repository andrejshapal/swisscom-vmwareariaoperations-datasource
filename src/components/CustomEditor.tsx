import React, {useRef} from 'react';
import {QueryEditorProps} from "@grafana/data";
import {DataSource} from "../datasource";
import {AriaQuery, EditorType, QueryType} from "../types/queryBuilder";
import {AriaSourceOptions} from "../types";
import {CodeEditor, monacoTypes} from "@grafana/ui";
import {pluginVersion} from "@grafana/schema/dist/esm/raw/composable/logs/panelcfg/x/LogsPanelCfg_types.gen";
import {getQueryOptionsFromCustom, mapQueryTypeToGrafanaFormat} from "./queryBuilder/utils";
import {QueryTypeSwitcher} from "./queryBuilder/QueryTypeSwitcher";
import { styles } from 'styles';
import {LANG_ID} from "../queryparser/constants";
import {registerQuery} from "./queryProvider";


type CustomEditorProps = QueryEditorProps<DataSource, AriaQuery, AriaSourceOptions>;

export const CustomEditor = (props: CustomEditorProps) => {
    const { query, onChange, datasource} = props;
    const customQuery = query as AriaQuery;
    const queryType = customQuery.queryType || QueryType.Table;
    const editorRef = useRef<monacoTypes.editor.IStandaloneCodeEditor | null>(null);

    const saveChanges = (changes: Partial<AriaQuery>) => {
        onChange(
            {
            ...customQuery,
            pluginVersion,
            builderOptions: getQueryOptionsFromCustom(query.rawQuery, query.queryType, datasource),
            editorType: EditorType.Custom,
            format: mapQueryTypeToGrafanaFormat(changes.queryType || queryType),
            ...changes,
        });
    };



    const handleMount = (editor: monacoTypes.editor.IStandaloneCodeEditor, monaco: typeof monacoTypes) => {
        editorRef.current = editor;
        registerQuery(LANG_ID, editor, datasource);
        editor.addAction({
            id: 'run-query',
            label: 'Run Query',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            run: (editor: monacoTypes.editor.IStandaloneCodeEditor) => {
                saveChanges({ rawQuery: editor.getValue() });
                props.onRunQuery();
            },
        });
    };

    return (
        <>
            <div className={'gf-form ' + styles.QueryEditor.queryType}>
                <QueryTypeSwitcher queryType={queryType} onChange={(queryType: any) => saveChanges({ queryType })} customEditor />
            </div>
            <div className={styles.Common.wrapper}>
                <CodeEditor
                    aria-label="Query Editor"
                    language={LANG_ID}
                    height={100}
                    value={query.rawQuery}
                    onSave={(q) => saveChanges({ rawQuery: q })}
                    showMiniMap={false}
                    showLineNumbers={true}
                    onBlur={(q) => saveChanges({ rawQuery: q })}
                    onEditorDidMount={handleMount}
                />
            </div>
        </>
    );
};