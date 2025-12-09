package plugin

import (
	"context"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func TestQueryData(t *testing.T) {
	ds := Datasource{}

	resp, err := ds.QueryData(
		context.Background(),
		&backend.QueryDataRequest{
			Queries: []backend.DataQuery{
				{RefID: "A"},
			},
		},
	)
	if err != nil {
		t.Error(err)
	}

	if len(resp.Responses) != 1 {
		t.Fatal("QueryData must return a response")
	}
}

func TestAuth(t *testing.T) {
	token, err := Auth("http://localhost:6969", "asas", "asssa", "asasas")
	if err != nil {
		t.Fatal(err)
	}
	if *token != "330a3511-46cf-480f-a979-d057c452cccc::e0b29deb-80c8-4657-b62d-a8cb74a815af" {
		t.Fatal("invalid token")
	}
}
