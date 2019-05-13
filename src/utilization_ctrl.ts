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