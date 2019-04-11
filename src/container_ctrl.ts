import {MetricsPanelCtrl} from 'grafana/app/plugins/sdk';
import './css/container-panel.css';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import _ from "lodash";

cytoscape.use(dagre);

function bytesToSize(bytes: number) {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    let i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
}

export class ContainerCtrl extends MetricsPanelCtrl {
    static templateUrl = './partials/module.html';
    private containers: Object[] = [];
    private edges: Object[] = [];

    /** @ngInject */
    constructor($scope, $injector) {
        super($scope, $injector);

        var panelDefaults = {
            legend: {
                show: true, // disable/enable legend
                values: true
            },
            links: [],
            datasource: null,
            targets: [{}],
            interval: null,
            valueName: 'current',
            colorBackground: 'white',
            colorValue: 'white',
        };

        this.events.on('panel-initialized', this.render.bind(this));
        this.events.on('component-did-mount', this.render.bind(this));
        this.events.on('refresh', this.updateGraph.bind(this));
        this.events.on('data-received', this.onDataReceived.bind(this));
        this.events.on('data-error', this.onDataError.bind(this));
        this.events.on('data-snapshot-load', this.onDataReceived.bind(this));

        this.events.on('render', this.updateGraph.bind(this));

        _.defaults(this.panel, panelDefaults);
        _.defaults(this.panel.legend, panelDefaults.legend);
        this.updateGraph();
    }

    /**
     * @param str: example string: id_1234{src="dkdkd", dst="dkdkd}
     * @return An object with properties src and dst
     */
    static decode(str: string) {
        str = str.substr(str.indexOf('{') + 1);
        str = str.substr(0, str.length - 1);

        let obj = {};

        for (let keyValue of str.split(",")) {
            let key = keyValue.substr(0, keyValue.indexOf('='));
            let value = keyValue.substr(keyValue.indexOf('=') + 1);
            value = value.substr(1, value.length - 2);
            obj[key] = value;
        }
        return obj;
    }

    private static add_width(edges: Object[]) {
        const max_width = Math.max(...edges.map(r => r['bytes']));
        for (let edge of edges) {
            edge['width'] = 10.0 * edge['bytes'] / max_width;
        }
        return edges;
    }

    onDataReceived(dataList) {
        for (let dataObj of dataList) {
            let obj = ContainerCtrl.decode(dataObj.target);
            if (dataObj.target.startsWith("container")) {
                this.containers.push(obj);
            } else if (dataObj.target.startsWith("bytes_send_total")) {
                let newObj = {};
                newObj['source'] = obj['src'].substr(3);
                newObj['target'] = obj['dst'].substr(3);
                newObj['bytes'] = dataObj.datapoints[0][0];
                this.edges.push(newObj)
            }
        }
        this.render()
    }

    onDataError() {
        console.log("onDataError");
        this.render();
    }

    updateGraph() {
        const panel = document.getElementById('graph-panel');
        if (!panel) {
            return
        }

        let data = {
            edges: this.get_edges(),
            nodes: this.get_nodes()
        };

        var cy = cytoscape({
            container: panel,
            style: [
                {
                    selector: 'node',
                    css: {
                        'content': 'data(name)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'background-color': '#a6a6a6',
                    }
                },
                {
                    selector: '$node > node',
                    css: {
                        'padding-top': '10px',
                        'padding-left': '10px',
                        'padding-bottom': '10px',
                        'padding-right': '10px',
                        'text-valign': 'top',
                        'text-halign': 'center',
                    }
                },
                {
                    selector: 'edge',
                    css: {
                        'curve-style': 'bezier',
                        'target-arrow-shape': 'triangle',
                        'width': 'data(width)',
                        'label': function (ele) {
                            return bytesToSize(parseInt(ele.data('bytes')));
                        }
                    }
                },
                {
                    selector: 'label',
                    css: {
                        'color': '#f2f2f2',
                    }
                }
            ],

            elements: data,
            layout: {
                name: 'dagre',
                rankDir: 'LR',
                padding: 50,
                nodeSep: 40,
                rankSep: 150,
                fit: true
            }
        });
        console.log(cy.style());
    };

    private get_nodes() {
        let nodes: Object[] = [];

        let hostSet = new Set();
        let imageSet = new Set();
        for (let container of this.containers) {
            hostSet.add(container['host']);
            imageSet.add(container['host'] + '-' + container['image']);
            nodes.push({
                id: container['hash'],
                name: container['names'],
                parent: container['host'] + '-' + container['image']
            });
        }
        hostSet.forEach(host => {
            nodes.push({id: host, name: host});
        });
        imageSet.forEach(image => {
            nodes.push({
                id: image,
                name: image.substr(image.indexOf('-') + 1),
                parent: image.substr(0, image.indexOf('-'))
            });
        });
        return nodes.map(item => {
            return {data: item}
        });
    }

    private get_edges() {
        let edges = ContainerCtrl.add_width(this.edges);
        return edges.map(item => {
            return {data: item}
        });

    }
}
