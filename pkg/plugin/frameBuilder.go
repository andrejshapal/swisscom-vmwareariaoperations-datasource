package plugin

import (
	"encoding/json"
	"fmt"
	"math"
	"sort"
	"swisscom-vmwareariaoperations-datasource/pkg/api"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/oapi-codegen/runtime/types"
)

func generatePropertiesForMetric(ts *[]time.Time, data *[]float64, properties *[]api.InternalResourcePropertyContents, resourceId types.UUID) *map[string]timeData {
	labelToTimestampsMap := make(map[string]timeData)
	if properties != nil {
		// First, filter properties relevant for the given resourceId to minimize iterations
		relevantProperties := make([]api.InternalResourcePropertyContents, 0)
		for _, property := range *properties {
			if property.ResourceId == resourceId {
				relevantProperties = append(relevantProperties, property)
			}
		}
		backend.Logger.Info("relevantProperties", relevantProperties)

		// Create a map to efficiently track labels at specific times
		labelsAtTime := make(map[int64]map[string]string)
		for _, property := range relevantProperties {
			for _, p := range property.PropertyContents.PropertyContent {
				if len(p.Timestamps) == 1 {
					newValues := *p.Values
					newValues = append(newValues, newValues[0])
					newTs := p.Timestamps
					newTs = append(newTs, math.MaxInt64)
					p.Values = &newValues
					p.Timestamps = newTs
				}
				values := *p.Values
				for pk, pt := range p.Timestamps {
					if labelsAtTime[pt] == nil {
						labelsAtTime[pt] = make(map[string]string)
					}
					labelsAtTime[pt][p.StatKey] = values[pk]
				}
			}
		}

		// We need to make sure our list of timestamps is sorted
		var sortedKeys []int64
		for key := range labelsAtTime {
			sortedKeys = append(sortedKeys, key)
		}
		sort.Slice(sortedKeys, func(i, j int) bool { return sortedKeys[i] < sortedKeys[j] })

		backend.Logger.Info("labelsAtTime", labelsAtTime)
		// Populate the propertyMap using the precomputed labelsAtTime map
		for mk, mt := range *ts {
			matchingLabels := make(map[string]string)
			// We can't use range here as it not guarantee order
			for i := 0; i < len(sortedKeys); i++ {
				pt := sortedKeys[i]
				if mt.UnixMilli() <= pt {
					matchingLabels = labelsAtTime[pt]
					break
				}
			}

			if matchingLabels != nil {
				// JSON marshal the labels map to use it as a key
				labelBytes, err := json.Marshal(matchingLabels)
				if err != nil {
					continue
				}
				labelKey := string(labelBytes)

				td, exists := labelToTimestampsMap[labelKey]
				if !exists {
					td = timeData{}
				}

				td.Timestamp = append(td.Timestamp, mt)
				td.Data = append(td.Data, (*data)[mk])
				labelToTimestampsMap[labelKey] = td
			}
		}
	}

	if len(labelToTimestampsMap) == 0 {
		matchingLabels := make(map[string]string)
		labelBytes, _ := json.Marshal(matchingLabels)
		labelKey := string(labelBytes)
		labelToTimestampsMap[labelKey] = timeData{*ts, *data}
	}

	return &labelToTimestampsMap
}

func timeSeriesFrame(metrics *[]api.StatsOfResource, resourceIds map[types.UUID]*api.ResourceKey, properties *[]api.InternalResourcePropertyContents, q queryModel) *backend.DataResponse {
	var response backend.DataResponse

	// create data frame response.
	// For an overview on data frames and how grafana handles them:
	// https://grafana.com/developers/plugin-tools/introduction/data-frames

	for _, stats := range *metrics {
		backend.Logger.Debug("Checking", "resourceId", stats.ResourceId)
		if stats.StatList != nil {
			for _, stat := range *stats.StatList.Stat {
				resource := make([]string, len(*stat.Data))
				for i := range resource {
					resource[i] = stats.ResourceId.String()
				}
				ts := make([]time.Time, len(stat.Timestamps))
				for i := range resource {
					ts[i] = time.UnixMilli(stat.Timestamps[i])
				}
				meta := resourceIds[*stats.ResourceId]
				propertiesBuckets := generatePropertiesForMetric(&ts, stat.Data, properties, *stats.ResourceId)
				for property, bucket := range *propertiesBuckets {
					var propertyLabels map[string]string
					err := json.Unmarshal([]byte(property), &propertyLabels)
					if err != nil {
						continue
					}
					var tags []Tags
					backend.Logger.Error("WHAT", "__name__", stat.StatKey.Key)
					backend.Logger.Error("WHAT", "adapterKind", meta.AdapterKindKey)
					backend.Logger.Error("WHAT", "resourceKind", meta.ResourceKindKey)
					backend.Logger.Error("WHAT", "resourceId", stats.ResourceId.String())
					backend.Logger.Error("WHAT", "resourceName", meta.Name)

					labels := data.Labels{"__name__": stat.StatKey.Key, "adapterKind": meta.AdapterKindKey, "resourceKind": meta.ResourceKindKey, "resourceId": stats.ResourceId.String(), "resourceName": meta.Name}
					for k, v := range propertyLabels {
						if k != tagProperty {
							labels[k] = v
						} else {
							if v != "none" {
								err := json.Unmarshal([]byte(v), &tags)

								if err != nil {
									backend.Logger.Error("Was not able to parse tags", "tags", v, "error", err.Error())
									continue
								}
								for _, tag := range tags {
									labels[fmt.Sprintf("tag|%s", tag.Name)] = tag.Value
								}
							}
						}
					}
					if filter(q.BuilderOptions.CustomFilters, meta.Name, tags) {
						frame := data.NewFrame("",
							data.NewField("time", nil, bucket.Timestamp),
							data.NewField(stat.StatKey.Key, labels, bucket.Data),
						).SetMeta(&data.FrameMeta{
							Type:        data.FrameTypeTimeSeriesMulti,
							TypeVersion: data.FrameTypeVersion{0, 1},
							Custom:      CustomMeta{ResultType: "matrix"},
						})
						response.Frames = append(response.Frames, frame)
					}
				}
			}
		} else {
			backend.Logger.Debug("No metrics specified in metric stats", "resourceId", stats.ResourceId)
		}
	}
	return &response
}

