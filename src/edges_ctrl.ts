import {add_width} from "./util";

export class EdgesCtrl {
    private data: { [key: string]: number; } = {};

    public clear(){
        this.data = {};
    }

    public addOrUpdate(edge){
        let key = edge['source'] + edge['target'];
        this.data[key] = edge;
    }

    public getList(){
        let edges = add_width(Object.keys(this.data).map(key => this.data[key]));
        return edges.map(item => {
            return {data: item}
        });
    }
}