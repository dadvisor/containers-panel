import _ from "lodash";
import {bytesToSize} from "./util";

class Host {
    ip: string;
    numCores: number;
    memory: number;

    constructor(ip: string, numCores: number, memory: number){
        this.ip = ip;
        this.numCores = numCores;
        this.memory = memory;
    }

    public getMemory(){
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

export function getHost(obj: Object): Host{
    return new Host(obj['ip'], obj['numCores'], obj['memory']);
}