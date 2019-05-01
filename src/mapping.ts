import {NameID} from "./util";
import {ContainerCtrl} from "./container_ctrl";

class RuleMapping {
    regex: string;
    group: string;
    match: NameID;

    constructor(regex, group, match) {
        this.regex = regex;
        this.group = group;
        this.match = match;
    }
}

export default class Mapping {

    /** Variables */

    private rule_mappings: RuleMapping[] = [];
    private containerCtrl: ContainerCtrl;

    constructor(containerCtrl: ContainerCtrl) {
        this.add_row();
        this.containerCtrl = containerCtrl;
    }

    public add_row() {
        this.rule_mappings.push(new RuleMapping('', '', NameID.NAME));
    }

    public apply() {
        for (let mapping of this.rule_mappings) {
            if (mapping.regex === "") {
                continue;
            }
            let re = new RegExp(mapping.regex);
            for (let container of this.containerCtrl.getList()) {
                switch (mapping.match) {
                    case NameID.NAME:
                        if (re.test(container['names'])) {
                            container['group'] = mapping.group;
                        }
                        break;
                    case NameID.ID:
                        if (re.test(container['hash'])) {
                            container['group'] = mapping.group;
                        }
                        break;
                    default:
                        console.log('Cannot end in this state: ' + mapping.match);
                }
                container['group'].replace(re, container['group']);
            }
        }
    }

    public remove(row) {
        this.rule_mappings.splice(this.rule_mappings.indexOf(row), 1);
    }

    public getList() {
        return this.rule_mappings;
    }
}
