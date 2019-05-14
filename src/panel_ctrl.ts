import {MetricsPanelCtrl} from 'grafana/app/plugins/sdk';
import './css/main.css';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import _ from "lodash";
import Mapping from "./mapping";
import {decode, getStyle, Modes, NameImage} from "./util";
import {EdgesCtrl} from "./edges_ctrl";
import {ContainerCtrl} from "./container_ctrl";
import {UtilizationCtrl} from "./utilization_ctrl";
import {HostCtrl} from "./host_ctrl";
import {CostCtrl} from "./cost_ctrl";

cytoscape.use(cola);

export class PanelCtrl extends MetricsPanelCtrl {
    static templateUrl = './partials/module.html';

    public edgesCtrl = new EdgesCtrl();
    public containerCtrl = new ContainerCtrl();
    public utilizationCtrl = new UtilizationCtrl();
    public hostCtrl = new HostCtrl();
    public costCtrl = new CostCtrl();
    private cy;
    private firstRendering = 0;

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
                },
                {
                    "expr": "avg_over_time(rate(container_cpu_usage_seconds_total{id=~\"/docker/.*\", name!=\"dadvisor\"}[15s])[1h:1h])",
                    "format": "time_series",
                    "instant": true,
                    "intervalFactor": 1,
                    "legendFormat": "container_utilization",
                    "refId": "C"
                },
                {
                    "expr": "default_host_price_total",
                    "format": "time_series",
                    "instant": true,
                    "intervalFactor": 1,
                    "refId": "D"
                },
                {
                    "expr": "sum_over_time(avg_over_time(rate(container_cpu_usage_seconds_total{id=~\"/docker/.*\", name!=\"dadvisor\"}[15s])[1y:1h]) [1y:1h])",
                    "format": "time_series",
                    "instant": true,
                    "intervalFactor": 1,
                    "legendFormat": "container_total_util",
                    "refId": "E"
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

    public getNameImage() {
        return NameImage;
    }

    onInitEditMode() {
        this.addEditorTab('Container Mapping', 'public/plugins/grafana-container-panel/partials/mapping.html', 2);
        this.addEditorTab('Cost prediction',   'public/plugins/grafana-container-panel/partials/cost.html', 2);
        this.addEditorTab('Layout Options', 'public/plugins/grafana-container-panel/partials/layout.html', 2);
    }

    onDataReceived(dataList) {
        console.log('On data received');
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
            } else if (dataObj.target === 'container_utilization') {
                this.utilizationCtrl.addOrUpdate(dataObj.labels.id, dataObj.datapoints[0][0]);
            } else if (dataObj.target.startsWith('default_host_price_total')) {
                this.hostCtrl.addOrUpdate(obj);
            } else if (dataObj.target === 'container_total_util'){
                let id = dataObj.labels.id.substr('/docker/'.length);  // filter /docker/
                this.costCtrl.addOrUpdate(id, dataObj.datapoints[0][0]);
            } else {
                console.log('Can not parse dataObj: ');
                console.log(dataObj);
            }
        }
        if (this.firstRendering == 0) {
            this.render();
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

        PanelCtrl.validateData(data);
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
            this.firstRendering = 1;
        }
    };

    private adjustGraphHeight() {
        const header = $('#graph-header');
        this.graph_height = this.height;
        if (header !== undefined && header.height() !== undefined) {
            // @ts-ignore
            this.graph_height = this.height - header.height();
            console.log('Updated graph_height to: ' + this.graph_height);
        }
    }

    private static validateData(data) {
        // Remove an edge if the corresponding node is not found.
        for (let edge of data.edges) {
            let sourceIncluded = false;
            let targetIncluded = false;
            for (let node of data.nodes) {
                if (edge['data']['source'] === node['data']['id']) {
                    sourceIncluded = true;
                }
                if (edge['data']['target'] === node['data']['id']) {
                    targetIncluded = true;
                }
            }
            if (!sourceIncluded || !targetIncluded) {
                data.edges.splice(data.edges.indexOf(edge), 1);
            }
        }
        return undefined;
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
            case Modes.UTILIZATION:
                return {
                    edges: this.edgesCtrl.getList(),
                    nodes: this.containerCtrl.getNodesWithUtilization(this.utilizationCtrl)
                };
            case Modes.COST_PREDICTION:
                return {
                    edges: this.edgesCtrl.getList(),
                    nodes: this.containerCtrl.getNodesWithCost(this.utilizationCtrl, this.hostCtrl)
                };
            case Modes.COST_PREDICTION_GROUPED:
                return {
                    edges: this.containerCtrl.getGroupedEdges(this.edgesCtrl),
                    nodes: this.containerCtrl.getGroupedNodesCost(this.utilizationCtrl, this.hostCtrl)
                };
            case Modes.COST_TOTAL_GROUPED:
                return {
                    edges: this.containerCtrl.getGroupedEdges(this.edgesCtrl),
                    nodes: this.containerCtrl.getGroupedNodesTotalCost(this.costCtrl, this.hostCtrl)
                };
            default:
                console.log('Something went wrong');
                return {};
        }
    }

    /**
     * Returns a graph description, based on the current visualization mode.
     */
    public description() {
        switch (this.panel.mode) {
            case Modes.CONTAINERS:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per host (based on its external IP), and based on the docker images that are used ' +
                    'inside this host. The edges represent the total amount of data that has been send from a ' +
                    'certain container to another container.';
            case Modes.GROUPED:
                return 'The graph presented below groups related containers together. The groups are defined in the ' +
                    'Edit-panel, and can thus be updated to make them more (or less) specific. Using this graph, you ' +
                    'can find out which groups are interacting with each other. This provides a higher hierarchy of ' +
                    'the deployed system.';
            case Modes.UTILIZATION:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per host (based on its external IP). Each node shows the container name, and the ' +
                    'utilization percentage, which is the average in the last hour.';
            case Modes.COST_PREDICTION:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per host (based on its external IP). Each node shows the container name, and a cost ' +
                    'prediction based on the utilization and the host price. The cost prediction is represented per ' +
                    'hour, and formatted in USD.';
            case Modes.COST_PREDICTION_GROUPED:
                return 'The graph presented below groups related containers together. The groups are defined in the ' +
                    'Edit-panel, and can thus be updated to make them more (or less) specific. Using this graph, an ' +
                    'estimation of the cost per group is presented. This graph is based on the previous graph (cost ' +
                    'prediction).';
            case Modes.COST_TOTAL_GROUPED:
                return 'The graph presented below groups related containers together. The groups are defined in the ' +
                    'Edit-panel, and can thus be updated to make them more (or less) specific. This graphs presents ' +
                    'the total amount of costs for running a specific group of containers.';
            default:
                console.log('Something went wrong');
                return '';
        }
    }
}
