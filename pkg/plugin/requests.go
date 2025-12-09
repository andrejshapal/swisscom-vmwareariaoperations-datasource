package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"swisscom-vmwareariaoperations-datasource/pkg/api"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/oapi-codegen/runtime/types"
)

var tagProperty = "summary|tagJson"

func (d *Datasource) fetchProperties(ctx context.Context, q queryModel, resourceIds *map[types.UUID]*api.ResourceKey, from time.Time, to time.Time) (*[]api.InternalResourcePropertyContents, error) {
	fromMilli := from.UnixMilli()
	toMilli := to.UnixMilli()
	resourceIdsSlice := make([]types.UUID, 0)
	for resourceId := range *resourceIds {
		resourceIdsSlice = append(resourceIdsSlice, resourceId)
	}
	body := api.QueryPropertyChangesOfResourcesUsingPOSTJSONRequestBody{
		ResourceId:  resourceIdsSlice,
		PropertyKey: append(q.BuilderOptions.Collectors.WithProperty, tagProperty),
		Begin:       &fromMilli,
		End:         &toMilli,
	}
	params := api.QueryPropertyChangesOfResourcesUsingPOSTParams{
		XOpsAPIUseUnsupported: true,
	}

	resp, err := d.ariaClient.QueryPropertyChangesOfResourcesUsingPOSTWithResponse(ctx, &params, body)
	if err != nil {
		return nil, err
	}
	if resp.JSON200 != nil && resp.JSON200.Values != nil {
		return resp.JSON200.Values, nil
	}
	return nil, fmt.Errorf("no properties found matching query")
}

func (d *Datasource) fetchMetrics(ctx context.Context, q queryModel, resourceIds *map[types.UUID]*api.ResourceKey, from time.Time, to time.Time) (*[]api.StatsOfResource, error) {
	fromMilli := from.UnixMilli()
	toMilli := to.UnixMilli()
	resourceIdsSlice := make([]types.UUID, 0)
	for resourceId := range *resourceIds {
		resourceIdsSlice = append(resourceIdsSlice, resourceId)
	}
	body := api.GetStatsForResourcesUsingPOSTJSONRequestBody{
		ResourceId: &resourceIdsSlice,
		StatKey:    &[]string{q.BuilderOptions.Functions.WithMetric},
		Begin:      &fromMilli,
		End:        &toMilli,
	}

	resp, err := d.ariaClient.GetStatsForResourcesUsingPOSTWithResponse(ctx, body)
	if err != nil {
		return nil, err
	}
	if resp.JSON200 != nil && resp.JSON200.Values != nil {
		return resp.JSON200.Values, nil
	}
	return nil, fmt.Errorf("no metrics found matching query")
}

func (d *Datasource) fetchResources(ctx context.Context, q queryModel) (map[types.UUID]*api.ResourceKey, error) {
	var params api.GetMatchingResourcesUsingPOSTParams
	body := api.GetMatchingResourcesUsingPOSTJSONRequestBody{}
	if q.BuilderOptions.Functions.AdapterKind != "" {
		adapterKind := []string{q.BuilderOptions.Functions.AdapterKind}
		body.AdapterKind = &adapterKind
	}
	if q.BuilderOptions.Functions.ResourceKind != "" {
		resourceKind := []string{q.BuilderOptions.Functions.ResourceKind}
		body.ResourceKind = &resourceKind
	}
	if q.BuilderOptions.Filters.WhereHealth != nil {
		body.ResourceHealth = &q.BuilderOptions.Filters.WhereHealth
	}
	if q.BuilderOptions.Filters.WhereState != nil {
		body.ResourceState = &q.BuilderOptions.Filters.WhereState
	}
	//if q.BuilderOptions.Filters.WhereTag != nil {
	//	body.ResourceTag = &q.BuilderOptions.Filters.WhereTag
	//}
	resp, err := d.ariaClient.GetMatchingResourcesUsingPOSTWithResponse(ctx, &params, body)
	if err != nil {
		return nil, err
	}
	resourceIds := make(map[types.UUID]*api.ResourceKey)
	if resp.JSON200 != nil && resp.JSON200.ResourceList != nil {
		for _, resources := range *resp.JSON200.ResourceList {
			resourceIds[resources.Identifier] = &resources.ResourceKey
		}
		return resourceIds, nil
	}
	return nil, fmt.Errorf("no resources found matching query")
}

func (d *Datasource) fetchAdapterKinds(rw http.ResponseWriter, req *http.Request) {
	rw.Header().Add("Content-Type", "application/json")

	resp, err := d.ariaClient.GetAdapterTypesUsingGETWithResponse(req.Context(), &api.GetAdapterTypesUsingGETParams{})
	if err != nil {
		backend.Logger.Error("Unable to get adapter types", "error", err)
		return
	}
	adapterKinds := make(map[string]*[]string)
	for _, adapterKind := range *resp.JSON200.AdapterKind {
		adapterKinds[adapterKind.Key] = adapterKind.ResourceKinds
	}
	jsonData, err := json.Marshal(adapterKinds)
	if err != nil {
		backend.Logger.Error("Unable to encode adapters", "error", err)
		return
	}
	_, err = rw.Write(jsonData)
	if err != nil {
		backend.Logger.Error("Unable to write response", "error", err)
		return
	}
	rw.WriteHeader(http.StatusOK)
}

func (d *Datasource) fetchMetricsProperties(rw http.ResponseWriter, req *http.Request) {
	adapterKind := req.URL.Query().Get("adapterKind")
	resourceKind := req.URL.Query().Get("resourceKind")
	if adapterKind == "" || resourceKind == "" {
		http.Error(rw, "Missing parameters", http.StatusBadRequest)
		return
	}
	rw.Header().Add("Content-Type", "application/json")

	metricPropertyResponse := MetricPropertyResponse{}
	metrics := make([]string, 0)
	properties := make([]string, 0)

	statsOnly := false
	response, err := d.ariaClient.GetResourceTypeAttributesForAdapterTypeUsingGETWithResponse(req.Context(), adapterKind, resourceKind, &api.GetResourceTypeAttributesForAdapterTypeUsingGETParams{StatOnly: &statsOnly})
	if err != nil {
		backend.Logger.Error("Unable to get metrics and properties", "adapterKind", &adapterKind, "resourceKind", &resourceKind, "error", err)
		rw.WriteHeader(http.StatusBadRequest)
		return
	}
	for _, metric := range *response.JSON200.ResourceTypeAttributes {
		if metric.Property {
			properties = append(properties, metric.Key)
			continue
		}
		metrics = append(metrics, metric.Key)
	}
	metricPropertyResponse.Properties = &properties
	metricPropertyResponse.Metrics = &metrics

	jsonData, err := json.Marshal(metricPropertyResponse)
	if err != nil {
		backend.Logger.Error("Unable to encode MetricPropertyTagResponse", "error", err)
		rw.WriteHeader(http.StatusBadRequest)
		return
	}
	_, err = rw.Write(jsonData)
	if err != nil {
		backend.Logger.Error("Unable to write response", "error", err)
		rw.WriteHeader(http.StatusBadRequest)
		return
	}
	rw.WriteHeader(http.StatusOK)
}
