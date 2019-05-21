import {add_width} from "./util";
import {UtilizationCtrl} from "./utilization_ctrl";
import {HostCtrl} from "./host_ctrl";
import {CostCtrl} from "./cost_ctrl";
import {WasteCtrl} from "./waste_ctrl";
import Mapping from "./mapping";
import {WasteTotalCtrl} from "./waste_total_ctrl";

export class ContainerCtrl {
    private data: { [key: string]: {}; } = {};

    public addOrUpdate(id: string, obj: Object, mapping: Mapping) {
        obj['group'] = obj['names'];
        mapping.mapContainer(obj);
        this.data[id] = obj;
    }

    public getList() {
        return Object.keys(this.data).map(key => this.data[key]);
    }

    public getNodes() {
        let nodes: Object[] = [];

        let hostSet = new Set();
        let imageSet = new Set();
        for (let container of this.getList()) {
            hostSet.add(container['host']);
            imageSet.add(container['host'] + '-' + container['image']);
            nodes.push({
                id: container['hash'],
                name: container['names'],
                parent: container['host'] + '-' + container['image']
            });
        }
        hostSet.forEach(host => {
            nodes.push({id: host, name: host});
        });
        imageSet.forEach(image => {
            nodes.push({
                id: image,
                name: image.substr(image.indexOf('-') + 1),
                parent: image.substr(0, image.indexOf('-'))
            });
        });
        return nodes.map(item => {
            return {data: item}
        });
    }

    public getNodesWithUtilization(utilCtrl: UtilizationCtrl) {
        let nodes: Object[] = [];
        let hosts: {[key: string]: number;} = {};
        for (let container of this.getList()) {
            if (hosts[container['host']] === undefined){
                hosts[container['host']] = 0;
            }
            hosts[container['host']] += utilCtrl.getValue(container['hash']);
            let percentage = (utilCtrl.getValue(container['hash']) * 100).toFixed(2) + '%';
            nodes.push({
                id: container['hash'],
                name: container['names'] + '\n' + percentage,
                parent: container['host']
            });
        }
        Object.keys(hosts).forEach(host => {
            let percentage = (hosts[host] * 100).toFixed(2) + '%';
            nodes.push({id: host, name: host + '\n' + percentage});
        });
        return nodes.map(item => {
            return {data: item}
        });
    }

    public getNodesWithRelativeUtilization(utilCtrl: UtilizationCtrl) {
        let nodes: Object[] = [];
        let hosts: { [key: string]: number; } = {};
        for (let container of this.getList()) {
            if (hosts[container['host']] === undefined) {

                hosts[container['host']] = 0;
            }
            hosts[container['host']] += utilCtrl.getValue(container['hash']);
        }
        for (let container of this.getList()){
            let hostUtil = hosts[container['host']];
            let percentage = '0%';
            if (hostUtil > 0.01) { // avoid division by zero
                percentage = (utilCtrl.getValue(container['hash']) / hostUtil * 100).toFixed(2) + '%';
            }
            nodes.push({
                id: container['hash'],
                name: container['names'] + '\n' + percentage,
                parent: container['host']
            });
        }
        Object.keys(hosts).forEach(host => {
            let percentage = (hosts[host] * 100).toFixed(2) + '%';
            nodes.push({id: host, name: host + '\n' + percentage });
        });
        return nodes.map(item => {
            return {data: item}
        });
    }

    public getNodesWithWastePrediction(wasteCtrl: WasteCtrl, hostCtrl: HostCtrl) {
        let nodes: Object[] = [];
        let hosts: { [key: string]: number; } = {};
        for (let container of this.getList()) {
            if (hosts[container['host']] === undefined) {
                hosts[container['host']] = 0;
            }
            let wastePercentage =  wasteCtrl.getValue(container['hash']);
            hosts[container['host']] += wastePercentage;
            let waste = wastePercentage * hostCtrl.getPrice(container['host']);
            nodes.push({
                id: container['hash'],
                name: container['names'] + '\n$' + waste.toFixed(4),
                parent: container['host']
            });
        }

        Object.keys(hosts).forEach(host => {
            let waste = (hosts[host] * hostCtrl.getPrice(host)).toFixed(4);
            nodes.push({id: host, name: host + '\n$' + waste});
        });
        return nodes.map(item => {
            return {data: item}
        });
    }

    public getNodesWithWaste(wasteCtrl: WasteCtrl) {
        let nodes: Object[] = [];
        let hosts: { [key: string]: number; } = {};
        for (let container of this.getList()) {
            if (hosts[container['host']] === undefined) {
                hosts[container['host']] = 0;
            }
            hosts[container['host']] += wasteCtrl.getValue(container['hash']);
        }

        for (let container of this.getList()) {
            let waste = wasteCtrl.getValue(container['hash']) * 100;
            let wastePercentage = waste.toFixed(2) + '%';
            nodes.push({
                id: container['hash'],
                name: container['names'] + '\n' + wastePercentage,
                parent: container['host']
            });
        }
        Object.keys(hosts).forEach(host => {
            let percentage = (hosts[host] * 100).toFixed(2) + '%';
            nodes.push({id: host, name: host + '\n' + percentage});
        });
        return nodes.map(item => {
            return {data: item}
        });
    }

