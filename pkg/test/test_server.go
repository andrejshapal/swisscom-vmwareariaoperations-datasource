package main

import (
	_ "embed"
	"fmt"
	"io"
	"net/http"
)

//go:embed adapters_kinds.json
var adaptersKinds []byte

//go:embed acquire_token.json
var acquireToken []byte

//go:embed version_current.json
var versionCurrent []byte

//go:embed resource.json
var resource []byte

//go:embed stats.json
var stats []byte

//go:embed metrics.json
var metrics []byte

//go:embed properties.json
var properties []byte

func printReqData(r *http.Request) {
	fmt.Printf("Method: %s\n", r.Method)

	// Print the request URL
	fmt.Printf("URL: %s\n", r.URL.String())

	// Print the request headers
	fmt.Println("Headers:")
	for name, values := range r.Header {
		for _, value := range values {
			fmt.Printf("%s: %s\n", name, value)
		}
	}

	// Read and print the request body
	bodyBytes, _ := io.ReadAll(r.Body)
	fmt.Println("Body:")
	fmt.Println(string(bodyBytes))
}

func main() {
	http.HandleFunc(""+
		"", func(w http.ResponseWriter, r *http.Request) {
		printReqData(r)
		w.Header().Set("Content-Type", "application/json")
		_, err := w.Write(acquireToken)
		if err != nil {
			fmt.Println(err)
		}
	})

	http.HandleFunc("/api/versions/current", func(w http.ResponseWriter, r *http.Request) {

		w.Header().Set("Content-Type", "application/json")

		_, err := w.Write(versionCurrent)
		if err != nil {
			fmt.Println(err)
		}
	})

	http.HandleFunc("/api/adapterkinds", func(w http.ResponseWriter, r *http.Request) {

		w.Header().Set("Content-Type", "application/json")

		_, err := w.Write(adaptersKinds)
		if err != nil {
			fmt.Println(err)
		}
	})

	http.HandleFunc("/api/resources", func(w http.ResponseWriter, r *http.Request) {
		printReqData(r)
		w.Header().Set("Content-Type", "application/json")
		_, err := w.Write(resource)
		if err != nil {
			fmt.Println(err)
		}
	})
	http.HandleFunc("/api/resources/query", func(w http.ResponseWriter, r *http.Request) {
		printReqData(r)
		w.Header().Set("Content-Type", "application/json")
		_, err := w.Write(resource)
		if err != nil {
			fmt.Println(err)
		}
	})

	http.HandleFunc("/api/adapterkinds/", func(w http.ResponseWriter, r *http.Request) {
		printReqData(r)
		w.Header().Set("Content-Type", "application/json")

		_, err := w.Write(stats)
		if err != nil {
			fmt.Println(err)
		}
	})

	http.HandleFunc("/api/resources/stats/query", func(w http.ResponseWriter, r *http.Request) {
		printReqData(r)
		w.Header().Set("Content-Type", "application/json")

		_, err := w.Write(metrics)
		if err != nil {
			fmt.Println(err)
		}
	})

	http.HandleFunc("/internal/resources/properties/query", func(w http.ResponseWriter, r *http.Request) {
		printReqData(r)
		w.Header().Set("Content-Type", "application/json")
		_, err := w.Write(properties)
		if err != nil {
			fmt.Println(err)
		}
	})

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println(r.Method, r.URL.Path)
	})

	err := http.ListenAndServe(":6969", nil)
	if err != nil {
		fmt.Println(err)
	}
}
