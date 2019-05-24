/**
 * Class for storing the total cost of a container.
 */

export class CostCtrl {
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
}