    public getNodesWithRelativeWaste(wasteCtrl: WasteCtrl) {
        let nodes: Object[] = [];
        let hosts: { [key: string]: number; } = {};
        for (let container of this.getList()) {
            if (hosts[container['host']] === undefined) {
                hosts[container['host']] = 0;
            }
            hosts[container['host']] += wasteCtrl.getValue(container['hash']);
        }

        for (let container of this.getList()) {
            let totalWaste = hosts[container['host']];
            let waste = 0;
            if (totalWaste > 0.01){
                waste = wasteCtrl.getValue(container['hash']) / totalWaste * 100;
            }
            let wastePercentage = waste.toFixed(2) + '%';
            nodes.push({
                id: container['hash'],
                name: container['names'] + '\n' + wastePercentage,
                parent: container['host']
            });
        }
        Object.keys(hosts).forEach(host => {
            let percentage = (hosts[host] * 100).toFixed(2) + '%';
            nodes.push({id: host, name: host + '\n' + percentage});
        });
        return nodes.map(item => {
            return {data: item}
        });
    }

    getNodesWithCost(utilCtrl: UtilizationCtrl, hostCtrl: HostCtrl) {
        let nodes: Object[] = [];
        let hostSet = new Set();
        for (let container of this.getList()) {
            hostSet.add(container['host']);
            let price = (utilCtrl.getValue(container['hash']) * hostCtrl.getPrice(container['host'])).toFixed(4);
            nodes.push({
                id: container['hash'],
                name: container['names'] + '\n$' + price,
                parent: container['host']
            });
        }
        hostSet.forEach(host => {
            nodes.push({id: host, name: host});
        });
        return nodes.map(item => {
            return {data: item}
        });
    }

    public getGroupedNodes() {
        let groups: { [key: string]: Object } = {};
        for (let container of this.getList()) {
            let group = this.getGroupFromContainerHash(container['hash']);
            if (groups[group] === undefined) {
                groups[group] = {id: group, name: group};
            }
        }
        return Object.keys(groups).map(key => {
            return {data: groups[key]}
        });
    }

    getGroupedNodesCost(utilCtrl: UtilizationCtrl, hostCtrl: HostCtrl) {
        let groups: { [key: string]: number } = {};

        for (let container of this.getList()) {
            let group = this.getGroupFromContainerHash(container['hash']);
            if (groups[group] === undefined) {
                groups[group] = 0;
            }
            groups[group] += utilCtrl.getValue(container['hash']) * hostCtrl.getPrice(container['host']);
        }

        return Object.keys(groups).map(group => {
            return {
                data: {
                    id: group,
                    name: group + '\n$' + groups[group].toFixed(4),
                }
            }
        });
    }

    getGroupedNodesWastePrediction(wasteCtrl: WasteCtrl, hostCtrl: HostCtrl) {
        let groups: { [key: string]: number } = {};

        for (let container of this.getList()) {
            let group = this.getGroupFromContainerHash(container['hash']);
            if (groups[group] === undefined) {
                groups[group] = 0;
            }
            groups[group] += wasteCtrl.getValue(container['hash']) * hostCtrl.getPrice(container['host']);
        }

        return Object.keys(groups).map(group => {
            return {
                data: {
                    id: group,
                    name: group + '\n$' + groups[group].toFixed(4),
                }
            }
        });
    }

    public getGroupedNodesTotalCost(costCtrl: CostCtrl, hostCtrl: HostCtrl) {
        let groups: { [key: string]: number } = {};
        for (let container of this.getList()) {
            let group = this.getGroupFromContainerHash(container['hash']);
            if (groups[group] === undefined) {
                groups[group] = 0;
            }
            groups[group] += costCtrl.getValue(container['hash']) * hostCtrl.getPrice(container['host']);
        }

        return Object.keys(groups).map(key => {
            return {
                data: {
                    id: key,
                    name: key + '\n$' + groups[key].toFixed(4),
                }
            }
        });
    }

    public getGroupedNodesTotalWaste(wasteTotalCtrl: WasteTotalCtrl, hostCtrl: HostCtrl) {
        let groups: { [key: string]: number } = {};
        for (let container of this.getList()) {
            let group = this.getGroupFromContainerHash(container['hash']);
            if (groups[group] === undefined) {
                groups[group] = 0;
            }
            groups[group] += wasteTotalCtrl.getValue(container['hash']) * hostCtrl.getPrice(container['host']);
        }

        return Object.keys(groups).map(key => {
            return {
                data: {
                    id: key,
                    name: key + '\n$' + groups[key].toFixed(2),
                }
            }
        });
    }

    public getGroupedEdges(edgesCtrl) {
        let edges: Object[] = [];
        for (let edge of edgesCtrl.getList()) {
            let data_edge = edge['data'];
            data_edge['source'] = this.getGroupFromContainerHash(data_edge['source']);
            data_edge['target'] = this.getGroupFromContainerHash(data_edge['target']);
            if (data_edge['source'] === data_edge['target']) {
                data_edge['type'] = 'loop';
            }
            edges.push(edge);
        }
        return this.mergeItemsInList(edges);
    }

    private getGroupFromContainerHash(hash) {
        for (let container of this.getList()) {
            if (container['hash'] === hash) {
                return container['group'];
            }
        }
        return '';
    }

    /**
     * sum up the bytes-value if both the target and destination from two nodes are the same.
     * @param list a list with objects, encoded as: {data: {source: '', target: '', bytes: 0}}
     */
    private mergeItemsInList(list) {
        let separator = '-';
        let map = new Map<string, number>();
        let newList: Object[] = [];

        for (let item of list) {
            let data = item['data'];
            let key = data['source'] + separator + data['target'];
            let value = data['bytes'];
            if (map.has(key)) {
                value += map.get(key);
            }
            map.set(key, value);
        }

        map.forEach((value: number, key: string) => {
            let source_target = key.split(separator);
            newList.push({
                'source': source_target[0],
                'target': source_target[1],
                'bytes': value,
            });
        });

        newList = add_width(newList);
        return newList.map(item => {
            return {data: item}
        });
    }
}