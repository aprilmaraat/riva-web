import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductStatus } from 'src/app/models/product';
import { MaterialCode, MatCodeSize, Sizes, SizeUpdate } from 'src/app/models/material-code';
import { ProductService } from 'src/app/services/product.service';


@Injectable({
  providedIn: 'root'
})
export class MaterialCodeService extends GenericService {
  baseUrl = environment.apiUrl + 'materialcode';


  //productID = 0;

  lstMaterialCode: MaterialCode[];
  lstSize: Sizes[];
  lstMatCodeSize: MatCodeSize[];

  constructor(http: HttpClient, private productService: ProductService) {
    super(http);

  }

  materialWithSize(productId: number, size: number): Observable<any>{
    let url = this.baseUrl + '/' + productId + '/sizeinmaterial/' + size;
    return this.http.get<any>(url, { headers: this.headers });
  }

  create(material: MaterialCode): Observable<any>{
    return this.http.post<any>(this.baseUrl, material, { headers: this.headers });
  }

  update(material: MaterialCode): Observable<any>{
    return this.http.put<any>(this.baseUrl, material, { headers: this.headers });
  }

  updateSize(sizeUpdate: SizeUpdate): Observable<any>{
    return this.http.put<any>(this.baseUrl + '/size-update', sizeUpdate, { headers: this.headers });
  }

  delete(materialCodeId: number): Observable<any>{
    return this.http.delete<any>(this.baseUrl + '/' + materialCodeId, { headers: this.headers });
  }

  deleteSize(productId: number, materialCodeId: number, size: number): Observable<any>{
    return this.http.delete<any>(this.baseUrl + '/size-delete/' + productId + '/' + materialCodeId + '/' + size, { headers: this.headers });
  }

  // get material list
  getMaterialCodes(matList: MaterialCode[], matIDList: number[]): MaterialCode[] {

    let lstTempMat: MaterialCode[] = [];

    for (let i = 0; i < matIDList.length; i++) {

      for (let j = 0; j < matList.length; j++) {

        if (matList[j].materialCodeId == matIDList[i]) {

          lstTempMat.push(matList[j]);

        }

      }
    }

    //console.log(lstTempMat);
    matList = [];
    if (lstTempMat.length > 0) {
      matList = lstTempMat;
    }

    return matList;
  }

  getProductMaterialSize(prodID: number): Observable<MatCodeSize[]> {

    let url = this.productService.baseUrl + '/MatList/' + prodID;

   return this.http.get<MatCodeSize[]>(url, { headers: this.headers });
  }


  getMaterialCodesView(prodID: number, matList: MaterialCode[] = null,
                      outCB: (OmatList: MaterialCode[], sizeList: Sizes[], oMatSize: MatCodeSize[]) => void) {

    let lstMatIds: number[] = [];
    let sizes: number[] = [];
    
    this.getProductMaterialSize(prodID).subscribe(res => {

       this.lstMatCodeSize  = res;

      //console.log("prodid  >>> ", prodID);
      // console.log(this.lstMatCodeSize);

      for (let i = 0; i < this.lstMatCodeSize.length; i++) {

        lstMatIds.push(this.lstMatCodeSize[i].matID);
        sizes.push(this.lstMatCodeSize[i].size);

        lstMatIds = Array.from(new Set(lstMatIds));
        sizes = Array.from(new Set(sizes));
       }

       this.lstSize = [];

       for (let i = 0; i < sizes.length; i++) {

         let iSize: Sizes = new Sizes;

          iSize.size = sizes[i];

          this.lstSize.push(iSize);
 
       }

      //console.log(lstMatIds);
      //console.log(sizes);
      // console.log(this.getMaterialCodes(matList, lstMatIds));

      this.lstMaterialCode = [];
      if (this.lstMatCodeSize.length > 0) {
        this.lstMaterialCode = this.getMaterialCodes(matList, lstMatIds);
      }

      //console.log(this.lstMaterialCode);
      //console.log(this.lstSize);

      //console.log(this.lstMaterialCode);
      
      outCB(this.lstMaterialCode, this.lstSize, this.lstMatCodeSize);

    });





  }

}

