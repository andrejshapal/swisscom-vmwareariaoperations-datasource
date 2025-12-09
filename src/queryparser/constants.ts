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

export const LANG_ID = 'aria-operations';

export const FUNCTIONS = [
    'adapterKind',
    'resourceKind',
]

export const FILTERS = [
    'whereHealth',
    'whereState',
    'whereStatus',
    'whereTag',
]

export const COLLECTORS = [
    'withMetric',
    'withProperty'
]

export const CUSTOM_FILTERS = [
    'where',
]

export const KEYWORDS = [
    ...FUNCTIONS,
    ...FILTERS,
    ...COLLECTORS,
    ...CUSTOM_FILTERS,
]

export const STATES = [
    'STOPPED',
    'STARTING',
    'STARTED',
    'STOPPING',
    'UPDATING',
    'FAILED',
    'MAINTAINED',
    'MAINTAINED_MANUAL',
    'REMOVING',
    'NOT_EXISTING',
    'NONE',
    'UNKNOWN',
];

export const STATUSES = [
    'NONE',
    'ERROR',
    'UNKNOWN',
    'DOWN',
    'DATA_RECEIVING',
    'OLD_DATA_RECEIVING',
    'NO_DATA_RECEIVING',
    'NO_PARENT_MONITORING',
    'COLLECTOR_DOWN',
];

export const HEALTH = ['GREEN', 'YELLOW', 'ORANGE', 'RED', 'GREY'];

// export const KEYWORDS = [
//     'resource',
//     'adapter',
//     'all',
//     'regex',
//     'name',
//     'id',
//     'whereProperties',
//     'metrics',
//     'not',
//     'and',
//     'or',
//     'contains',
//     'not',
//     'exists',
//     'starts_with',
//     'ends_with',
//     'whereHealth',
//     'whereState',
//     'whereStatus',
//     'whereTags',
//     'avg',
//     'stddev',
//     'sum',
//     'min',
//     'max',
//     'count',
//     'variance',
//     'percentile',
//     'mavg',
//     'mmax',
//     'mmin',
//     'mmedian',
//     'mstddev',
//     'mvariance',
//     'msum',
//     'mexpavg',
//     'mgaussian',
// ];