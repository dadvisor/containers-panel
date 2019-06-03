import {MetricsPanelCtrl} from 'grafana/app/plugins/sdk';
import './css/main.css';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';
import _ from "lodash";
import Mapping from "./mapping";
import {getStyle, Modes, NameImage, TIME_WINDOW} from "./util";
import {EdgesCtrl} from "./dataControllers/edges_ctrl";
import {ContainerCtrl} from "./dataControllers/container_ctrl";
import {UtilizationCtrl} from "./dataControllers/utilization_ctrl";
import {HostCtrl} from "./dataControllers/host_ctrl";
import {CostCtrl} from "./dataControllers/cost_ctrl";
import {WasteCtrl} from "./dataControllers/waste_ctrl";
import {WasteTotalCtrl} from "./dataControllers/waste_total_ctrl";
import {TRAFFIC_TYPE, TrafficCtrl} from "./dataControllers/traffic_ctrl";

cytoscape.use(cola);
cytoscape.use(dagre);

export class PanelCtrl extends MetricsPanelCtrl {
    static templateUrl = './partials/module.html';

    public edgesCtrl = new EdgesCtrl();
    public containerCtrl = new ContainerCtrl();
    public utilizationCtrl = new UtilizationCtrl();
    public wasteCtrl = new WasteCtrl();
    public wasteTotalCtrl = new WasteTotalCtrl();
    public hostCtrl = new HostCtrl(this);
    public costCtrl = new CostCtrl();
    public trafficCtrl = new TrafficCtrl();
    private cy;

    public mapping: Mapping;
    public graph_height = this.height;

    /** @ngInject */
    constructor($scope, $injector) {
        super($scope, $injector);


        let panelDefaults = {
            datasource: 'Prometheus',
            targets: this.getTargets([
                {expr: "docker_container_info{stopped=\"\"}"},
                {expr: "delta(bytes_send_total[$TIME_WINDOW])", legendFormat: 'bytes_send'},
                {
                    expr: "avg_over_time(rate(container_cpu_usage_seconds_total{id=~\"/docker/.*\", name!=\"dadvisor\"}[1m])[1h:1h])",
                    legendFormat: "container_utilization"
                },
                {expr: "default_host_price_info"},
                {
                    expr: "sum_over_time(avg_over_time(rate(container_cpu_usage_seconds_total{id=~\"/docker/.*\", name!=\"dadvisor\"}[1m])[1h:1h]) [1y:1h])",
                    "legendFormat": "container_total_util"
                },
                {expr: "waste_container"},
                {expr: "waste_container_total"},
                {
                    expr: "delta(container_network_transmit_bytes_total{id=~\"/docker/.*\", name!=\"dadvisor\"}[$TIME_WINDOW])",
                    legendFormat: 'container_transmit'
                },
                {
                    expr: "delta(container_network_receive_bytes_total{id=~\"/docker/.*\", name!=\"dadvisor\"}[$TIME_WINDOW])",
                    legendFormat: 'container_receive'
                },
            ]),
            ruleMappings: [],
            cpuPriceHour: 0.021925,
            gbPriceHour: 0.002938,
            interval: '1m',
            valueName: 'current',
            mode: Modes.CONTAINERS,
            colorNodeBackground: '#ffffff',
            colorEdge: '#9fbfdf',
            colorText: '#d9d9d9',
            colorNodeBorder: '#808080',
            layoutType: 'grid',
            timeWindow: TIME_WINDOW.HOUR,
        };
        this.mapping = new Mapping(this);

        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
        this.events.on('panel-initialized', this.render.bind(this));
        this.events.on('data-received', this.onDataReceived.bind(this));
        this.events.on('render', this.updateGraph.bind(this));

        console.log(panelDefaults.targets);
        _.defaults(this.panel, panelDefaults);
        this.updateGraph();
    }

    public getModes() {
        return Modes;
    }

    public getNameImage() {
        return NameImage;
    }

    public getTimes() {
        return TIME_WINDOW;
    }

    onInitEditMode() {
        this.addEditorTab('Container Mapping', 'public/plugins/grafana-container-panel/partials/mapping.html', 2);
        this.addEditorTab('Cost prediction', 'public/plugins/grafana-container-panel/partials/cost.html', 2);
        this.addEditorTab('Layout Options', 'public/plugins/grafana-container-panel/partials/layout.html', 2);
    }

