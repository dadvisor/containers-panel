import {PanelCtrl} from "../panelCtrl";
import {DataCtrl} from "./dataCtrl";
import {Node} from "../model/node";
import {getCpuCost, getCpuWasteCost, getMemCost, getMemWasteCost, getTrafficCost} from "./CostWasteCtrl";

export enum GlobalVar {
    TIME_WINDOW = 'TIME_WINDOW',
    TOTAL_CPU_COST = 'TOTAL_CPU_COST',
    TOTAL_MEM_COST = 'TOTAL_MEM_COST',
    TOTAL_TRAFFIC_COST = 'TOTAL_TRAFFIC_COST',
    TOTAL_CPU_WASTE = 'TOTAL_CPU_WASTE',
    TOTAL_MEM_WASTE = 'TOTAL_MEM_WASTE',
}

export class GlobalVarCtrl {
    private readonly panelCtrl: PanelCtrl;
    private readonly dataCtrl: DataCtrl;

    constructor(panelCtrl: PanelCtrl, dataCtrl: DataCtrl) {
        this.panelCtrl = panelCtrl;
        this.dataCtrl = dataCtrl;
    }

    public computeVars() {
        let nodes = this.dataCtrl.getNodes();
        let cpuCost = this.getPrice(nodes, n => getCpuCost(n.getSumCpuUtil(), this.panelCtrl, n));
        let memCost = this.getPrice(nodes, n => getMemCost(n.getSumMemUtil(), this.panelCtrl, n));
        let trafficCost = this.getPrice(nodes, n => getTrafficCost(n.getSumNetwork(), this.panelCtrl));
        let cpuWaste = this.getPrice(nodes, n => getCpuWasteCost(n.getSumCpuWaste(), this.panelCtrl, n));
        let memWaste = this.getPrice(nodes, n => getMemWasteCost(n.getSumMemWaste(), this.panelCtrl, n));

        this.set(GlobalVar.TOTAL_CPU_COST, cpuCost);
        this.set(GlobalVar.TOTAL_MEM_COST, memCost);
        this.set(GlobalVar.TOTAL_TRAFFIC_COST, trafficCost);
        this.set(GlobalVar.TOTAL_CPU_WASTE, cpuWaste);
        this.set(GlobalVar.TOTAL_MEM_WASTE, memWaste);
    }

    public set(varName: GlobalVar, value: any) {
        const dashboardVar = this.panelCtrl.templateSrv.variables.find(v => v.name === varName);
        if (dashboardVar) {
            dashboardVar.current.text = value.toString();
            dashboardVar.current.value = value.toString();
            console.log(`Setting ${varName} to: ${value}`);
        }
    }

    private getPrice(nodes: Node[], computePrice: (node: Node) => number){
        return nodes.map(n => computePrice(n)).reduce((a, b) => a + b, 0);
    }

}