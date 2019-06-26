import {Node} from "./node";
import {getCpuCost, getCpuWasteCost, getMemCost, getMemWasteCost, getTrafficCost} from "../controller/CostWasteCtrl";
import {DataCtrl} from "../controller/dataCtrl";

export class Container {
    private name: string = '';
    private group: string = '';
    private readonly hash: string;
    private image: string = '';
    private readonly hostIp: string;

    private cpuUtil: number;
    private memUtil: number;
    private cpuWaste: number;
    private memWaste: number;
    private networkTraffic: number = 0;

    constructor(hash: string, hostIp: string) {
        this.hash = hash;
        this.hostIp = hostIp;
    }

    public getHash() {
        return this.hash;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string) {
        this.name = name;
        if (this.group === '') {
            this.group = name;
        }
    }

    public getHostIp(): string {
        return this.hostIp;
    }

    public getImage(): string {
        return this.image;
    }

    public setImage(image: string) {
        this.image = image;
    }

    public getCpuUtil(): number {
        return this.cpuUtil;
    }

    public setCpuUtil(cpuUtil: number) {
        this.cpuUtil = cpuUtil;
    }

    public getMemUtil(): number {
        return this.memUtil;
    }

    public setMemUtil(memUtil: number) {
        this.memUtil = memUtil;
    }

    public getCpuWaste(): number {
        return this.cpuWaste;
    }

    public setCpuWaste(cpuWaste: number) {
        this.cpuWaste = cpuWaste;
    }

    public getMemWaste(): number {
        return this.memWaste;
    }

    public getGroup(): string {
        return this.group;
    }

    public setGroup(group: string) {
        this.group = group;
    }

    public setMemWaste(memWaste: number) {
        this.memWaste = memWaste;
    }

    public getNetworkTraffic(): number {
        return this.networkTraffic;
    }

    public setNetworkTraffic(networkTraffic: number) {
        this.networkTraffic = networkTraffic;
    }

    public getCost(dataCtrl: DataCtrl, node: Node) {
        return getCpuCost(this.cpuUtil, dataCtrl, node)
            + getMemCost(this.memUtil, dataCtrl, node)
            + getTrafficCost(this.networkTraffic, dataCtrl);
    }

    public getWaste(dataCtrl: DataCtrl, node: Node) {
        return getCpuWasteCost(this.cpuWaste, dataCtrl, node)
            + getMemWasteCost(this.memWaste, dataCtrl, node);
    }

}