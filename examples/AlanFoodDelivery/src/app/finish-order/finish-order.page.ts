import {Component, OnInit} from '@angular/core';
import {OrderDetailService} from "../order.detail.service";
import {NavController} from "@ionic/angular";
import {AlanIonPage} from "../alan.ion.page";
import {Router} from "@angular/router";

@Component({
    selector: 'app-finish-order',
    templateUrl: './finish-order.page.html',
    styleUrls: ['./finish-order.page.scss'],
})
export class FinishOrderPage extends AlanIonPage implements OnInit {

    constructor(public navCtrl: NavController,
                protected orderDetailService: OrderDetailService,
                protected router: Router) {
        super(orderDetailService, router);
    }

    ngOnInit() {
    }

    goToMenu() {
        this.orderDetailService.clear();
        this.navCtrl.navigateBack(['/']);
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.orderDetailService.clear();
        }, 500);
    }
}
