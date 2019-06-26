import {Container} from "../model/container";
import {Node} from "../model/node";
import _ from "lodash";
import {PanelCtrl} from "../panelCtrl";
import {bytesToSize, formatPercentage, formatPrice, Modes, setWidth, verifyEdges} from "../util";
import {GraphNode} from "../model/graphNode";
import {GraphEdge} from "../model/graphEdge";
import {GlobalVar, GlobalVarCtrl} from "./globalVarCtrl";
import {getNodePrice, getTotalCost} from "./CostWasteCtrl";

interface NodeMap {
    [ip: string]: Node;
}

interface EdgeMap2 {
    [src: string]: number;
}

interface EdgeMap {
    [dst: string]: EdgeMap2;
}

export interface ContainerMap {
    [hash: string]: Container;
}

export enum LegendFormat {
    CONTAINER_INFO = 'container_info',
    CPU_UTIL = 'cpu_util',
    MEM_UTIL = 'mem_util',
    CPU_WASTE = 'cpu_waste',
    MEM_WASTE = 'mem_waste',
    NODE_INFO = 'node_info',
    NETWORK = 'network',
    EDGES = 'edges',
    SUM_CPU_UTIL = 'sum_cpu_util',
    SUM_MEM_UTIL = 'sum_mem_util',
    SUM_CPU_WASTE = 'sum_cpu_waste',
    SUM_MEM_WASTE = 'sum_mem_waste',
    SUM_NETWORK = 'sum_network',
}

export class DataCtrl {
    private readonly panelCtrl: PanelCtrl;
    private readonly globalVarCtrl: GlobalVarCtrl;

    private nodes: NodeMap = {};
    private edges: EdgeMap = {};
    private containers: ContainerMap = {};

    private cpuPrice: number = 0;
    private memPrice: number = 0;
    private trafficPrice: number = 0;

    constructor(panelCtrl: PanelCtrl) {
        this.panelCtrl = panelCtrl;
        this.globalVarCtrl = new GlobalVarCtrl(this.panelCtrl, this);
    }

    public onDataReceived(dataList: any) {
        // Clear the containers
        Object.keys(this.nodes).forEach(ip => this.nodes[ip].clearContainers());
        this.containers = {};

        for (let dataObj of dataList) {
            let labels = dataObj.labels;
            let node: Node;
            let value = dataObj.datapoints[0][0];
            let container;

            switch (dataObj.target) {
                case LegendFormat.CONTAINER_INFO:
                    node = this.getNode(labels.host);
                    container = node.getContainer(labels.hash, this);
                    container.setImage(labels.image);
                    container.setName(labels.names);
                    break;
                case LegendFormat.NODE_INFO:
                    node = this.getNode(labels.host);
                    node.setSuperNode(labels.is_super_node === "True");
                    node.setMemory(labels.memory);
                    node.setNumCores(labels.num_cores);
                    break;
                case LegendFormat.NETWORK:
                    container = this.getContainer(labels.src);
                    if (container) {
                        container.setNetworkTraffic(value);
                    }
                    break;
                case LegendFormat.CPU_UTIL:
                    container = this.getContainer(labels.src);
                    if (container) {
                        container.setCpuUtil(value);
                    }
                    break;
                case LegendFormat.MEM_UTIL:
                    container = this.getContainer(labels.src);
                    if (container) {
                        container.setMemUtil(value);
                    }
                    break;
                case LegendFormat.CPU_WASTE:
                    container = this.getContainer(labels.src);
                    if (container) {
                        container.setCpuWaste(value);
                    }
                    break;
                case LegendFormat.MEM_WASTE:
                    container = this.getContainer(labels.src);
                    if (container) {
                        container.setMemWaste(value);
                    }
                    break;
                case LegendFormat.EDGES:
                    this.setEdge(labels.src, labels.dst, value);
                    break;
                case LegendFormat.SUM_CPU_UTIL:
                    node = this.getNode(labels.src_host);
                    node.setSumCpuUtil(value);
                    break;
                case LegendFormat.SUM_MEM_UTIL:
                    node = this.getNode(labels.src_host);
                    node.setSumMemUtil(value);
                    break;
                case LegendFormat.SUM_CPU_WASTE:
                    node = this.getNode(labels.src_host);
                    node.setSumCpuWaste(value);
                    break;
                case LegendFormat.SUM_MEM_WASTE:
                    node = this.getNode(labels.src_host);
                    node.setSumMemWaste(value);
                    break;
                case LegendFormat.SUM_NETWORK:
                    node = this.getNode(labels.src_host);
                    node.setSumNetwork(value);
                    break;
                default:
                    console.log(dataObj);
            }
        }
        this.globalVarCtrl.computeVars();
    }

