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

    onDataReceived(dataList) {
        console.log("data received");

        for (let dataObj of dataList){
            if (dataObj.target.startsWith("container")){
                this.containers.push(ContainerCtrl.decode(dataObj.target));
            } else if (dataObj.target.startsWith("bytes_send")){
                this.edges.push(ContainerCtrl.decode(dataObj.target))
            } else {
                console.log('Cannot parse object');
                console.log(dataObj);
            }
        }
        this.render()
    }

    /**
     * @param str: example string: id_1234{src="dkdkd", dst="dkdkd}
     * @return An object with properties src and dst
     */
    static decode(str: string){
        str = str.substr(str.indexOf('{') - 1);
        console.log(str);
        return JSON.parse(str)
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

        function add_width(data: JSON) {
            const max_width = Math.max(data['edges'].map(r => r['data']['bytes']));
            console.log(max_width);

            return data;
        }

        var f = function (data) {
            cytoscape({
                container: panel,
                style: [
                    {
                        selector: 'node',
                        css: {
                            'content': 'data(name)',
                            'text-valign': 'center',
                            'text-halign': 'center'
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
                            'text-halign': 'center'
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
                    }
                ],

                elements: add_width(data),
                layout: {
                    name: 'dagre',
                    rankDir: 'LR',
                    padding: 50,
                    nodeSep: 40,
                    rankSep: 150,
                    fit: true
                }
            });
        };
        console.log(f);
    }
}
