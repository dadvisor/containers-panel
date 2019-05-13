import _ from "lodash";
import {bytesToSize} from "./util";

const CPU_PRICE_HOUR = 0.021925;
const GB_PRICE_HOUR = 0.002938;

class Host {
    ip: string;
    numCores: number;
    memory: number;
    price: number;

    constructor(ip: string, numCores: number, memory: number) {
        this.ip = ip;
        this.numCores = numCores;
        this.memory = memory;
        this.price = this.getDefaultPrice();
    }

    private getDefaultPrice() {
        return this.numCores * CPU_PRICE_HOUR + this.memory / Math.pow(2, 30) * GB_PRICE_HOUR;
    }

    public getMemory() {
        return bytesToSize(this.memory);
    }
}

export class HostCtrl {
    private hosts: Host[] = [];

    public addOrUpdate(obj: Host) {
        for (let host of this.hosts) {
            if (host.ip == obj.ip) {
                host = _.defaults(obj, host);
                return;
            }
        }
        this.hosts.push(obj);
    }

    public getList() {
        return this.hosts;
    }
}

export function getHost(obj: Object): Host {
    return new Host(obj['host'], obj['num_cores'], obj['memory']);
}