import {PanelCtrl} from "../panelCtrl";
import {Mapping, NameImage} from "../model/mapping";
import {Container} from "../model/container";

export default class MappingCtrl {

    /** Variables */
    private panelCtrl: PanelCtrl;

    constructor(panelCtrl: PanelCtrl) {
        this.panelCtrl = panelCtrl;
    }

    public getNameImage() {
        return NameImage;
    }

    public addRow() {
        this.panelCtrl.panel['ruleMappings'].push(new Mapping());
    }

    public apply() {
        this.panelCtrl.dataCtrl.getContainers().forEach(c => this.mapContainer(c));
    }

    private mapContainer(container: Container) {
        this.panelCtrl.panel['ruleMappings'].forEach(mapping => {
            if (mapping.regex === "") {
                return;
            }
            let re = new RegExp(mapping.regex);

            switch (mapping.match) {
                case NameImage.NAME:
                    if (re.test(container.getName())) {
                        container.setGroup(mapping.group);
                    }
                    break;
                case NameImage.IMAGE:
                    if (re.test(container.getImage())) {
                        container.setGroup(mapping.group);
                    }
                    break;
                default:
                    console.log('Cannot end in this state: ' + mapping.match);
            }
        });
    }

    public remove(row) {
        this.panelCtrl.panel['ruleMappings'].splice(this.panelCtrl.panel['ruleMappings'].indexOf(row), 1);
    }

    public getList() {
        return this.panelCtrl.panel['ruleMappings'];
    }
}
