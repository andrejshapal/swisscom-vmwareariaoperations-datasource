/*
Aria Operations plug-in for Grafana
Copyright 2023 VMware, Inc.

The BSD-2 license (the "License") set forth below applies to all parts of the
Aria Operations plug-in for Grafana project. You may not use this file except
in compliance with the License.

BSD-2 License

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this
list of conditions and the following disclaimer in the documentation and/or
other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import type { Monaco, monacoTypes } from '@grafana/ui';
import {HEALTH, KEYWORDS, STATES, STATUSES} from 'queryparser/constants';
import {KeyValue} from 'types';
import {DataSource} from "../../datasource";
import {retrieveQueryParams} from "../utils";

type HandlerFunction = (
    text: string,
    range: monacoTypes.IRange,
    handlerName: string,
) => monacoTypes.languages.ProviderResult<monacoTypes.languages.CompletionList>;

export class AriaOpsCompletionItemProvider
    implements monacoTypes.languages.CompletionItemProvider
{
    datasource: DataSource;
    monaco: Monaco;
    adapterResourceKinds?: Record<string, string[]>;
    cache: Map<string, [string[], string[], string[]]> = new Map<string, [string[], string[], string[]]>
    triggerCharacters?: string[];

    constructor(datasource: DataSource, monaco: Monaco) {
        this.datasource = datasource;
        this.monaco = monaco;
        if (!this.adapterResourceKinds || Object.keys(this.adapterResourceKinds).length === 0) {
            this.preLoadAdapterResourceKinds();
        }
        this.triggerCharacters = ['.', '(', ',']
    }

    private preLoadAdapterResourceKinds() {
        void this.datasource
            .fetchAdapterResourceKinds()
            .then((response: Record<string, string[]>) => {
                this.adapterResourceKinds = response
            });
    }

    private handleAdapterKind = (
        _: string,
        range: monacoTypes.IRange
    ): monacoTypes.languages.ProviderResult<monacoTypes.languages.CompletionList> => {
            return {
                suggestions:
                    this.adapterResourceKinds ? Object.keys(this.adapterResourceKinds).map((label) =>
                        this.makeCompletionItem(label, range, ")")
                    ) : [],
            };
        };

    private handleResourceKind = (
        text: string,
        range: monacoTypes.IRange
    ): monacoTypes.languages.ProviderResult<monacoTypes.languages.CompletionList> => {
        const builderOptions = retrieveQueryParams(text)
        if(builderOptions.functions["adapterKind"]) {
            return {
                suggestions:
                    this.adapterResourceKinds?.[builderOptions.functions["adapterKind"]].map((label) =>
                        this.makeCompletionItem(label, range, ")")
                    ) || [],
            };
        }

        let resourceKinds : string[] = []
        if (this.adapterResourceKinds) {Object.values(this.adapterResourceKinds).map(resources =>
        resourceKinds = resourceKinds.concat(resources))}
        return {
            suggestions:
                resourceKinds.map(label =>
                    this.makeCompletionItem(label, range, ")")
                ),
        };
    };


    private handleFetch = (
        text: string,
        range: monacoTypes.IRange,
    ): monacoTypes.languages.ProviderResult<monacoTypes.languages.CompletionList> => {
        const queryParams = retrieveQueryParams(text)
        const keyString = `${queryParams.functions.adapterKind}:${queryParams.functions.resourceKind}`;
        const fromCache = this.cache.get(keyString)
        return new Promise(
            (
                resolve,
            ) => {
                const suggestions:  monacoTypes.languages.CompletionItem[] = []
                if(fromCache) {
                    const [metrics] = fromCache
                    if(metrics) {
                        for (const metric of metrics) {
                            suggestions.push(
                                this.makeCompletionItem(metric, range, ')')
                            );
                        }
                    }
                }

                this.datasource.fetchMetricsProperties(queryParams)
                .then((response) => {
                    if(response && response.metrics) {
                        for (const metric of response.metrics) {

                            console.log(metric)
                                suggestions.push(
                                    this.makeCompletionItem(metric, range, ')')
                                );
                            }
                        }
                    });
                resolve({ suggestions });
            }
        );
    };

    private handleHealth = (
        text: string,
        range: monacoTypes.IRange
    ): monacoTypes.languages.ProviderResult<monacoTypes.languages.CompletionList> => {
        return {
            suggestions:
                HEALTH.map((label) => this.makeCompletionItem(label, range, "")) || [],
        };
    };

    private handleState = (
        text: string,
        range: monacoTypes.IRange
    ): monacoTypes.languages.ProviderResult<monacoTypes.languages.CompletionList> => {
        return {
            suggestions:
                STATES.map((label) => this.makeCompletionItem(label, range, "")) || [],
        };
    };

    private handleStatus = (
        text: string,
        range: monacoTypes.IRange
    ): monacoTypes.languages.ProviderResult<monacoTypes.languages.CompletionList> => {
        return {
            suggestions:
                STATUSES.map((label) => this.makeCompletionItem(label, range, "")) || [],
        };
    };

    private handleWhere = (
        text: string,
        range: monacoTypes.IRange
    ): monacoTypes.languages.ProviderResult<monacoTypes.languages.CompletionList> => {
        return {
            suggestions: [],
        };
    };

    // private handleDefault = (
    //     text: string /* eslint-disable-line @typescript-eslint/no-unused-vars */,
    //     range: monacoTypes.IRange /* eslint-disable-line @typescript-eslint/no-unused-vars */
    // ): monacoTypes.languages.ProviderResult<monacoTypes.languages.CompletionList> => {
    //     return {
    //         suggestions: [],
    //     };
    // };

    /**
     * Each keyword carries a hint on how to handle the parameters.
     */
    keywords: KeyValue<HandlerFunction> = {
        adapterKind: this.handleAdapterKind,
        resourceKind: this.handleResourceKind,
        withMetric: this.handleFetch,
        withProperty: this.handleFetch,
        whereHealth: this.handleHealth,
        whereState: this.handleState,
        whereStatus: this.handleStatus,
        where: this.handleWhere,
    };

    private makeCompletionItem(
        label: string,
        range: monacoTypes.IRange,
        end: string,
        detail?: string,
    ): monacoTypes.languages.CompletionItem {
        return {
            label,
            range,
            detail,
            insertText: label.includes(' ') ? '`' + label + '`' : label + end, // Quote strings containing spaces
            kind: this.monaco.languages.CompletionItemKind.Function,
        };
    }

    provideCompletionItems(
        model: monacoTypes.editor.ITextModel,
        position: monacoTypes.Position,
        context: monacoTypes.languages.CompletionContext /* eslint-disable-line @typescript-eslint/no-unused-vars */,
        token: monacoTypes.CancellationToken /* eslint-disable-line @typescript-eslint/no-unused-vars */
    ): monacoTypes.languages.ProviderResult<monacoTypes.languages.CompletionList> {
        const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
        });

        // We need some custom word matching due to "funny" characters like | and : in names.
        const match = textUntilPosition.match(/([A-Za-z0-9_$:|]+)$/);
        // if (!match) {
        //     return { suggestions: [] };
        // }
        const word = {
            word: match ? match[1] : '',
            endColumn: position.column,
            startColumn: position.column - (match ? match[1].length : 0),
        };
        const range: monacoTypes.IRange = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
        };

        // Are we expecting the name of a filter?
        if (
            textUntilPosition.match(/\)\s*\.\s*[^()]*$/) ||
            textUntilPosition.match(/^\s*[^()]*$/)
        ) {
            const suggestions = KEYWORDS.map((k: string) =>
                this.makeCompletionItem(k, range,"")
            );
            return { suggestions };
        }

        // Assume we're inside a filter declaration. We pick the one that's closest to the cursor looking backwards.
        let bestPos = -1;
        let bestHandler = null;
        let bestHandlerName = ""
        for (const key in this.keywords) {
            const p = textUntilPosition.lastIndexOf(key);
            if (p > bestPos) {
                bestPos = p;
                bestHandler = this.keywords[key];
                bestHandlerName = key;
            }
        }
        if (!bestHandler) {
            return { suggestions: [] };
        }

        return bestHandler(textUntilPosition, range, bestHandlerName);
    }

    resolveCompletionItem?(
        item: monacoTypes.languages.CompletionItem /* eslint-disable-line @typescript-eslint/no-unused-vars */,
        token: monacoTypes.CancellationToken /* eslint-disable-line @typescript-eslint/no-unused-vars */
    ): monacoTypes.languages.ProviderResult<monacoTypes.languages.CompletionItem> {
        return null;
    }
}