import {NameImage} from "./util";
import {PanelCtrl} from "./panel_ctrl";

export default class Mapping {

    /** Variables */
    private panelCtrl: PanelCtrl;

    constructor(panelCtrl: PanelCtrl) {
        this.panelCtrl = panelCtrl;
    }

    public add_row() {
        this.panelCtrl.panel['ruleMappings'].push({
            regex: '',
            group: '',
            match: NameImage.NAME,
        });
    }

    public apply() {
        for (let mapping of this.panelCtrl.panel['ruleMappings']) {
            if (mapping.regex === "") {
                continue;
            }
            let re = new RegExp(mapping.regex);
            for (let container of this.panelCtrl.containerCtrl.getList()) {
                switch (mapping.match) {
                    case NameImage.NAME:
                        if (re.test(container['names'])) {
                            container['group'] = mapping.group;
                        }
                        break;
                    case NameImage.IMAGE:
                        if (re.test(container['image'])) {
                            container['group'] = mapping.group;
                        }
                        break;
                    default:
                        console.log('Cannot end in this state: ' + mapping.match);
                }
                container['group'].replace(re, container['group']);
            }
        }
        this.panelCtrl.updateGraph();
    }

    public remove(row) {
        this.panelCtrl.panel['ruleMappings'].splice(this.panelCtrl.panel['ruleMappings'].indexOf(row), 1);
    }

    public getList() {
        return this.panelCtrl.panel['ruleMappings'];
    }
}