    onDataReceived(dataList) {
        this.containerCtrl.startUpdate();

        for (let dataObj of dataList) {
            // console.log(dataObj);
            let obj = dataObj.labels;
            if (dataObj.target.startsWith("docker_container_info")) {
                this.containerCtrl.addOrUpdate(obj['hash'], obj, this.mapping);
            } else if (dataObj.target.startsWith("bytes_send")) {
                let newObj = {};
                newObj['source'] = obj['src'].substr('id_'.length);
                newObj['target'] = obj['dst'].substr('id_'.length);
                newObj['bytes'] = dataObj.datapoints[0][0];
                this.edgesCtrl.addOrUpdate(newObj);
            } else if (dataObj.target === 'container_utilization') {
                let id = dataObj.labels.id.substr('/docker/'.length);  // filter /docker/
                this.utilizationCtrl.addOrUpdate(id, dataObj.datapoints[0][0]);
            } else if (dataObj.target.startsWith('default_host_price_info')) {
                this.hostCtrl.addOrUpdate(obj);
            } else if (dataObj.target === 'container_total_util') {
                let id = dataObj.labels.id.substr('/docker/'.length);  // filter /docker/
                this.costCtrl.addOrUpdate(id, dataObj.datapoints[0][0]);
            } else if (dataObj.target.startsWith('waste_container_total')) {
                this.wasteTotalCtrl.addOrUpdate(obj['id'], dataObj.datapoints[0][0]);
            } else if (dataObj.target.startsWith('waste_container')) {
                this.wasteCtrl.addOrUpdate(obj['id'], dataObj.datapoints[0][0]);
            } else if (dataObj.target.startsWith('container_receive')) {
                let id = dataObj.labels.id.substr('/docker/'.length);  // filter /docker/
                this.trafficCtrl.addOrUpdate(id, dataObj.datapoints[0][0], TRAFFIC_TYPE.RECEIVED);
            } else if (dataObj.target.startsWith('container_transmit')) {
                let id = dataObj.labels.id.substr('/docker/'.length);  // filter /docker/
                this.trafficCtrl.addOrUpdate(id, dataObj.datapoints[0][0], TRAFFIC_TYPE.TRANSMITTED);
            } else {
                console.log('Can not parse dataObj: ');
                console.log(dataObj);
            }
        }
        this.containerCtrl.stopUpdate();

        this.computeTotalCostAndWaste();

        this.setDashboardVar('TIME_WINDOW', this.panel.timeWindow);
    }

    private setDashboardVar(varName: string, value: string) {
        const dashboardVar = this.templateSrv.variables.find(v => v.name === varName);
        if (dashboardVar) {
            dashboardVar.current.text = value;
            dashboardVar.current.value = value;
        }
    }

