
export class ContainerCtrl {
    private containers: Object[] = [
        {
            "created": "1556619810",
            "hash": "0",
            "host": "35.204.105.69",
            "image": "dadvisor/web:latest",
            "instance": "localhost:14100",
            "ip": "172.17.0.2",
            "job": "dadvisor",
            "names": "/web",
            "group": "/web"
        },
        {
            "created": "1556619810",
            "hash": "1",
            "host": "35.204.105.69",
            "image": "dadvisor/web:latest",
            "instance": "localhost:14100",
            "ip": "172.17.0.2",
            "job": "dadvisor",
            "names": "/req",
            "group": "/req"
        },
    ];

    public clear() {
        // this.containers = [];
    }

    public add(obj: Object) {
        // this.containers.push(obj);
    }

    public getList() {
        return this.containers;
    }

    public getNodes(){
        let nodes: Object[] = [];

        let hostSet = new Set();
        let imageSet = new Set();
        for (let container of this.getList()) {
            hostSet.add(container['host']);
            imageSet.add(container['host'] + '-' + container['image']);
            nodes.push({
                id: container['hash'],
                name: container['names'],
                parent: container['host'] + '-' + container['image']
            });
        }
        hostSet.forEach(host => {
            nodes.push({id: host, name: host});
        });
        imageSet.forEach(image => {
            nodes.push({
                id: image,
                name: image.substr(image.indexOf('-') + 1),
                parent: image.substr(0, image.indexOf('-'))
            });
        });
        return nodes.map(item => {
            return {data: item}
        });
    }
}