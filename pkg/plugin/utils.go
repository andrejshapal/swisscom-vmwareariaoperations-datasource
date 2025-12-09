package plugin

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func testString(operand string, value string, pattern string) bool {
	switch operand {
	case "=":
		return value == pattern
	case "!=":
		return value != pattern
	case "=~":
		{
			r, _ := regexp.Compile(pattern)
			return r.MatchString(value)
		}
	case "!~":
		{
			r, _ := regexp.Compile(pattern)
			return !r.MatchString(value)
		}
	}
	return true
}

func filter(cf []CustomFilters, resourceName string, tags []Tags) bool {
	byName := true
	byTag := true
	skipName := true
	skipTag := true
	if cf == nil {
		return true
	}
	for _, rule := range cf {
		if rule.Operand == "" || rule.Type == "" || rule.Value == "" {
			backend.Logger.Warn("Wrong filtering rule, one of the fields is empty", "operand", rule.Operand, "type", rule.Type, "value", rule.Value)
			continue
		}
		if rule.Operand == "=~" || rule.Operand == "!~" {
			_, err := regexp.Compile(rule.Value)
			if err != nil {
				backend.Logger.Warn("Wrong filtering rule, wrong regexp", "error", err.Error(), "operand", rule.Operand, "type", rule.Type, "value", rule.Value)
				continue
			}
		}
		backend.Logger.Debug("Applying filter to results", "operand", rule.Operand, "type", rule.Type, "value", rule.Value)
		switch {
		case rule.Type == "resourceName":
			skipName = false
			byName = byName && testString(rule.Operand, resourceName, rule.Value)
		case strings.HasPrefix(rule.Type, "tag|"):
			skipTag = false
			{
				for _, tag := range tags {
					backend.Logger.Debug("Applying filter to tags", "existingTag", fmt.Sprintf("tag|%s", tag.Name), "ruleTag", rule.Type)
					if fmt.Sprintf("tag|%s", tag.Name) == rule.Type {
						byTag = byTag && testString(rule.Operand, tag.Value, rule.Value)
					}
					backend.Logger.Debug("Local result of filter to tags", "byTag", byTag)
				}
				backend.Logger.Debug("Total result of filter to tags", "byTag", byTag)
			}
		}
	}
	backend.Logger.Debug("Final filtering decision", "resourceName", resourceName, "byTag", byTag, "byName", byName, "skipName", skipName, "skipTag", skipTag, "decision", (byName || skipName) && (byTag || skipTag))
	return (byName || skipName) && (byTag || skipTag)
}
