import { Component, OnInit } from '@angular/core';
import { ProductService } from '../_services/product.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Product } from '../_model/product.model';
import { MatDialog } from '@angular/material/dialog';
import { ShowProductImagesDialogComponent } from '../show-product-images-dialog/show-product-images-dialog.component';
import { ImageProcessingService } from '../image-processing.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-show-product-details',
  templateUrl: './show-product-details.component.html',
  styleUrls: ['./show-product-details.component.css']
})
export class ShowProductDetailsComponent implements OnInit {

    pageNumber: number = 0;
    showTable = false;
    showLoadMoreProductButton = false;
    constructor(private productService: ProductService, public imagesDialog: MatDialog,
        private imageProcessingService: ImageProcessingService,
        private router: Router) { }

    productDetails: Product[] = [];
    displayedColumns: string[] = ['Id', 'Product Name', 'description', 'Product Discounted Price', 'Product Actual Price', 'Actions'];

    ngOnInit(): void {
        this.getAllProducts();
  }

    public getAllProducts(searchKeyword: string = "") {
        this.showTable = false;
        this.productService.getAllProducts(this.pageNumber, searchKeyword)
            .pipe(
                map((x: Product[], i) => x.map((product: Product) => this.imageProcessingService.createImages(product)))
            )
            .subscribe(
            (resp: Product[]) => {
                    //console.log(resp);
                    resp.forEach(product => this.productDetails.push(product));
                    this.showTable = true;
                    if (resp.length == 12) {
                        this.showLoadMoreProductButton = true;
                    } else {
                        this.showLoadMoreProductButton = false;
                    }
            }, (error: HttpErrorResponse) => {
                console.log(error);
            }

        );
    }

    public deleteProduct(productId) {
        this.productService.deleteProduct(productId).subscribe(
            (resp) => {
                this.getAllProducts();
            },
            (error: HttpErrorResponse) => {
                console.log(error);
            }

        );
    }

    public showImages(product: Product) {
        this.imagesDialog.open(ShowProductImagesDialogComponent, {
            data: {
                images: product.productImages
            },
            height: '500px',
            width: '500px'
        });

    }

    editProductDetails(productId) {
        this.router.navigate(['/add-new-product', { productId: productId }]);
    }

    loadMoreProduct() {
        this.pageNumber = this.pageNumber + 1;
        this.getAllProducts();
    }

    searchBYKeyword(searchkeyword) {
        this.pageNumber = 0;
        this.productDetails = [];
        this.getAllProducts(searchkeyword);

    }
}
