import {Component} from '@angular/core';
import _ from 'underscore';
import {OrderDetailService} from '../order.detail.service';
import menuItems from '../../const/menuItems';
import {capitalize} from "@angular-devkit/core/src/utils/strings";
import {isMobileDevice} from "../../services/isMobile";
import categoriesTitles from "../../const/categoriesTitles";
import {Router} from "@angular/router";
import {AlanIonPage} from "../alan.ion.page";

@Component({
    selector: 'app-menu',
    templateUrl: 'menu.page.html',
    styleUrls: ['menu.page.scss'],
})
export class MenuPage extends AlanIonPage {
    public orderedItemsCount = 0;
    public categories: any[] = [];
    public desktop = false;
    private versionHolderClicks = 0;

    constructor(protected orderDetailService: OrderDetailService,
                protected router: Router) {
        super(orderDetailService, router);
    }

    ngOnInit() {
        this.desktop = !isMobileDevice();

        this.getOrderCount();

        this.categories = menuItems
            .map(el => el.type)
            .filter((v, i, a) => a.indexOf(v) === i).map(el => {
                const category = _.findWhere(menuItems, {type: el});
                return {
                    title: categoriesTitles[el],
                    type: capitalize(el),
                    typeIcon: category.typeIcon,
                    categoryImg: category.categoryImg,
                }
            });
    }

    getOrderCount(): void {
        this.orderDetailService.getOrderedItems().subscribe(() => {
            this.orderedItemsCount = this.orderDetailService.getOrderedItemsCount();
        });
    }

    showVersion() {
        this.versionHolderClicks++;
        if (this.versionHolderClicks > 7) {
            alert('0.0.21');
            this.versionHolderClicks = 0;
        }
    }
}
