
export class GraphNode {
    public readonly id: string;
    public readonly name: string;
    public readonly parent: string;

    constructor(id: string, name: string, parent?: string){
        this.id = id;
        this.name = name;
        if (parent) {
            this.parent = parent;
        }
    }
}