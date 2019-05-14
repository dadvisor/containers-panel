import _ from "lodash";
import {bytesToSize} from "./util";
import {PanelCtrl} from "./panel_ctrl";

class Host {
    ip: string;
    numCores: number;
    memory: number;
    price: number;

    constructor(ip: string, numCores: number, memory: number, hostCtrl: HostCtrl) {
        this.ip = ip;
        this.numCores = numCores;
        this.memory = memory;
        this.setDefaultPrice(hostCtrl);
    }

    setDefaultPrice(hostCtrl: HostCtrl) {
        this.price = this.numCores * hostCtrl.getCpuPriceHour() +
            this.memory / Math.pow(2, 30) * hostCtrl.getGbPriceHour();
    }

    public getMemory() {
        return bytesToSize(this.memory);
    }
}

export class HostCtrl {
    private hosts: Host[] = [];
    private panelCtrl: PanelCtrl;

    constructor(panelCtrl: PanelCtrl) {
        this.panelCtrl = panelCtrl;
    }

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

    getCpuPriceHour() {
        return this.panelCtrl.panel['cpuPriceHour'];
    }

    getGbPriceHour() {
        return this.panelCtrl.panel['gbPriceHour'];
    }

    public getList() {
        return this.hosts;
    }

    public updatePrices() {
        for (let host of this.hosts) {
            host.setDefaultPrice(this);
        }
    }

    getPrice(ip: string) {
        for (let host of this.hosts) {
            if (host.ip === ip) {
                return host.price;
            }
        }
        console.log('Price not found for ip: ' + ip);
        return 0;
    }
}