    private computeTotalCostAndWaste() {
        let totalWaste = 0;
        let totalCost = 0;
        for (let container of this.containerCtrl.getList()) {
            totalWaste += this.wasteTotalCtrl.getValue(container['hash']) * this.hostCtrl.getPrice(container['host']);
            totalCost += this.costCtrl.getValue(container['hash']) * this.hostCtrl.getPrice(container['host']);
        }
        this.setDashboardVar('TOTAL_COST', totalCost.toFixed(2));
        this.setDashboardVar('TOTAL_WASTE', totalWaste.toFixed(2));
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
        PanelCtrl.validateData(data);
        console.log(data);
        console.log('- - - - - - - - ');

        let layout = {
            name: this.panel.layoutType,
            padding: 30,
            animate: false,
            nodeSpacing: function (node) {
                return 40;
            },
            avoidOverlap: true,
            fit: true
        };

        if (this.cy !== undefined) {
            this.cy.elements().remove();
            this.cy.add(data);
            this.cy.resize();
            this.cy.layout(layout).run();
            this.cy.style(getStyle(this.panel));
        } else {
            this.cy = cytoscape({
                container: panel,
                style: getStyle(this.panel),
                elements: data,
                layout: layout
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
            if (edge['data']['bytes'] === 0 || !sourceIncluded || !targetIncluded) {
                data.edges.splice(data.edges.indexOf(edge), 1);
            }
        }
    }

    private getData() {
        switch (this.panel.mode) {
            case Modes.CONTAINERS:
                return {
                    edges: this.edgesCtrl.getList(),
                    nodes: this.containerCtrl.getNodes()
                };
            case Modes.CONTAINERS_TRAFFIC:
                return {
                    edges: this.edgesCtrl.getList(),
                    nodes: this.containerCtrl.getNodesWithTraffic(this.trafficCtrl)
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
            case Modes.RELATIVE_UTILIZATION:
                return {
                    edges: this.edgesCtrl.getList(),
                    nodes: this.containerCtrl.getNodesWithRelativeUtilization(this.utilizationCtrl)
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
            case Modes.WASTE:
                return {
                    edges: this.edgesCtrl.getList(),
                    nodes: this.containerCtrl.getNodesWithWaste(this.wasteCtrl),
                };
            case Modes.RELATIVE_WASTE:
                return {
                    edges: this.edgesCtrl.getList(),
                    nodes: this.containerCtrl.getNodesWithRelativeWaste(this.wasteCtrl),
                };
            case Modes.WASTE_PREDICTION:
                return {
                    edges: this.edgesCtrl.getList(),
                    nodes: this.containerCtrl.getNodesWithWastePrediction(this.wasteCtrl, this.hostCtrl),
                };
            case Modes.WASTE_PREDICTION_GROUPED:
                return {
                    edges: this.containerCtrl.getGroupedEdges(this.edgesCtrl),
                    nodes: this.containerCtrl.getGroupedNodesWastePrediction(this.wasteCtrl, this.hostCtrl)
                };
            case Modes.WASTE_TOTAL_GROUPED:
                return {
                    edges: this.containerCtrl.getGroupedEdges(this.edgesCtrl),
                    nodes: this.containerCtrl.getGroupedNodesTotalWaste(this.wasteTotalCtrl, this.hostCtrl)
                };
            default:
                console.log('Something went wrong');
                return {};
        }
    }

    /**
     * Returns a graph description, based on the current visualization mode.
     */
    public description(): string {
        switch (this.panel.mode) {
            case Modes.CONTAINERS:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per host (based on its external IP), and based on the docker images that are used ' +
                    'inside this host. The edges represent the total amount of data that has been send from a ' +
                    'certain container to another container.';
            case Modes.CONTAINERS_TRAFFIC:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per host (based on its external IP), and based on the docker images that are used ' +
                    'inside this host. The edges represent the total amount of data that has been send from a ' +
                    'certain container to another container. Each node also shows the total amount of data that ' +
                    'this container has received within the time frame set above.';
            case Modes.GROUPED:
                return 'The graph presented below groups related containers together. The groups are defined in the ' +
                    'Edit-panel, and can thus be updated to make them more (or less) specific. Using this graph, you ' +
                    'can find out which groups are interacting with each other. This provides a higher hierarchy of ' +
                    'the deployed system.';
            case Modes.UTILIZATION:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per host (based on its external IP). Each node shows the container name, and the ' +
                    'utilization percentage, which is the average over the last hour.';
            case Modes.RELATIVE_UTILIZATION:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per host (based on its external IP). Each node shows the container name, and the ' +
                    'utilization percentage, which is relative to its host.';
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
                    'the total amount of costs of running a specific group of containers.';
            case Modes.WASTE:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per host (based on its external IP). Each node shows the container name, and the ' +
                    'waste percentage, which is the average over the last hour.';
            case Modes.RELATIVE_WASTE:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per host (based on its external IP). Each node shows the container name, and the ' +
                    'waste percentage, which is based on the utilization percentage.';
            case Modes.WASTE_PREDICTION:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per host (based on its external IP). Each node shows the container name, and a ' +
                    'prediction of the amount of money that is wasted on the host (related to the container).';
            case Modes.WASTE_PREDICTION_GROUPED:
                return 'The graph presented below groups related containers together. The groups are defined in the ' +
                    'Edit-panel, and can thus be updated to make them more (or less) specific. Using this graph, an ' +
                    'estimation of the waste per group is presented. This graph is based on the previous graph ' +
                    '(waste prediction).';
            case Modes.WASTE_TOTAL_GROUPED:
                return 'The graph presented below groups related containers together. The groups are defined in the ' +
                    'Edit-panel, and can thus be updated to make them more (or less) specific. This graphs presents ' +
                    'the total amount of waste of running a specific group of containers.';
            default:
                console.log('Something went wrong');
                return '';
        }
    }

    private getTargets(queries: Object[]) {
        let alphabet = new Array(queries.length).fill(1).map(
            (_, i) => String.fromCharCode(i + 'A'.charCodeAt(0)));

        return queries.map((obj, i) => {
            return _.assign({}, obj, {
                "format": "time_series",
                "instant": true,
                "intervalFactor": 1,
                "refId": alphabet[i]
            })
        });
    }
}
