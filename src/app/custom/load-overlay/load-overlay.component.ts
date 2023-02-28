import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { LoadService } from './load-overlay.service';

@Component({
    selector: 'riva-load-overlay',
    templateUrl: './load-overlay.component.html',
    styleUrls: ['./load-overlay.component.scss']
})
export class LoadOverlayComponent implements OnInit, OnDestroy {
    subscription: Subscription;
    loading: boolean = false;

    constructor(private loadService: LoadService) { }

    ngOnInit(){
        this.subscription = this.loadService.onLoad()
            .subscribe(result => {
                this.loading = result;
            });
    }

    ngOnDestroy(){
        this.subscription.unsubscribe();
    }
}

@Component({
    selector: 'riva-load-content-overlay',
    templateUrl: './load-content-overlay.component.html',
    styleUrls: ['./load-overlay.component.scss']
})
export class LoadContentOverlayComponent implements OnInit, OnDestroy {
    subscription: Subscription;
    loadingContent: boolean = false;

    constructor(private loadService: LoadService) { }

    ngOnInit(){
        this.subscription = this.loadService.onContentLoad()
            .subscribe(result => {
                this.loadingContent = result;
            });
    }

    ngOnDestroy(){
        this.subscription.unsubscribe();
    }
}