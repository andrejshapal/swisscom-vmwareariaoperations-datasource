package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"swisscom-vmwareariaoperations-datasource/pkg/api"
	"swisscom-vmwareariaoperations-datasource/pkg/models"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
)

// Make sure Datasource implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. In this example datasource instance implements backend.QueryDataHandler,
// backend.CheckHealthHandler interfaces. Plugin should not implement all these
// interfaces - only those which are required for a particular task.
var (
	_ backend.QueryDataHandler      = (*Datasource)(nil)
	_ backend.CheckHealthHandler    = (*Datasource)(nil)
	_ instancemgmt.InstanceDisposer = (*Datasource)(nil)
)

// AriaDatasource creates a new datasource instance.
func AriaDatasource(_ context.Context, _ backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	datasource := &Datasource{}
	mux := http.NewServeMux()
	mux.HandleFunc("/adapterkinds", datasource.fetchAdapterKinds)
	mux.HandleFunc("/metricpropertytag", datasource.fetchMetricsProperties)

	datasource.resourceHandler = httpadapter.New(mux)
	return datasource, nil
}

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type Datasource struct {
	resourceHandler backend.CallResourceHandler
	ariaClient      *api.ClientWithResponses
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewSampleDatasource factory function.
func (d *Datasource) Dispose() {
	// Clean up datasource instance resources.
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (d *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	// create response struct
	response := backend.NewQueryDataResponse()

	// Before starting query making sure client exists
	if d.ariaClient == nil {
		err := d.createClient(&req.PluginContext)
		if err != nil {
			return response, err
		}
	}

	// loop over queries and execute them individually.
	for _, q := range req.Queries {
		res := d.query(ctx, q)

		// save the response in a hashmap
		// based on with RefID as identifier
		response.Responses[q.RefID] = res
	}

	return response, nil
}

func (d *Datasource) query(ctx context.Context, query backend.DataQuery) backend.DataResponse {
	backend.Logger.Debug("Query", "query", query.JSON)

	// Unmarshal the JSON into our queryModel.
	var qm queryModel
	err := json.Unmarshal(query.JSON, &qm)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("json unmarshal: %v", err.Error()))
	}

	// Avoid processing with query if no metrics were selected by user
	if qm.BuilderOptions.Functions.WithMetric == "" {
		backend.Logger.Error("No metrics specified in query")
		return backend.DataResponse{}
	}

	// We need to get resourceIDs to query metrics
	resourceIds, err := d.fetchResources(ctx, qm)
	if err != nil {
		backend.Logger.Error("Unable to get resourceIds", "error", err)
		return backend.DataResponse{}
	}

	// Retrieving metrics for resourceIDs
	metrics, err := d.fetchMetrics(ctx, qm, &resourceIds, query.TimeRange.From, query.TimeRange.To)
	if err != nil {
		backend.Logger.Error("Unable to fetch metrics", "error", err)
		return backend.DataResponse{}
	}
	var properties *[]api.InternalResourcePropertyContents
	// Retrieving properties for resourceIDs
	properties, err = d.fetchProperties(ctx, qm, &resourceIds, query.TimeRange.From, query.TimeRange.To)
	if err != nil {
		backend.Logger.Error("Unable to fetch properties", "error", err)
	}

	// We will return data with labels in case of TimeSeries and instead of labels columns in case of Table
	// Grafana UI automatically detects frames structure and chooses what kind of visualisation to use
	switch qm.BuilderOptions.QueryType {
	case TimeSeries:
		return *timeSeriesFrame(metrics, resourceIds, properties, qm)
	case Table:
		return *tableFrame(metrics, resourceIds, properties, qm)
	default:
		return *timeSeriesFrame(metrics, resourceIds, properties, qm)
	}

}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (d *Datasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	res := &backend.CheckHealthResult{}
	config, err := models.LoadPluginSettings(*req.PluginContext.DataSourceInstanceSettings)

	if err != nil {
		res.Status = backend.HealthStatusError
		res.Message = "Unable to load settings"
		return res, nil
	}

	if config.Secrets.Password == "" {
		res.Status = backend.HealthStatusError
		res.Message = "Password is missing"
		return res, nil
	}

	if config.Host == "" {
		res.Status = backend.HealthStatusError
		res.Message = "Host is missing"
		return res, nil
	}

	if config.Username == "" {
		res.Status = backend.HealthStatusError
		res.Message = "Username is missing"
		return res, nil
	}

	if config.AuthSource == "" {
		res.Status = backend.HealthStatusError
		res.Message = "AuthSource is missing"
		return res, nil
	}

	if d.ariaClient == nil {
		err := d.createClient(&req.PluginContext)
		if err != nil {
			return nil, err
		}
	}
	backend.Logger.Debug("Requesting vROPs version", "url", config.Host, "username", config.Username)
	response, err := d.ariaClient.GetCurrentVersionOfServerUsingGETWithResponse(ctx)
	if err != nil {
		return nil, err
	}
	backend.Logger.Debug("Received vROPs version", "response", response.HTTPResponse.Body)

	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: fmt.Sprintf("Successfull connection to %s", response.JSON200.ReleaseName),
	}, nil
}

