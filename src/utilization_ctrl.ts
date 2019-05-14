/**
 * Class for storing the current utilization of a certain container.
 * Note that a prediction of the cost can be made with the following formula:
 * - prediction per hour = util over last hour * host price per hour.
 */
export class UtilizationCtrl {
    private data: { [key: string]: number; } = {};

    public addOrUpdate(id: string, value: number) {
        this.data[id] = value;
    }

    public getValue(id: string): number {
        if (this.data[id] !== undefined){
            return this.data[id];
        }
        return 0;
    }

    public reset() {
        this.data = {};
    }
}