package plugin

import (
	"swisscom-vmwareariaoperations-datasource/pkg/api"
	"time"
)

type queryModel struct {
	BuilderOptions QueryBuilderOptions `json:"builderOptions,omitempty"`
}

type QueryBuilderOptions struct {
	Functions     Functions       `json:"functions,omitempty"`
	Filters       Filters         `json:"filters,omitempty"`
	Collectors    Collectors      `json:"collectors,omitempty"`
	CustomFilters []CustomFilters `json:"customFilters,omitempty"`
	QueryType     QueryType       `json:"queryType,omitempty"`
}

type QueryType string

const (
	TimeSeries QueryType = "timeSeries"
	Table      QueryType = "table"
)

type Functions struct {
	AdapterKind  string `json:"adapterKind,omitempty"`
	ResourceKind string `json:"resourceKind,omitempty"`
	WithMetric   string `json:"withMetric,omitempty"`
}

type Filters struct {
	WhereHealth []api.ResourceQueryResourceHealth `json:"whereHealth,omitempty"`
	WhereState  []api.ResourceQueryResourceState  `json:"whereState,omitempty"`
	WhereStatus []api.ResourceQueryResourceStatus `json:"whereStatus,omitempty"`
	WhereTag    []string                          `json:"whereTag,omitempty"`
}

type CustomFilters struct {
	Type    string `json:"type,omitempty"`
	Operand string `json:"operand,omitempty"`
	Value   string `json:"value,omitempty"`
}

type Collectors struct {
	WithProperty []string `json:"withProperty,omitempty"`
}

type AriaRequestModel struct {
	AdapterKind  string `json:"adapterKind,omitempty"`
	ResourceKind string `json:"resourceKind,omitempty"`
}

type MetricPropertyResponse struct {
	Metrics    *[]string `json:"metrics,omitempty"`
	Properties *[]string `json:"properties,omitempty"`
}

type CustomMeta struct {
	ResultType string `json:"resultType,omitempty"`
}

type timeData struct {
	Timestamp []time.Time
	Data      []float64
}

type Tags struct {
	Name  string `json:"category"`
	Value string `json:"name"`
}
