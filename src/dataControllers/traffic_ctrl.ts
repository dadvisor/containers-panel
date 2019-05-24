/**
 * Class for storing the total cost of a container.
 */

export enum TRAFFIC_TYPE {
    RECEIVED,
    TRANSMITTED
}

export class TrafficCtrl {
    private dataReceived: { [key: string]: number; } = {};
    private dataTransmitted: { [key: string]: number; } = {};

    public addOrUpdate(id: string, value: number, type: TRAFFIC_TYPE) {
        switch (type) {
            case TRAFFIC_TYPE.RECEIVED:
                this.dataReceived[id] = value;
                return;
            case TRAFFIC_TYPE.TRANSMITTED:
                this.dataTransmitted[id] = value;
                return;
            default:
                console.log('Unknown type: ' + type);
        }
    }

    public getValue(id: string, type: TRAFFIC_TYPE): number {
        switch (type) {
            case TRAFFIC_TYPE.RECEIVED:
                if (this.dataReceived[id] !== undefined) {
                    return this.dataReceived[id];
                }
                return 0;
            case TRAFFIC_TYPE.TRANSMITTED:
                if (this.dataTransmitted[id] !== undefined) {
                    return this.dataTransmitted[id];
                }
                return 0;
            default:
                console.log('Unknown type: ' + type);
        }
        return 0;
    }
}