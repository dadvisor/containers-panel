import {formatSize} from "../util";

export class GraphEdge {
    public readonly source: string;
    public readonly target: string;
    public readonly bytes: number = 0;
    public readonly label: string;
    public readonly type: string;
    public width: number = 0;

    constructor(source, target, bytes){
        this.source = source;
        this.target = target;
        this.bytes = bytes;
        this.label = formatSize(this.bytes);
        if (source === target){
            this.type = 'loop';
        }
    }

    public setWidth(width){
        this.width = width;
    }
}