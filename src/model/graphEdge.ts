import {bytesToSize} from "../util";

export class GraphEdge {
    public readonly source: string;
    public readonly target: string;
    public readonly bytes: number;
    public readonly label: string;
    public readonly type: string;
    public width: number;

    constructor(source, target, bytes){
        this.source = source;
        this.target = target;
        this.bytes = bytes;
        this.label = bytesToSize(this.bytes);
        if (source === target){
            this.type = 'loop';
        }
    }

    public setWidth(width){
        this.width = width;
    }
}