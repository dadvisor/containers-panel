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

    public mapping = new Mapping(this.containerCtrl);
    public graph_height = this.height;

    /** @ngInject */
    constructor($scope, $injector) {
        super($scope, $injector);

        var panelDefaults = {
            datasource: null,
            targets: [{}],
            interval: null,
            valueName: 'current',
            mode: Modes.CONTAINERS,
            colorBackground: null,
        };

        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
        this.events.on('panel-initialized', this.render.bind(this));
        this.events.on('refresh', this.updateGraph.bind(this));
        this.events.on('data-received', this.onDataReceived.bind(this));
        this.events.on('data-error', this.onDataError.bind(this));
        this.events.on('data-snapshot-load', this.onDataReceived.bind(this));

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
        this.containerCtrl.clear();
        this.edgesCtrl.clear();
        for (let dataObj of dataList) {
            let obj = decode(dataObj.target);
            if (dataObj.target.startsWith("docker_container")) {
                obj['group'] = obj['names'];
                this.containerCtrl.add(obj);
            } else if (dataObj.target.startsWith("bytes_send_total")) {
                let newObj = {};
                newObj['source'] = obj['src'].substr(3);
                newObj['target'] = obj['dst'].substr(3);
                newObj['bytes'] = dataObj.datapoints[0][0];
                this.edgesCtrl.add(newObj);
            }
        }
        this.render()
    }

    onDataError() {
        console.log("onDataError");
        this.render();
    }

    updateGraph() {
        // Adjust graph height
        let header = $('#graph-header');

        this.graph_height = this.height;
        if (header !== undefined) {
            if (header.height() !== undefined) {
                // @ts-ignore
                this.graph_height = this.height - header.height();
            }
        }

        const panel = document.getElementById('graph-panel');
        if (!panel) {
            return
        }

        let data = {
            edges: this.edgesCtrl.getList(),
            nodes: this.containerCtrl.getNodes()
        };

        if (this.cy !== undefined) {
            // TODO: if height changed

            // TODO: if data changed

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
        } else {
            this.cy = cytoscape({
                container: panel,
                style: getStyle(this.panel),
                elements: data,
            });
        }
    };
}
