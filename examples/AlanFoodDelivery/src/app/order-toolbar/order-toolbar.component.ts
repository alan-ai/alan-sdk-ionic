import {Component, OnInit, Input} from '@angular/core';
import {OrderDetailService} from "../order.detail.service";
import {
    trigger,
    style,
    animate,
    transition,
} from '@angular/animations';
import categories from "../../const/categories";
import {isMobileDevice} from "../../services/isMobile";

const animDuration = '250ms';

@Component({
    selector: 'app-order-toolbar',
    templateUrl: './order-toolbar.component.html',
    styleUrls: ['./order-toolbar.component.scss'],
    animations: [
        trigger('foodIcon',
            [
                transition(':enter', [
                    style({
                        opacity: '0',
                    }),
                    animate(animDuration, style({
                        opacity: '1',
                    })),
                ]),
                transition(':leave', [
                    style({
                        opacity: '1',
                    }),
                    animate(animDuration, style({
                        opacity: '0',
                    })),
                ]),
            ]),
    ]
})
export class OrderToolbarComponent implements OnInit {

    public pizzaCount = 0;
    public drinksCount = 0;
    public dessertCount = 0;
    public streetFoodCount = 0;
    public orderedItemsCount = 0;
    public desktop = false;

    constructor(private  orderDetailService: OrderDetailService) {
    }

    ngOnInit() {
        this.desktop = !isMobileDevice();

        this.orderDetailService.getOrderedItems().subscribe((order: any) => {
            this.orderedItemsCount = this.orderDetailService.getOrderedItemsCount();
            this.pizzaCount = this.getTotalOrderCountByCategory(order, categories.pizza);
            this.streetFoodCount = this.getTotalOrderCountByCategory(order, categories.streetFood);
            this.dessertCount = this.getTotalOrderCountByCategory(order, categories.desserts);
            this.drinksCount = this.getTotalOrderCountByCategory(order, categories.drinks);
        });
    }

    getTotalOrderCountByCategory(order, category) {
        return Object.keys(order).reduce((sum, key) => {
            if (order[key].type === category) {
                return order[key].quantity + sum;
            }
            return sum;
        }, 0);
    }
}
