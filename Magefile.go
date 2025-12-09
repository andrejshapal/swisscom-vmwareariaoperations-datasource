//go:build mage
// +build mage

package swisscom_vmwareariaoperations_datasource

import (
	"os"

	// mage:import
	build "github.com/grafana/grafana-plugin-sdk-go/build"
	"github.com/magefile/mage/sh"
)

// Default configures the default target.
var Default = build.BuildAll

func Api() error {
	return sh.Run("go", "generate", "./pkg/api")
}

func ServerMock() error {
	os.Setenv("GOOS", "linux")
	os.Setenv("GOARCH", "arm")
	return sh.Run("go", "build", "-o", "dist/server_mock", "-ldflags", "-w -s -extldflags \"-static\"", "./pkg/test")
}
