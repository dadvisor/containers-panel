run:
	docker run --rm -p 3000:3000 -d --name graf --volume $(shell pwd)/dist:/var/lib/grafana/plugins/containers-panel grafana/grafana
	open http://localhost:3000

watch:
	yarn watch
