import _ from "lodash";
import {bytesToSize} from "./util";

class Host {
    ip: string;
    numCores: number;
    memory: number;
    price: number;

    constructor(ip: string, numCores: number, memory: number, hostCtrl: HostCtrl) {
        this.ip = ip;
        this.numCores = numCores;
        this.memory = memory;
        this.price = this.getDefaultPrice(hostCtrl);
    }

    private getDefaultPrice(hostCtrl: HostCtrl) {
        return this.numCores * hostCtrl.cpuPriceHour + this.memory / Math.pow(2, 30) * hostCtrl.gbPriceHour;
    }

    public getMemory() {
        return bytesToSize(this.memory);
    }
}

export class HostCtrl {
    public cpuPriceHour = 0.021925;
    public gbPriceHour =  0.002938;
    private hosts: Host[] = [];

    public addOrUpdate(obj: Object) {
        const host_obj: Host = new Host(obj['host'], obj['num_cores'], obj['memory'], this);
        for (let host of this.hosts) {
            if (host.ip == host_obj.ip) {
                host = _.defaults(host_obj, host);
                return;
            }
        }
        this.hosts.push(host_obj);
    }

    public getList() {
        return this.hosts;
    }
}