import {Component, OnInit} from '@angular/core';
import {OrderDetailService} from '../order.detail.service';
import {NavController} from '@ionic/angular';
import {Router} from "@angular/router";
import {AlanIonPage} from "../alan.ion.page";

@Component({
    selector: 'app-address',
    templateUrl: './address.page.html',
    styleUrls: ['./address.page.scss'],
})
export class AddressPage extends AlanIonPage implements OnInit {

    address: string = null;

    constructor(private navCtrl: NavController,
                protected orderDetailService: OrderDetailService,
                protected router: Router) {
        super(orderDetailService, router);
    }

    ngOnInit() {
        this.orderDetailService.getAddress().subscribe((address: string) => {
            this.address = address;
        });
    }

    saveAddress() {
        this.orderDetailService.setAddress(this.address);
        this.navCtrl.navigateBack(['/cart']);
    }

}
