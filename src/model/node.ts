import {Container} from "./container";
import {ContainerMap, DataCtrl} from "../controller/dataCtrl";
import {bytesToSize} from "../util";

export class Node {
    private readonly ip: string;
    private superNode: boolean;
    private memory: number;
    private numCores: number;
    private containers: ContainerMap = {};

    private sumCpuUtil: number = 0;
    private sumMemUtil: number = 0;
    private sumCpuWaste: number = 0;
    private sumMemWaste: number = 0;
    private sumNetwork: number = 0;

    constructor(ip: string) {
        this.ip = ip;
    }

    public getContainer(hash: string, dataCtrl: DataCtrl) {
        if (!this.containers[hash]) {
            this.containers[hash] = new Container(hash, this.ip);
            dataCtrl.setContainer(hash, this.containers[hash]);
        }
        return this.containers[hash];
    }

    public clearContainers() {
        this.containers = {};
    }

    public getContainers(): Container[] {
        return Object.keys(this.containers).map(hash => this.containers[hash]);
    }

    public getIp(): string {
        return this.ip;
    }

    public isSuperNode(): boolean {
        return this.superNode;
    }

    public setSuperNode(superNode: boolean) {
        this.superNode = superNode;
    }

    public getMemory(): number {
        return this.memory;
    }

    public getMemoryString(): string {
        return bytesToSize(this.memory);
    }

    public setMemory(memory: number) {
        this.memory = memory;
    }

    public getNumCores(): number {
        return this.numCores;
    }

    public setNumCores(numCores: number) {
        this.numCores = numCores;
    }

    public setSumCpuUtil(sumCpuUtil: number) {
        this.sumCpuUtil = sumCpuUtil;
    }

    public getSumCpuUtil(): number {
        return this.sumCpuUtil;
    }

    public setSumMemUtil(sumMemUtil: number) {
        this.sumMemUtil = sumMemUtil;
    }

    public getSumMemUtil(): number {
        return this.sumMemUtil;
    }

    public setSumCpuWaste(sumCpuWaste: number) {
        this.sumCpuWaste = sumCpuWaste;
    }

    public getSumCpuWaste(): number {
        return this.sumCpuWaste;
    }

    public setSumMemWaste(sumMemWaste: number) {
        this.sumMemWaste = sumMemWaste;
    }

    public getSumMemWaste(): number {
        return this.sumMemWaste;
    }

    public setSumNetwork(sumNetwork: number) {
        this.sumNetwork = sumNetwork;
    }

    public getSumNetwork(): number {
        return this.sumNetwork;
    }
}