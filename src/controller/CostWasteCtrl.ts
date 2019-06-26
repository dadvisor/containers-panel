import {Node} from "../model/node";
import {Container} from "../model/container";
import {DataCtrl} from "./dataCtrl";

/*
 * COST
 */
export function getCpuCost(value: number, dataCtrl: DataCtrl, node: Node): number {
    return value * dataCtrl.getCpuPrice() * node.getNumCores();
}

export function getMemCost(value: number, dataCtrl: DataCtrl, node: Node): number {
    return value * dataCtrl.getMemPriceByte() * node.getMemory();
}

export function getTrafficCost(value: number, dataCtrl: DataCtrl): number {
    return value * dataCtrl.getTrafficPriceByte();
}

export function getTotalCost(container: Container, dataCtrl: DataCtrl): number {
    let node = dataCtrl.getNode(container.getHostIp());
    return getCpuCost(container.getCpuUtil(), dataCtrl, node)
        + getMemCost(container.getMemUtil(), dataCtrl, node)
        + getTrafficCost(container.getNetworkTraffic(), dataCtrl);
}

export function getTotalCostNode(node: Node, dataCtrl: DataCtrl): number {
    return getCpuCost(node.getSumCpuUtil(), dataCtrl, node)
        + getMemCost(node.getSumMemUtil(), dataCtrl, node)
        + getTrafficCost(node.getSumNetwork(), dataCtrl);
}

export function getNodePrice(node: Node, dataCtrl: DataCtrl): number {
    return getCpuCost(1, dataCtrl, node)
        + getMemCost(1, dataCtrl, node)
}

/*
 * WASTE
 */
export function getCpuWasteCost(value: number, dataCtrl: DataCtrl, node: Node) {
    return value * dataCtrl.getCpuPrice() * node.getNumCores();
}

export function getMemWasteCost(value: number, dataCtrl: DataCtrl, node: Node) {
    return value * dataCtrl.getMemPriceByte() * node.getMemory();
}

export function getTotalWaste(container: Container, dataCtrl: DataCtrl): number {
    let node = dataCtrl.getNode(container.getHostIp());
    return getCpuWasteCost(container.getCpuWaste(), dataCtrl, node)
        + getMemWasteCost(container.getMemWaste(), dataCtrl, node);
}

export function getTotalWasteNode(node: Node, dataCtrl: DataCtrl): number {
    return getCpuWasteCost(node.getSumCpuWaste(), dataCtrl, node)
        + getMemWasteCost(node.getSumMemWaste(), dataCtrl, node);
}