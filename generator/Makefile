.PHONY: build
build:
	yarn run tsc

.PHONY: generate
generate: build
	yarn node --enable-source-maps dist/index.js

.PHONY: clean
clean:
	rm -rf dist