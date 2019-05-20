/**
 * Class for storing the total cost of a container.
 */

export class WasteCtrlTotal {
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