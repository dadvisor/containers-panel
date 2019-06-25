export enum NameImage {
    NAME = 'Name',
    IMAGE = 'Image'
}

export class Mapping {
    public regex: string = '';
    public group: string = '';
    public match: NameImage.NAME;
}