    public getData(mode: Modes) {
        let nodes: GraphNode[] = [];
        let edges: GraphEdge[] = [];

        switch (mode) {
            case Modes.NODES: // show the VM's
                nodes = this.nodesToGraph(node =>
                    node.getIp() + '\n' + formatPrice(getNodePrice(node, this)) + ' per hour');
                edges = this.getHostEdges();
                break;
            case Modes.CONTAINERS: // show the containers
                edges = this.getGraphEdges();
                nodes = this.getGraphNodes(container => container.getName());
                break;
            case Modes.CONTAINERS_TRAFFIC: // show the containers with traffic
                edges = this.getGraphEdges();
                nodes = this.getGraphNodes(container =>
                    container.getName() + '\nOut: ' + bytesToSize(container.getNetworkTraffic()));
                break;
            case Modes.GROUPED: // show the containers grouped
                nodes = this.getGroupedContainers((containers, group) =>
                    group + '\n' + containers.length + ' containers');
                edges = this.getGroupedEdges();
                break;
            case Modes.CPU_UTILIZATION: // show the cpu utilization
                edges = this.getGraphEdges();
                nodes = this.getGraphNodes(container =>
                    container.getName() + '\n' + formatPercentage(container.getCpuUtil()));
                break;
            case Modes.MEM_UTILIZATION: // show the memory utilization
                edges = this.getGraphEdges();
                nodes = this.getGraphNodes(container =>
                    container.getName() + '\n' + formatPercentage(container.getMemUtil()));
                break;
            case Modes.COST: // show the cost
                edges = this.getGraphEdges();
                nodes = this.getGraphNodes(container => container.getName() + '\n' +
                    formatPrice(container.getCost(this, this.getNode(container.getHostIp())))
                );
                break;
            case Modes.COST_GROUPED: // show the cost grouped
                nodes = this.getGroupedContainers((containers, group) => {
                    let price = containers.map(c => getTotalCost(c, this))
                        .reduce((a, b) => a + b, 0);
                    return group + '\n' + formatPrice(price);
                });
                edges = this.getGroupedEdges();
                break;
            case Modes.CPU_WASTE: // show the CPU waste
                edges = this.getGraphEdges();
                nodes = this.getGraphNodes(container =>
                    container.getName() + '\n' + formatPercentage(container.getCpuWaste()));
                break;
            case Modes.MEM_WASTE: // show the memory waste
                edges = this.getGraphEdges();
                nodes = this.getGraphNodes(container =>
                    container.getName() + '\n' + formatPercentage(container.getMemWaste()));
                break;
            case Modes.WASTE_COST:
                edges = this.getGraphEdges();
                nodes = this.getGraphNodes(container => container.getName() + '\n' +
                    formatPrice(container.getWaste(this, this.getNode(container.getHostIp())))
                );
                break;
            case Modes.WASTE_COST_GROUPED:
                nodes = this.getGroupedContainers((containers, group) => {
                    let price = containers.map(c =>
                        c.getWaste(this, this.getNode(c.getHostIp())))
                        .reduce((a, b) => a + b, 0);
                    return group + '\n' + formatPrice(price);
                });
                edges = this.getGroupedEdges();
        }
        edges = verifyEdges(edges, nodes);
        setWidth(edges);
        return {
            nodes: nodes.map(item => {
                return {data: item}
            }),
            edges: edges.map(item => {
                return {data: item}
            }),
        }
    }

    public getContainers(): Container[] {
        return Object.keys(this.containers).map(hash => this.containers[hash]);
    }

    /*
     * * * * * * * * * * GROUPED * * * * * * * * * *
     */
    public getGroupedContainers(getName: (containers: Container[], group: string) => string): GraphNode[] {
        return this.getGroups().map(group => {
            let containers = this.getContainers().filter(c => c.getGroup() === group);
            return new GraphNode(group, getName(containers, group));
        });

    }

