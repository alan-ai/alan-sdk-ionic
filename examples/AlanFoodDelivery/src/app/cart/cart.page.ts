import {Component} from '@angular/core';
import {NavController} from '@ionic/angular';
import _ from 'underscore';
import menuItems from '../../const/menuItems';
import {OrderDetailService} from '../order.detail.service';

import {
    trigger,
    style,
    animate,
    transition,
} from '@angular/animations';
import {isMobileDevice} from "../../services/isMobile";
import {AlanIonPage} from "../alan.ion.page";
import {Router} from "@angular/router";

const animDuration = '250ms';

@Component({
    selector: 'app-cart',
    templateUrl: 'cart.page.html',
    styleUrls: ['cart.page.scss'],
    animations: [
        trigger('removeItemStateOnCart',
            [
                transition(':enter', [
                    style({opacity: '0'}),
                    animate(animDuration, style({opacity: '1'})),
                ]),
                transition(':leave', [
                    style({opacity: '1'}),
                    animate(animDuration, style({opacity: '0'})),
                ]),
                transition(':decrement', [
                    style({color: 'rgb(240, 65, 65)', transform: 'scale(1)'}),
                    animate(animDuration, style({color: 'rgb(192, 52, 52)', transform: 'scale(1.11)'})),
                    animate(animDuration, style({color: 'rgb(240, 65, 65)', transform: 'scale(1)'})),
                ])
            ]),

        trigger('addItemStateOnCart',
            [
                transition(':increment', [
                    style({color: 'rgb(15, 220, 96)', transform: 'scale(1)'}),
                    animate(animDuration, style({color: 'rgb(12, 176, 76)', transform: 'scale(1.11)'})),
                    animate(animDuration, style({color: 'rgb(15, 220, 96)', transform: 'scale(1)'})),
                ])
            ]),
    ]
})

export class CartPage extends AlanIonPage {
    public orderedItems: any[] = [];
    public address: string = '';
    public time: string = '';
    public date: string = '';
    public orderedItemsCount: number = 0;
    public total: number = 0;
    public desktop = false;

    constructor(protected orderDetailService: OrderDetailService,
                protected router: Router,
                public navCtrl: NavController) {
        super(orderDetailService, router);
    }

    ngOnInit() {
        this.desktop = !isMobileDevice();
        this.getOrder();
    }

    getOrder(): void {
        this.orderDetailService.getOrderedItems().subscribe((order: any) => {
            this.orderedItemsCount = this.orderDetailService.getOrderedItemsCount();
            this.total = this.orderDetailService.getTotal();
            this.calcOrderedItems(order);
        });
        this.orderDetailService.getAddress().subscribe((address: string) => {
            this.address = address;
        });

        this.orderDetailService.getTime().subscribe((time: string) => {
            this.time = time;
        });

        this.orderDetailService.getDate().subscribe((date: string) => {
            this.date = date;
        });

        this.orderDetailService.getSyncedUi().subscribe((state: any) => {
            this.highlightItem(state.id);
        });
    }

    highlightItem(id) {
        const el = document.getElementById(id);

        if (el) {
            el.scrollIntoView({behavior: "smooth"});
            el.classList.add('highlighted');
            setTimeout(() => {
                el.classList.remove('highlighted');
            }, 1000);
        }
    }

    calcOrderedItems(order) {
        // we need to convert the order object into array,
        // because otherwise there will be blinking problems with
        // the view on mobile devices
        if (this.orderedItems.length === 0) {
            this.orderedItems = Object.keys(order).map(key => {
                return order[key];
            });
        } else {
            const newItems = Object.keys(order).map(key => {
                return order[key];
            });

            for (let i = 0; i < this.orderedItems.length; i++) {
                this.orderedItems[i].deleteInFuture = true;
            }

            for (let i = 0; i < newItems.length; i++) {
                const ind = _.findIndex(this.orderedItems, {id: newItems[i].id});
                if (ind > -1) {
                    this.orderedItems[ind].quantity = newItems[i].quantity;
                    this.orderedItems[ind].deleteInFuture = false;
                } else {
                    this.orderedItems.push(newItems[i]);
                }
            }

            for (let i = 0; i < this.orderedItems.length; i++) {
                const ind = _.findIndex(newItems, {id: this.orderedItems[i].id});
                if (ind === -1) {
                    this.orderedItems.splice(i, 1);
                }
            }
        }
    }

    clearOrder() {
        this.navCtrl.navigateBack(['/cleared-order']);
    }

    addToCart(id) {
        this.orderDetailService.addOrder(menuItems.filter(el => el.id === id)[0], 1);
    }

    deleteFromCart(id) {
        this.orderDetailService.deleteOrder(menuItems.filter(el => el.id === id)[0], 1);
    }
}
