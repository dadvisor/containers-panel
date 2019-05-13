export class UtilizationCtrl {
    private data: { [key: string]: number; } = {};

    public addOrUpdate(id: string, value: number) {
        this.data[id] = value;
    }

    public getValue(id: string) {
        return this.data[id];
    }

    public reset() {
        this.data = {};
    }
}