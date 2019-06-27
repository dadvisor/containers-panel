# Containers-panel
Custom visualization for the Grafana dashboard.

This visualization can be installed using the following commands:

```
git clone https://github.com/dAdvisor/containers-panel.git /grafana/plugins
sudo service grafana-server restart
```

## Developing
When developing the source code, make sure that docker is installed and running.

Then, open two terminals and the two commands individually:

	make watch

	make run

Use the following commands for developing the source code (inside this folder):

```
docker run -p 3000:3000 -d --name graf --volume $(pwd)/dist:/var/lib/grafana/plugins/containers-panel grafana/grafana
yarn watch
```
Open [http://localhost:3000](http://localhost:3000/)