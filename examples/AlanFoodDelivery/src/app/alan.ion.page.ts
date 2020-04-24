import {Router} from "@angular/router";
import {OrderDetailService} from "./order.detail.service";

export class AlanIonPage {

    constructor(protected orderDetailService: OrderDetailService,
                protected router: Router) {

    }

    ionViewWillEnter() {
        this.orderDetailService.syncRoute(decodeURI(this.router.url));
    }
}