func tableFrame(metrics *[]api.StatsOfResource, resourceIds map[types.UUID]*api.ResourceKey, properties *[]api.InternalResourcePropertyContents, q queryModel) *backend.DataResponse {
	var response backend.DataResponse

	// create data frame response.
	// For an overview on data frames and how grafana handles them:
	// https://grafana.com/developers/plugin-tools/introduction/data-frames

	for _, stats := range *metrics {
		backend.Logger.Debug("Checking", "resourceId", stats.ResourceId)
		if stats.StatList != nil {
			meta := resourceIds[*stats.ResourceId]
			for _, stat := range *stats.StatList.Stat {
				resource := make([]string, len(*stat.Data))
				for i := range resource {
					resource[i] = stats.ResourceId.String()
				}
				ts := make([]time.Time, len(stat.Timestamps))
				for i := range resource {
					ts[i] = time.UnixMilli(stat.Timestamps[i])
				}
				propertiesBuckets := generatePropertiesForMetric(&ts, stat.Data, properties, *stats.ResourceId)
				backend.Logger.Debug("propertiesBuckets", propertiesBuckets)
				for property, bucket := range *propertiesBuckets {
					var propertyLabels map[string]string
					err := json.Unmarshal([]byte(property), &propertyLabels)
					if err != nil {
						continue
					}
					metric := make([]string, len(bucket.Data))
					adapterKind := make([]string, len(bucket.Data))
					resourceKind := make([]string, len(bucket.Data))
					resourceId := make([]string, len(bucket.Data))
					resourceName := make([]string, len(bucket.Data))
					for i := range bucket.Data {
						metric[i] = stat.StatKey.Key
						adapterKind[i] = meta.AdapterKindKey
						resourceKind[i] = meta.ResourceKindKey
						resourceId[i] = stats.ResourceId.String()
						resourceName[i] = meta.Name
					}
					var tags []Tags
					frame := data.NewFrame("",
						data.NewField("time", nil, bucket.Timestamp),
						data.NewField("__name__", nil, metric),
						data.NewField("adapterKind", nil, adapterKind),
						data.NewField("resourceKind", nil, resourceKind),
						data.NewField("resourceId", nil, resourceId),
						data.NewField("resourceName", nil, resourceName),
						data.NewField("Value", nil, bucket.Data),
					)
					for k, v := range propertyLabels {
						if k != tagProperty {
							d := make([]string, len(bucket.Data))
							for i := range bucket.Data {
								d[i] = v
							}
							frame.Fields = append(frame.Fields, data.NewField(k, nil, d))
						} else {
							if v != "none" {
								err := json.Unmarshal([]byte(v), &tags)

								if err != nil {
									backend.Logger.Error("Was not able to parse tags", "tags", v, "error", err.Error())
									continue
								}
								for _, tag := range tags {
									d := make([]string, len(bucket.Data))
									for i := range bucket.Data {
										d[i] = tag.Value
									}
									frame.Fields = append(frame.Fields, data.NewField(fmt.Sprintf("tag|%s", tag.Name), nil, d))
								}
							}
						}
					}
					if filter(q.BuilderOptions.CustomFilters, meta.Name, tags) {
						frame.SetMeta(&data.FrameMeta{
							Type:        data.FrameTypeTimeSeriesMulti,
							TypeVersion: data.FrameTypeVersion{0, 1},
						})
						response.Frames = append(response.Frames, frame)
					}
				}
			}
		} else {
			backend.Logger.Debug("No metrics specified in metric stats", "resourceId", stats.ResourceId)
		}
	}
	return &response
}
