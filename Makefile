MAKEFLAGS += --no-print-directory --silent
SHELL = /usr/bin/env bash

.PHONY: install
install:
	gem install jekyll bundler

.PHONY: serve
serve:
	bundle exec jekyll serve