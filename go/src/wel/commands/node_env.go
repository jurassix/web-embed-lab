package commands

import (
	"os"
)

// Look for a few missing env vars and if missing try to set them from node env vars
func setupNodeEnv() error {
	for index := range EnvVars {
		vars := EnvVars[index]
		_, found := os.LookupEnv(vars.envKey)
		if found {
			continue
		}
		nodeValue, found := os.LookupEnv(NodePrefix + vars.nodeKey)
		if found == false {
			continue
		}
		os.Setenv(vars.envKey, nodeValue)
	}
	return nil
}