    public getGroupedEdges(): GraphEdge[] {
        let edges: EdgeMap = {};

        this.getGraphEdges().forEach(edge => {
            let source = this.getContainer(edge.source);
            let target = this.getContainer(edge.target);
            let sourceGroup;
            let targetGroup;
            if (source) {
                sourceGroup = source.getGroup();
            }
            if (target) {
                targetGroup = target.getGroup();
            }
            if (sourceGroup && targetGroup) {
                if (!edges[sourceGroup]) {
                    edges[sourceGroup] = {}
                }
                if (!edges[sourceGroup][targetGroup]) {
                    edges[sourceGroup][targetGroup] = 0;
                }
                edges[sourceGroup][targetGroup] += edge.bytes;
            }
        });


        return _.flatten(Object.keys(edges)
            .map(src =>
                Object.keys(edges[src])
                    .map(dst => new GraphEdge(src, dst, edges[src][dst]))));
    }

    public getGroups() {
        let groups: string[] = Object.keys(this.containers).map(hash => this.containers[hash].getGroup());
        return groups.filter((item, i, ar) => ar.indexOf(item) === i);
    }

    /*
     * * * * * * * * * * NODES AND EDGES * * * * * * * * * *
     */
    public getGraphNodes(getName: (container: Container) => string): GraphNode[] {
        let nodes = this.getContainers().map(container =>
            new GraphNode(container.getHash(), getName(container), container.getHostIp()));
        return nodes.concat(...this.nodesToGraph(node => node.getIp()));
    }

    public getGraphEdges(): GraphEdge[] {
        return _.flatten(Object.keys(this.edges)
            .map(src =>
                Object.keys(this.edges[src])
                    .map(dst => new GraphEdge(src, dst, this.edges[src][dst]))));
    }

    public getHostEdges(): GraphEdge[] {
        let edges: EdgeMap = {};

        this.getGraphEdges().forEach(edge => {
            let source = this.getContainer(edge.source);
            let target = this.getContainer(edge.target);
            let sourceHost;
            let targetHost;
            if (source) {
                sourceHost = source.getHostIp();
            }
            if (target) {
                targetHost = target.getHostIp();
            }
            if (sourceHost && targetHost) {
                if (!edges[sourceHost]) {
                    edges[sourceHost] = {}
                }
                if (!edges[sourceHost][targetHost]) {
                    edges[sourceHost][targetHost] = 0;
                }
                edges[sourceHost][targetHost] += edge.bytes;
            }
        });

        return _.flatten(Object.keys(edges)
            .map(src =>
                Object.keys(edges[src])
                    .map(dst => new GraphEdge(src, dst, edges[src][dst]))));
    }

    private nodesToGraph(getName: (node: Node) => string) {
        return Object.keys(this.nodes)
            .map(hostIp => this.nodes[hostIp])
            .map(node => new GraphNode(node.getIp(), getName(node)));
    }

    /*
     * * * * * * * * * * ADD AND UPDATE * * * * * * * * * *
     */
    private getContainer(hash: string): Container | undefined {
        return this.containers[hash] || undefined;
    }

    public setContainer(hash: string, container: Container) {
        this.containers[hash] = container;
    }

    getNode(host: string): Node {
        if (!this.nodes[host]) {
            this.nodes[host] = new Node(host);
        }
        return this.nodes[host];
    }

    private setEdge(src: string, dst: string, value: number) {
        if (!this.edges[src]) {
            this.edges[src] = {}
        }
        this.edges[src][dst] = value;
    }

    public getNodes(): Node[] { // used in the view
        return Object.keys(this.nodes).map(ip => this.nodes[ip]);
    }

    public getGlobalVarCtrl(): GlobalVarCtrl {
        return this.globalVarCtrl;
    }

    public getCpuPrice(): number {
        return this.cpuPrice
    }

    public getMemPriceByte(): number {
        return this.memPrice
    }

    public getTrafficPriceByte(): number {
        return this.trafficPrice
    }

    public computePrices() {
        this.cpuPrice = this.globalVarCtrl.get(GlobalVar.CPU_PRICE);
        this.memPrice = this.globalVarCtrl.get(GlobalVar.MEM_PRICE) / Math.pow(2, 30);
        this.trafficPrice = this.globalVarCtrl.get(GlobalVar.TRAFFIC_PRICE) / Math.pow(2, 30);
    }
}