func (d *Datasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	// Before starting retrieving resources making sure client exists
	if d.ariaClient == nil {
		err := d.createClient(&req.PluginContext)
		if err != nil {
			return err
		}
	}
	return d.resourceHandler.CallResource(ctx, req, sender)
}

func NewRequestEditor(apiKey *string) func(ctx context.Context, req *http.Request) error {
	return func(ctx context.Context, req *http.Request) error {
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Accept", "application/json")

		if apiKey != nil {
			req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", *apiKey))
		}
		return nil
	}
}

func (d *Datasource) auth(config *models.PluginSettings) error {
	hc := http.Client{}
	headersFn := NewRequestEditor(config.Secrets.Token)
	c, err := api.NewClientWithResponses(config.Host, api.WithHTTPClient(&hc), api.WithRequestEditorFn(headersFn))

	if err != nil {
		return err
	}
	backend.Logger.Debug("Getting token", "url", config.Host, "username", config.Username)
	resp, err := c.AcquireTokenUsingPOSTWithResponse(context.TODO(), api.UsernamePassword{AuthSource: &config.AuthSource, Username: config.Username, Password: config.Secrets.Password})
	if err != nil {
		backend.Logger.Debug("Failed to get token", "error", err)
		return err
	}
	if resp.StatusCode() != http.StatusOK {
		backend.Logger.Error("Expected HTTP 200", "StatusCode", resp.StatusCode(), "error", string(resp.Body))
	}
	if resp.JSON200 != nil && resp.JSON200.Token != "" {
		config.Secrets.Token = &resp.JSON200.Token
		return nil
	} else {
		return fmt.Errorf("failed to authenticate: %s", string(resp.Body))
	}
}

func (d *Datasource) createClient(req *backend.PluginContext) error {
	config, _ := models.LoadPluginSettings(*req.DataSourceInstanceSettings)
	hc := http.Client{}
	if config.Secrets.Token == nil {
		err := d.auth(config)
		if err != nil {
			return fmt.Errorf("unable to authenticate: %s", err)
		}
	}
	c, err := api.NewClientWithResponses(config.Host, api.WithHTTPClient(&hc), api.WithRequestEditorFn(func(ctx context.Context, req *http.Request) error {
		req.Header.Set("Authorization", fmt.Sprintf("OpsToken %s", *config.Secrets.Token))
		req.Header.Set("content-type", "application/json")
		req.Header.Set("accept", "application/json")
		return nil
	}))
	if err != nil {
		return fmt.Errorf("unable to create client: %s", err)
	}
	d.ariaClient = c
	return nil
}
