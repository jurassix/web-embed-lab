export WEL_HOME    := $(shell pwd)
export GOPATH      := $(WEL_HOME)/go
export GOSRC       := $(GOPATH)/src
export GOPKG       := $(GOPATH)/pkg
export TZ          := UTC
export ARCH			:= $(shell uname)

SHELL = /bin/bash

.PHONY: all commands services tools fe npm-install sign
all: tools commands services fe

# Infer Go commands based on the pattern wel/commands/<cmd>/main/<cmd>.go
CMD_PKGS := $(subst ./,,$(shell cd $(GOSRC) && find . -type f -regex '.*/wel/commands/[^/]*/main/[^/]*\.go' | awk -F/main/ '{print $$1"/main"}' | uniq))
CMDS     := $(sort $(foreach pkg,$(CMD_PKGS),$(lastword $(subst /, ,$(patsubst %/main,%,$(pkg))))))

# Infer Go services based on the pattern wel/services/<svc>/main/<cmd>.go
SVC_PKGS := $(subst ./,,$(shell cd $(GOSRC) && find . -type f -regex '.*/wel/services/[^/]*/main/[^/]*\.go' | awk -F/main/ '{print $$1"/main"}' | uniq))
SVCS     := $(sort $(foreach pkg,$(SVC_PKGS),$(lastword $(subst /, ,$(patsubst %/main,%,$(pkg))))))

.PHONY: $(CMDS) $(SVCS)

# A recipe for each inferred go main binary.
# $1 is the simple name (e.g. colluder)
# $2 is the package name (e.g. wel/servivces/colluder/main)
define make-go-recipe
.PHONY: $1
$1:
	go build -i -o $(WEL_HOME)/go/bin/$1 -ldflags="$(LDFLAGS)" $2

endef

$(eval $(foreach pkg,$(CMD_PKGS),$(call make-go-recipe,$(lastword $(subst /, ,$(patsubst %/main,%,$(pkg)))),$(pkg))))
$(eval $(foreach pkg,$(SVC_PKGS),$(call make-go-recipe,$(lastword $(subst /, ,$(patsubst %/main,%,$(pkg)))),$(pkg))))

commands: $(CMDS)

services: $(SVCS)

tools:
	go build -o $(WEL_HOME)/go/bin/gorepoman github.com/fullstorydev/gorepoman/main/gorepoman

sign:
ifeq ($(ARCH),Darwin)
	echo "Signing $(bintarget)"
	/usr/bin/codesign --force --deep --sign - "$(bintarget)"
	echo "Signed $(bintarget)"
endif

make npm-install:
	cd fe && npm install

fe:
	cd fe && npm run build

help:
	@echo "This makefile can build the following:"
	@echo "  Commands:"
	@$(foreach c,$(CMDS),echo "    ${c}";)
	@echo "  Services:"
	@$(foreach c,$(SVCS),echo "    ${c}";)

clean:
	rm -rf $(GOPATH)/bin/*
	rm -rf $(GOPKG)/*
	rm -rf ./fe/dist
	rm -rf ./package-dist

