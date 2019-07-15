import {Container} from "../model/container";
import {Node} from "../model/node";
import _ from "lodash";
import {PanelCtrl} from "../panelCtrl";
import {formatCH, formatPrice, formatSize, Modes, setWidth, TIME_WINDOW, verifyEdges} from "../util";
import {GraphNode} from "../model/graphNode";
import {GraphEdge} from "../model/graphEdge";
import {GlobalVar, GlobalVarCtrl} from "./globalVarCtrl";
import {getNodePrice} from "./CostWasteCtrl";

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

    public getData(mode: Modes, grouped: boolean, showEdges: boolean) {
        let nodes: GraphNode[] = [];
        let edges: GraphEdge[] = [];

        if (showEdges) {
            if (grouped) {
                edges = this.getGroupedEdges();
            } else {
                edges = this.getGraphEdges();
            }
        }

        switch (mode) {
            case Modes.NODES: // show the VM's
                nodes = this.nodesToGraph(node =>
                    node.getIp() + '\n'
                    + node.getNumCoresString() + ', ' + formatSize(node.getMemory()) + '\n'
                    + formatPrice(getNodePrice(node, this, this.panelCtrl.panel['timeWindow'])));
                break;
            case Modes.CONTAINERS: // show the containers
                if (grouped) {
                    nodes = this.getGroupedContainers((containers, group) =>
                        group + '\n' + containers.length + ' containers');
                } else {
                    nodes = this.getGraphNodes(container => container.getName());
                }
                break;
            case Modes.TRAFFIC: // show the containers with traffic
                nodes = this.getNodesForGraph(grouped, formatSize, c => c.getNetworkTraffic());
                break;
            case Modes.CPU_UTILIZATION: // show the cpu utilization
                nodes = this.getNodesForGraph(grouped, formatCH,
                    c => c.getCpuUtil() * this.getNode(c.getHostIp()).getNumCores());
                break;
            case Modes.MEM_UTILIZATION: // show the memory utilization
                nodes = this.getNodesForGraph(grouped, formatSize,
                    c => c.getMemUtil() * this.getNode(c.getHostIp()).getMemory());
                break;
            case Modes.COST: // show the cost
                nodes = this.getNodesForGraph(grouped, formatPrice,
                    c => c.getCost(this, this.getNode(c.getHostIp())));
                break;
            case Modes.CPU_WASTE: // show the CPU waste
                nodes = this.getNodesForGraph(grouped, formatCH,
                    c => c.getCpuWaste() * this.getNode(c.getHostIp()).getNumCores());
                break;
            case Modes.MEM_WASTE: // show the memory waste
                nodes = this.getNodesForGraph(grouped, formatSize,
                    c => c.getMemWaste() * this.getNode(c.getHostIp()).getMemory());
                break;
            case Modes.WASTE_COST:
                nodes = this.getNodesForGraph(grouped, formatPrice,
                    c => c.getWaste(this, this.getNode(c.getHostIp())));
                break;
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

    private getNodesForGraph(grouped: boolean, formatF: (value: number) => string, getStatF: (c: Container) => number) {
        if (grouped) {
            return this.getGroupedContainers((containers, group) => {
                let size = containers
                    .map(c => getStatF(c))
                    .map(value => isNaN(value) ? 0 : value)
                    .reduce((a, b) => a + b, 0);
                return group + '\n' + formatF(size);
            });
        } else {
            return this.getGraphNodes(container =>
                container.getName() + '\n' + formatF(getStatF(container)));
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

    private nodesToGraph(getName: (node: Node) => string) {
        return Object.keys(this.nodes)
            .map(hostIp => this.nodes[hostIp])
            .map(node => new GraphNode(node.getIp(), getName(node)));
    }

    /*
     * * * * * * * * * * ADD AND UPDATE * * * * * * * * * *
     */
    private getContainer(hash: string): Container{
        return this.containers[hash];
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

    setTimeWindow(timeWindow: TIME_WINDOW) {
        this.globalVarCtrl.set(GlobalVar.TIME_WINDOW, timeWindow);
    }
}


