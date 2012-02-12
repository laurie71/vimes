shell = bash

mandocs = $(shell find docs/man -type f -name '*.md' \
		 	|sed 's|.md||g' \
		 	|sed 's|docs/man/|man/|g')


all: docs

docs: man

man: $(mandocs)

clean:
	@rm -rf man


man/%.1: docs/man/%.1.md
	@mkdir -p man
	@./node_modules/.bin/ronn --roff $< > $@

man/%.2: docs/man/%.2.md
	@mkdir -p man
	@./node_modules/.bin/ronn --roff $< > $@

man/%.3: docs/man/%.3.md
	@mkdir -p man
	@./node_modules/.bin/ronn --roff $< > $@

man/%.4: docs/man/%.4.md
	@mkdir -p man
	@./node_modules/.bin/ronn --roff $< > $@

man/%.5: docs/man/%.5.md
	@mkdir -p man
	@./node_modules/.bin/ronn --roff $< > $@

man/%.6: docs/man/%.6.md
	@mkdir -p man
	@./node_modules/.bin/ronn --roff $< > $@


.PHONY: all docs man