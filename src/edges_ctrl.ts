import {add_width} from "./util";

export class EdgesCtrl {
    private edges: Object[] = [];

    public clear(){
        this.edges = [];
    }

    public add(edge){
        this.edges.push(edge);
    }

    public getList(){
        let edges = add_width(this.edges);
        return edges.map(item => {
            return {data: item}
        });
    }
}