import {MetricsPanelCtrl} from 'grafana/app/plugins/sdk';
import './css/main.css';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';
import _ from "lodash";
import {getStyle, Modes, TIME_WINDOW} from "./util";
import {DataCtrl, LegendFormat} from "./controller/dataCtrl";
import MappingCtrl from "./controller/mappingCtrl";
import {GlobalVar} from "./controller/globalVarCtrl";

cytoscape.use(cola);
cytoscape.use(dagre);

export class PanelCtrl extends MetricsPanelCtrl {
    static templateUrl = './view/module.html';
    private cy;
    public graph_height = this.height;

    public dataCtrl = new DataCtrl(this);
    public mappingCtrl = new MappingCtrl(this);

    /** @ngInject */
    constructor($scope, $injector) {
        super($scope, $injector);


        let panelDefaults = {
            datasource: 'Prometheus',
            targets: this.getTargets([
                {expr: 'docker_container_info{stopped=""}', legendFormat: LegendFormat.CONTAINER_INFO},
                {expr: 'node_info{exported_instance=~"localhost:.*"}', legendFormat: LegendFormat.NODE_INFO},
                // For utilization and waste
                {expr: 'delta(cpu_util_container_total[$TIME_WINDOW])', legendFormat: LegendFormat.CPU_UTIL},
                {expr: 'delta(mem_util_container_total[$TIME_WINDOW])', legendFormat: LegendFormat.MEM_UTIL},
                {expr: 'delta(cpu_waste_container_total[$TIME_WINDOW])', legendFormat: LegendFormat.CPU_WASTE},
                {expr: 'delta(mem_waste_container_total[$TIME_WINDOW])', legendFormat: LegendFormat.MEM_WASTE},
                {expr: 'clamp_min(sum(delta(network_container_total[$TIME_WINDOW])) by (src) - sum(delta(bytes_send_total[$TIME_WINDOW])) by (src), 0)',
                    legendFormat: LegendFormat.NETWORK},
                {expr: 'sum(delta(bytes_send_total[$TIME_WINDOW])) by (src, dst)', legendFormat: LegendFormat.EDGES},
                // For computing totals
                {expr: 'sum(cpu_util_container_total) by (src_host)', legendFormat: LegendFormat.SUM_CPU_UTIL},
                {expr: 'sum(mem_util_container_total) by (src_host)', legendFormat: LegendFormat.SUM_MEM_UTIL},
                {expr: 'sum(cpu_waste_container_total) by (src_host)', legendFormat: LegendFormat.SUM_CPU_WASTE},
                {expr: 'sum(mem_waste_container_total) by (src_host)', legendFormat: LegendFormat.SUM_MEM_WASTE},
                {expr: 'sum(clamp_min(sum(network_container_total) by (src, src_host) - sum(bytes_send_total) by (src, src_host), 0)) by (src_host)',
                    legendFormat: LegendFormat.SUM_NETWORK},
            ]),
            ruleMappings: [], // type: Mapping[]
            trafficPriceReduction: 0,
            interval: '1h',
            valueName: 'current',
            mode: Modes.CONTAINERS,
            colorNodeBackground: '#ffffff',
            grouped: true,
            colorEdge: '#9fbfdf',
            colorText: '#d9d9d9',
            colorNodeBorder: '#808080',
            layoutType: 'grid',
            timeWindow: TIME_WINDOW.HOUR,
        };

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

    public getTimes() {
        return TIME_WINDOW;
    }

    onInitEditMode() {
        this.addEditorTab('Container MappingCtrl', 'public/plugins/grafana-container-panel/view/mapping.html', 2);
        this.addEditorTab('Cost prediction', 'public/plugins/grafana-container-panel/view/cost.html', 2);
        this.addEditorTab('Layout Options', 'public/plugins/grafana-container-panel/view/layout.html', 2);
    }

    onDataReceived(dataList) {
        this.dataCtrl.onDataReceived(dataList);
        this.dataCtrl.getGlobalVarCtrl().set(GlobalVar.TIME_WINDOW, this.panel.timeWindow);
    }



    /**
     * Main method for the panel controller. This updates the graph with the new data.
     */
    public updateGraph() {
        // Adjust graph height
        this.adjustGraphHeight();
        this.mappingCtrl.apply();

        const panel = document.getElementById('graph-panel');
        if (!panel) {
            return
        }

        let data = this.dataCtrl.getData(this.panel.mode);
        console.log(data);

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
                elements: data,
                style: getStyle(this.panel),
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

    /**
     * Returns a graph description, based on the current visualization mode.
     */
    public description(): string {
        switch (this.panel.mode) {
            case Modes.NODES:
                return 'The graph presented below shows all the nodes in the system. Additional information is the ' +
                    'cost of running this node for a period of one hour. This price is calculated based on the node ' +
                    'data';
            case Modes.CONTAINERS:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per node (based on its IP). The edges represent the total amount of data that ' +
                    'has been send from a certain container (or group) to another container (or group).';
            case Modes.TRAFFIC:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per node (based on its IP). Each graph-node shows the amount of network traffic that ' +
                    'is going out of the system. The unit of these values are bytes.';
            case Modes.CPU_UTILIZATION:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per node (based on its IP). Each graph-node shows the CPU utilization. The unit of ' +
                    'these values are "core hour".';
            case Modes.MEM_UTILIZATION:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per node (based on its IP). Each graph-node shows the memory utilization. The unit of ' +
                    'these values are bytes.';
            case Modes.COST:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per node (based on its IP). Each graph-node shows the cost based on the CPU and memory ' +
                    'utilization and the external network traffic. The cost prediction is for the given time window. ' +
                    'The unit of these values are USD.';
            case Modes.CPU_WASTE:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per node (based on its IP). Each graph-node shows the CPU waste. The unit of ' +
                    'these values are "core hour".';
            case Modes.MEM_WASTE:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per node (based on its IP). Each graph-node shows the memory waste. The unit of ' +
                    'these values are bytes.';
            case Modes.WASTE_COST:
                return 'The graph presented below shows all the containers that are deployed. The containers are ' +
                    'grouped per node (based on its IP). Each graph-node shows the waste based on the CPU and memory ' +
                    'utilization. The waste prediction is for the given time window. The unit of these values are USD.';
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

    public getDataCtrl(): DataCtrl {
        return this.dataCtrl;
    }
}
