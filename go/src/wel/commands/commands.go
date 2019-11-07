package commands

import (
	"errors"
	"log"
	"os"

	"github.com/logrusorgru/aurora"
)

var logger = log.New(os.Stdout, "[commands] ", 0)

const NodePrefix = "npm_package_config_"

var FrontEndDistPathVar = "FRONT_END_DIST"
var BrowserstackUrlVar = "BROWSERSTACK_URL"
var BrowserstackUserVar = "BROWSERSTACK_USER"
var BrowserstackAPIKeyVar = "BROWSERSTACK_API_KEY"
var BrowserstackBuildVar = "BROWSERSTACK_BUILD"
var BrowserstackProjectVar = "BROWSERSTACK_PROJECT"
var NgrokAuthTokenVar = "NGROK_AUTH_TOKEN"

var EnvVars = []struct {
	envKey     string
	nodeKey    string
	required   bool
	defaultVal string
}{
	{FrontEndDistPathVar, "frontEndDist", false, "./node_modules/web-embed-lab/static/"},
	{BrowserstackUrlVar, "browserstackUrl", false, "http://hub-cloud.browserstack.com/wd/hub"},
	{BrowserstackAPIKeyVar, "browserstackApiKey", true, ""},
	{BrowserstackUserVar, "browserstackUser", true, ""},
	{BrowserstackBuildVar, "browserstackBuild", false, ""},
	{BrowserstackProjectVar, "browserstackProject", false, ""},
	{NgrokAuthTokenVar, "ngrokAuthToken", true, ""},
}

var DirExistenceVars = []string{
	FrontEndDistPathVar,
}

func SetupEnvironment() error {
	setupDotEnv()
	setupNodeEnv()
	setupDefaultValues()
	return CheckEnvironment()
}

func setupDefaultValues() {
	for _, variable := range EnvVars {
		if variable.defaultVal == "" {
			continue
		}
		envVal, found := os.LookupEnv(variable.envKey)
		if found && len(envVal) != 0 {
			continue
		}
		os.Setenv(variable.envKey, variable.defaultVal)
	}
}

func CheckEnvironment() error {
	for _, variable := range EnvVars {
		if variable.required == false {
			continue
		}
		envVal, found := os.LookupEnv(variable.envKey)
		if found == false || len(envVal) == 0 {
			return errors.New("Required environment variable is missing: " + variable.envKey)
		}
	}

	for _, envKey := range DirExistenceVars {
		if checkDir(os.Getenv(envKey)) != nil {
			logger.Println(aurora.Red("Could not read " + envKey + " directory: " + os.Getenv(envKey)))
			return errors.New("Invalid directory: " + os.Getenv(envKey))
		}
	}

	return nil
}

func checkDir(dirPath string) error {
	pathInfo, err := os.Stat(dirPath)
	if err != nil {
		return err
	}
	if pathInfo.IsDir() == false {
		return errors.New("Not a directory")
	}
	return nil
}

func PrintEnvUsage() {
	logger.Println("Required environment variables:")
	for _, variable := range EnvVars {
		if variable.required == false {
			continue
		}
		envVal, found := os.LookupEnv(variable.envKey)
		if found == false || len(envVal) == 0 {
			logger.Println(aurora.Red("\t" + variable.envKey + ": missing"))
		} else {
			logger.Println("\t" + variable.envKey)
		}
	}
	logger.Println("")

	logger.Println("Optional environment variables:")
	for _, variable := range EnvVars {
		if variable.required {
			continue
		}
		envVal, found := os.LookupEnv(variable.envKey)
		if found == false || len(envVal) == 0 {
			logger.Println("\t" + variable.envKey + ": missing")
		} else {
			logger.Println("\t" + variable.envKey)
		}
	}
	logger.Println("")

	logger.Println("Details here:")
	logger.Println("\thttps://github.com/fullstorydev/web-embed-lab/blob/master/docs/ENVIRONMENT_VARS.md")
}
