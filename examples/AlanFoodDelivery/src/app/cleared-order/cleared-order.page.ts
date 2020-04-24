import {Component, OnInit} from '@angular/core';
import {AlanIonPage} from "../alan.ion.page";
import {Router} from "@angular/router";
import {OrderDetailService} from "../order.detail.service";

@Component({
    selector: 'app-cleared-order',
    templateUrl: './cleared-order.page.html',
    styleUrls: ['./cleared-order.page.scss'],
})
export class ClearedOrderPage extends AlanIonPage implements OnInit {

    constructor(protected orderDetailService: OrderDetailService,
                protected router: Router) {
        super(orderDetailService, router);
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.orderDetailService.clear();
        }, 500);
    }

}
