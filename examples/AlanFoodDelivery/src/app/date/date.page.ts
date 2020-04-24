import {Component, OnInit} from '@angular/core';
import {OrderDetailService} from '../order.detail.service';
import {NavController} from '@ionic/angular';
import {AlanIonPage} from "../alan.ion.page";
import {Router} from "@angular/router";

@Component({
    selector: 'app-date',
    templateUrl: './date.page.html',
    styleUrls: ['./date.page.scss'],
})
export class DatePage extends AlanIonPage implements OnInit {

    public date: string = null;

    constructor(private navCtrl: NavController,
                protected orderDetailService: OrderDetailService,
                protected router: Router) {
        super(orderDetailService, router);
    }

    ngOnInit() {
        this.orderDetailService.getDate().subscribe((date: string) => {
            this.date = date;
        });
    }

    saveDate() {
        this.orderDetailService.setDate(this.date);
        this.navCtrl.navigateBack(['/cart']);
    }

}
