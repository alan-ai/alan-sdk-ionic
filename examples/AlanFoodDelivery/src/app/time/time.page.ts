import {Component, OnInit} from '@angular/core';
import {OrderDetailService} from '../order.detail.service';
import {NavController} from '@ionic/angular';
import {AlanIonPage} from "../alan.ion.page";
import {Router} from "@angular/router";

@Component({
    selector: 'app-time',
    templateUrl: './time.page.html',
    styleUrls: ['./time.page.scss'],
})
export class TimePage extends AlanIonPage implements OnInit {

    public time: string = null;

    constructor(private navCtrl: NavController,
                protected orderDetailService: OrderDetailService,
                protected router: Router) {
        super(orderDetailService, router);
    }

    ngOnInit() {
        this.orderDetailService.getTime().subscribe((time: string) => {
            this.time = time;
        });
    }

    saveTime() {
        this.orderDetailService.setTime(this.time);
        this.navCtrl.navigateBack(['/cart']);
    }

}
