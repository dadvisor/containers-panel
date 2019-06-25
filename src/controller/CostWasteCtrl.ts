import {PanelCtrl} from "../panelCtrl";
import {Node} from "../model/node";
import {Container} from "../model/container";

/*
 * COST
 */
export function getCpuCost(value: number, panelCtrl: PanelCtrl, node: Node): number {
    return value * panelCtrl.getCpuPrice() * node.getNumCores();
}

export function getMemCost(value: number, panelCtrl: PanelCtrl, node: Node): number {
    return value * panelCtrl.getMemPriceByte() * node.getMemory();
}

export function getTrafficCost(value: number, panelCtrl: PanelCtrl): number {
    return value * panelCtrl.getTrafficPriceByte();
}

export function getTotalCost(container: Container, panelCtrl: PanelCtrl): number {
    let node = panelCtrl.getDataCtrl().getNode(container.getHostIp());
    return getCpuCost(container.getCpuUtil(), panelCtrl, node)
        + getMemCost(container.getMemUtil(), panelCtrl, node)
        + getTrafficCost(container.getNetworkTraffic(), panelCtrl);
}

export function getTotalCostNode(node: Node, panelCtrl: PanelCtrl): number {
    return getCpuCost(node.getSumCpuUtil(), panelCtrl, node)
        + getMemCost(node.getSumMemUtil(), panelCtrl, node)
        + getTrafficCost(node.getSumNetwork(), panelCtrl);
}

/*
 * WASTE
 */
export function getCpuWasteCost(value: number, panelCtrl: PanelCtrl, node: Node) {
    return value * panelCtrl.getCpuPrice() * node.getNumCores();
}

export function getMemWasteCost(value: number, panelCtrl: PanelCtrl, node: Node) {
    return value * panelCtrl.getMemPriceByte() * node.getMemory();
}

export function getTotalWaste(container: Container, panelCtrl: PanelCtrl): number {
    let node = panelCtrl.getDataCtrl().getNode(container.getHostIp());
    return getCpuWasteCost(container.getCpuWaste(), panelCtrl, node)
        + getMemWasteCost(container.getMemWaste(), panelCtrl, node);
}

export function getTotalWasteNode(node: Node, panelCtrl: PanelCtrl): number {
    return getCpuWasteCost(node.getSumCpuWaste(), panelCtrl, node)
        + getMemWasteCost(node.getSumMemWaste(), panelCtrl, node);
}