package runner

type ProbeResult struct {
	Passed bool `json:"passed"`
}

type ProbeResults map[string]ProbeResult

func (probeResults ProbeResults) Passed() bool {
	for _, probeResult := range probeResults {
		if probeResult.Passed == false {
			return false
		}
	}
	return true
}
