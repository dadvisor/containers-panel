import {PanelCtrl} from 'grafana/app/plugins/sdk';
import './css/container-panel.css';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

function bytesToSize(bytes: number) {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    let i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
}

export class ContainerCtrl extends PanelCtrl {
    static templateUrl = './partials/module.html';

    /** @ngInject */
    constructor($scope, $injector) {
        super($scope, $injector);
        this.events.on('panel-initialized', this.render.bind(this));
        this.events.on('component-did-mount', this.render.bind(this));
        this.events.on('refresh', this.updateGraph.bind(this));
        this.events.on('data-received', this.onDataReceived.bind(this));
        this.events.on('data-error', this.onDataError.bind(this));
        this.events.on('data-snapshot-load', this.onDataReceived.bind(this));

        this.events.on('render', this.updateGraph.bind(this));

        this.updateGraph();
    }

    onDataReceived(dataList){
        console.log("data received" + dataList);
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

        function add_width(data: JSON) {
            const max_width = Math.max(data['edges'].map(r => r['data']['bytes']));
            console.log(max_width);

            return data;
        }

        $.ajax({
            dataType: "json",
            crossDomain: true,
            url: 'http://localhost:8800/data',
            success: function (data) {
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
            }
        });
    }
}
