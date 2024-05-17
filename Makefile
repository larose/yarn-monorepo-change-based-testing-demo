ifdef CHANGE_BASED_TEST_SELECTION
  PACKAGE_SELECTION_FLAG := --since
else
  PACKAGE_SELECTION_FLAG := --all
endif

FOR_EACH_CMD := yarn workspaces foreach $(PACKAGE_SELECTION_FLAG) --recursive --topological --exclude generator --exclude root -vv

.PHONY: lint
lint:
	$(FOR_EACH_CMD) exec eslint src

.PHONY: typecheck
typecheck:
	$(FOR_EACH_CMD) exec tsc --noEmit
