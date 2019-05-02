import {MetricsPanelCtrl} from 'grafana/app/plugins/sdk';
import './css/main.css';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import _ from "lodash";
import Mapping from "./mapping";
import {decode, getStyle, Modes, NameID} from "./util";
import {EdgesCtrl} from "./edges_ctrl";
import {ContainerCtrl} from "./container_ctrl";

cytoscape.use(cola);

export class PanelCtrl extends MetricsPanelCtrl {
    static templateUrl = './partials/module.html';

    public edgesCtrl = new EdgesCtrl();
    public containerCtrl = new ContainerCtrl();
    private cy;

    public mapping = new Mapping(this);
    public graph_height = this.height;

    /** @ngInject */
    constructor($scope, $injector) {
        super($scope, $injector);

        let panelDefaults = {
            datasource: 'Prometheus',
            targets: [
                {
                    "expr": "{__name__=~\"docker_container_.*\"}",
                    "format": "time_series",
                    "instant": true,
                    "intervalFactor": 1,
                    "refId": "A"
                },
                {
                    "expr": "{__name__=\"bytes_send_total\"}",
                    "format": "time_series",
                    "instant": true,
                    "intervalFactor": 1,
                    "refId": "B"
                }
            ],
            interval: 'null',
            valueName: 'current',
            mode: Modes.CONTAINERS,
            colorNodeBackground: '#ffffff',
            colorEdge: '#9fbfdf',
            colorText: '#d9d9d9',
            colorNodeBorder: '#808080',
        };

        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
        this.events.on('panel-initialized', this.render.bind(this));
        this.events.on('data-received', this.onDataReceived.bind(this));
        this.events.on('render', this.updateGraph.bind(this));

        _.defaults(this.panel, panelDefaults);
        this.updateGraph();
    }

    public get_modes() {
        return Modes;
    }

    public getNameID() {
        return NameID;
    }

    onInitEditMode() {
        this.addEditorTab('Container Mapping', 'public/plugins/grafana-container-panel/partials/mapping.html', 2);
        this.addEditorTab('Layout Options', 'public/plugins/grafana-container-panel/partials/layout.html', 2);
    }

    onDataReceived(dataList) {
        this.edgesCtrl.clear();
        for (let dataObj of dataList) {
            let obj = decode(dataObj.target);
            if (dataObj.target.startsWith("docker_container")) {
                this.containerCtrl.addOrUpdate(obj);
            } else if (dataObj.target.startsWith("bytes_send_total")) {
                let newObj = {};
                newObj['source'] = obj['src'].substr(3);
                newObj['target'] = obj['dst'].substr(3);
                newObj['bytes'] = dataObj.datapoints[0][0];
                this.edgesCtrl.add(newObj);
            }
        }
    }

    /**
     * Main method for the panel controller. This updates the graph with the new data.
     */
    public updateGraph() {
        // Adjust graph height
        this.adjustGraphHeight();

        const panel = document.getElementById('graph-panel');
        if (!panel) {
            return
        }

        let data = this.getData();
        console.log(data);

        if (this.cy !== undefined) {
            this.cy.elements().remove();
            this.cy.add(data);
            this.cy.resize();
            this.cy.layout({
                name: 'cola',
                animate: false,
                nodeSpacing: function (node) {
                    return 40;
                },
                avoidOverlap: true,
                fit: true
            }).run();

            this.cy.style(getStyle(this.panel));
        } else {
            this.cy = cytoscape({
                container: panel,
                style: getStyle(this.panel),
                elements: data,
                layout: {
                    name: 'cola',
                    animate: false,
                    nodeSpacing: function (node) {
                        return 40;
                    },
                    avoidOverlap: true,
                    fit: true
                }
            });
        }
    };

    private adjustGraphHeight() {
        const header = $('#graph-header');
        this.graph_height = this.height;
        if (header !== undefined && header.height() !== undefined) {
            // @ts-ignore
            this.graph_height = this.height - header.height();
        }
    }

    private getData() {
        switch (this.panel.mode) {
            case Modes.CONTAINERS:
                return {
                    edges: this.edgesCtrl.getList(),
                    nodes: this.containerCtrl.getNodes()
                };
            case Modes.GROUPED:
                return {
                    edges: this.containerCtrl.getGroupedEdges(this.edgesCtrl),
                    nodes: this.containerCtrl.getGroupedNodes()
                };
            default:
                console.log('Something went wrong');
                return {};
        }
    }
}
