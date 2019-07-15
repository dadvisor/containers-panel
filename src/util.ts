import {GraphEdge} from "./model/graphEdge";
import {GraphNode} from "./model/graphNode";

export enum Modes {
    NODES = 'Nodes',
    CONTAINERS = 'Containers',
    TRAFFIC = 'Containers with traffic',
    CPU_UTILIZATION = 'CPU Utilization',
    MEM_UTILIZATION = 'Memory Utilization',
    COST = 'Cost',
    CPU_WASTE = 'CPU Waste distribution',
    MEM_WASTE = 'Memory Waste distribution',
    WASTE_COST = 'Waste',
}

export enum TIME_WINDOW {
    TEN_MIN = '10m',
    HOUR = '1h',
    DAY = '1d',
    YEAR = '1y',
}

export function setWidth(edges: GraphEdge[]) {
    const max_width = Math.max(...edges.map(r => r.bytes));
    for (let edge of edges) {
        let ratio = 10 * edge['bytes'] / max_width;
        edge.setWidth(Math.max(ratio, 1));
    }
}

/**
 * Check that all edges have a correct source and target label.
 */
export function verifyEdges(edges: GraphEdge[], nodes: GraphNode[]) {
    let labels = nodes.map(node => node.id);
    return edges.filter(edge => labels.includes(edge.source) && labels.includes(edge.target) && edge.bytes > 0);
}

export function formatSize(bytes: number): string {
    let sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    let i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export function formatPrice(price: any): string {
    if (price < 0.001){
        return '< $0.001'
    }
    return '$' + price.toFixed(3);
}

export function formatCH(value: any): string{
    let precision = 0;
    if (value < 0.001){
        return '< 0.0001 CH'
    } else if (value < 0.01){
        precision = 4;
    } else if (value < 0.1){
        precision = 3;
    } else if (value < 1){
        precision = 2;
    } else if (value < 100){
        precision = 1;
    }
    return value.toFixed(precision) + ' CH';
}

export function getStyle(panel) {
    return [
        {
            selector: 'node',
            css: {
                'content': 'data(name)',
                'text-valign': 'center',
                'text-halign': 'center',
                'shape': 'rectangle',
                'border-width': '2px',
                'border-color': panel.colorNodeBorder,
                'background-color': panel.colorNodeBackground,
                'background-opacity': '0.3',
                'padding-top': '10px',
                'padding-left': '10px',
                'padding-bottom': '10px',
                'padding-right': '10px',
                'text-wrap': 'wrap',
                'compound-sizing-wrt-labels': 'include',
                'width': 'label',
            }
        },
        {
            selector: '$node > node',
            css: {
                'compound-sizing-wrt-labels': 'include',
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
                'line-color': panel.colorEdge,
                'target-arrow-color': panel.colorEdge,
                "text-background-shape": "rectangle",
                "text-background-color": "#888",
                'label': 'data(label)',
            }
        },
        {
            selector: 'label',
            css: {
                'color': panel.colorText,
            }
        }
    ];
}