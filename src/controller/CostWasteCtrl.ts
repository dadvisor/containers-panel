import {Node} from "../model/node";
import {DataCtrl} from "./dataCtrl";
import {TIME_WINDOW} from "../util";

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

export function getNodePrice(node: Node, dataCtrl: DataCtrl, timeWindow: TIME_WINDOW): number {
    let time;
    switch (timeWindow) {
        case TIME_WINDOW.DAY:
            time = 24;
            break;
        case TIME_WINDOW.HOUR:
            time = 1;
            break;
        case TIME_WINDOW.TEN_MIN:
            time = 10 / 60;
            break;
        case TIME_WINDOW.YEAR:
            time = 24 * 365;
    }
    return getCpuCost(time, dataCtrl, node) + getMemCost(time, dataCtrl, node);
}

/*
 * WASTE
 */
export function getCpuWasteCost(value: number, dataCtrl: DataCtrl, node: Node) {
    if (node === null){
        console.log('node is null');
        return value * dataCtrl.getCpuPrice() * 8;
    }
    return value * dataCtrl.getCpuPrice() * node.getNumCores();
}

export function getMemWasteCost(value: number, dataCtrl: DataCtrl, node: Node) {
    if (node === null){
        console.log('node is null');
        return value * dataCtrl.getMemPriceByte() * 16 * Math.pow(2, 30);
    }
    return value * dataCtrl.getMemPriceByte() * node.getMemory();
}