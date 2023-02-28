export class Collection{
    collectionsId: number = 0;
    collectionName: string = '';
    collectionAvailable: boolean = true;
    coverPhoto: string = '../../../assets/images/no-image.png';
    bannerPhoto: string = '../../../assets/images/no-image.png';
}

export class CollectionItem{
    id: number = 0;
    collectionId: number = 0;
    productId: number = 0;
}