export enum NameImage {
    NAME = 'Name',
    IMAGE = 'Image'
}

export enum Modes {
    CONTAINERS = 'Containers',
    GROUPED = 'Grouped',
    UTILIZATION = 'Utilization (last hour average)',
    COST_PREDICTION = 'Cost prediction (based on last hour average)',
    COST_PREDICTION_GROUPED = 'Cost prediction grouped',
    COST_TOTAL_GROUPED = 'Total cost grouped',
    WASTE_PREDICTION = 'Waste prediction (based on last hour average)',
}


export function add_width(edges: Object[]) {
    const max_width = Math.max(...edges.map(r => r['bytes']));
    for (let edge of edges) {
        edge['width'] = 10.0 * edge['bytes'] / max_width;
    }
    return edges;
}

/**
 * @param str: example string: id_1234{src="dkdkd", dst="dkdkd} (and possible more key-values)
 * @return An object with properties src and dst (including all key-values)
 */
export function decode(str: string) {
    str = str.substr(str.indexOf('{') + 1);
    str = str.substr(0, str.length - 1);

    let obj = {};

    for (let keyValue of str.split(",")) {
        let key = keyValue.substr(0, keyValue.indexOf('='));
        let value = keyValue.substr(keyValue.indexOf('=') + 1);
        value = value.substr(1, value.length - 2);
        obj[key] = value;
    }
    return obj;
}

export function bytesToSize(bytes: number) {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    let i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
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
                'label': function (ele) {
                    return bytesToSize(parseInt(ele.data('bytes')));
                },
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