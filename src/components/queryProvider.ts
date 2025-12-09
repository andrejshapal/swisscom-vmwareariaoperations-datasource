import {Monaco, MonacoEditor} from "@grafana/ui";
import { LANG_ID } from 'queryparser/constants';
import { monacoHighlighter } from 'queryparser/monaco/highlight';
import {DataSource} from "../datasource";
import {AriaOpsCompletionItemProvider} from "../queryparser/monaco/completion";


declare const monaco: Monaco;

export function registerQuery(lang: string, editor: MonacoEditor, datasource: DataSource) {

    editor.updateOptions({fixedOverflowWidgets: true, scrollBeyondLastLine: false});
    if (!monaco.languages.getLanguages().some((lang) => lang.id === LANG_ID)) {
        monaco.languages.register({id: LANG_ID});
        monaco.languages.setMonarchTokensProvider(LANG_ID, monacoHighlighter);
        monaco.languages.registerCompletionItemProvider(
            LANG_ID,
            new AriaOpsCompletionItemProvider(datasource, monaco)
        );
    }
    return monaco.editor;
}