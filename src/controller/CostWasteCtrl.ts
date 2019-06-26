import {Node} from "../model/node";
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