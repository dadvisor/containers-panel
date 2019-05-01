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
        // TODO: Remove statement below
        this.edges = [
            {
                "target": "0",
                "job": "dadvisor",
                "bytes": 2480,
                "source": "1"
            },
            {
                "target": "1",
                "job": "dadvisor",
                "bytes": 2480,
                "source": "0"
            }
        ];
        let edges = add_width(this.edges);
        return edges.map(item => {
            return {data: item}
        });
    }
}