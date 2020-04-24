import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router"
import {OrderDetailService} from '../order.detail.service';
import menuItems from '../../const/menuItems';
import _ from 'underscore';
import {
    trigger,
    state,
    style,
    animate,
    transition,
} from '@angular/animations';
import {capitalize} from "@angular-devkit/core/src/utils/strings";
import {isMobileDevice} from "../../services/isMobile";
import {isElementInViewport} from "../../services/isElementInViewport";
import {AlanIonPage} from "../alan.ion.page";
import {IonContent} from "@ionic/angular";

const animDuration = '250ms';

@Component({
    selector: 'app-category',
    templateUrl: './submenu.page.html',
    styleUrls: ['./submenu.page.scss'],
    animations: [
        trigger('itemState',
            [
                transition(':enter', [
                    style({opacity: '0'}),
                    animate(animDuration, style({opacity: '1'})),
                ]),
                transition(':leave', [
                    style({opacity: '1'}),
                    animate(animDuration, style({opacity: '0'})),
                ]),
                transition(':increment', [
                    style({transform: 'rotateY(0deg)', color: 'transparent'}),
                    animate(animDuration, style({transform: 'rotateY(-90deg)', color: 'transparent'})),
                    animate(animDuration, style({transform: 'rotateY(-180deg)', color: 'transparent'})),
                    animate(animDuration, style({color: '#fff'})),
                ]),
                transition(':decrement', [
                    style({transform: 'rotateY(0deg)', color: 'transparent'}),
                    animate(animDuration, style({transform: 'rotateY(90deg)', color: 'transparent'})),
                    animate(animDuration, style({transform: 'rotateY(180deg)', color: 'transparent'})),
                    animate(animDuration, style({color: '#fff'})),
                ]),
            ]),

        trigger('itemStateBack',
            [
                transition(':enter', [
                    style({opacity: '0'}),
                    animate(animDuration, style({opacity: '1'})),
                ]),
                transition(':leave', [
                    style({opacity: '1'}),
                    animate(animDuration, style({opacity: '0'})),
                ]),
                transition(':increment', [
                    style({transform: 'rotateY(-180deg)', color: 'transparent'}),
                    animate(animDuration, style({transform: 'rotateY(-90deg)', color: 'transparent'})),
                    animate(animDuration, style({transform: 'rotateY(0deg)', color: 'transparent'})),
                    animate(animDuration, style({color: '#fff'})),
                ]),
                transition(':decrement', [
                    style({transform: 'rotateY(180deg)', color: 'transparent'}),
                    animate(animDuration, style({transform: 'rotateY(90deg)', color: 'transparent'})),
                    animate(animDuration, style({transform: 'rotateY(0deg)', color: 'transparent'})),
                    animate(animDuration, style({color: '#fff'})),
                ]),
            ]),

        trigger('removeItemState',
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

        trigger('addItemState',
            [
                transition(':increment', [
                    style({color: 'rgb(15, 220, 96)', transform: 'scale(1)'}),
                    animate(animDuration, style({color: 'rgb(12, 176, 76)', transform: 'scale(1.11)'})),
                    animate(animDuration, style({color: 'rgb(15, 220, 96)', transform: 'scale(1)'})),
                ])
            ]),

        trigger('highlighted', [
            state('true', style({opacity: '1'})),
            state('false', style({opacity: '0'})),
            transition('false <=> true', animate(300))
        ])
    ]
})
export class SubmenuPage extends AlanIonPage {
    public category: string = '';
    public menuItems = [];
    public orderedItemsCount = 0;
    public order = [];
    public desktop = false;
    @ViewChild('list') listEl: IonContent;
    @ViewChild('header') headerEl: any;

    constructor(protected orderDetailService: OrderDetailService,
                protected router: Router,
                private activatedRoute: ActivatedRoute) {
        super(orderDetailService, router);
    }

    ngOnInit() {
        this.desktop = !isMobileDevice();
        this.category = capitalize(this.activatedRoute.snapshot.paramMap.get('category'));
        this.orderDetailService.getOrderedItems().subscribe((order: any) => {
            this.orderedItemsCount = this.orderDetailService.getOrderedItemsCount();
            this.smartOrderDataUpdate(order);
            this.calcMenuItems();
        });

        this.orderDetailService.getSyncedUi().subscribe((state: any) => {
            this.highlightItem(state.id);
        });

        this.calcMenuItems();
    }

    highlightItem(id) {
        const submenuEl = document.getElementById(id);
        const submenuElWithBorder = document.getElementById(id + '-border');

        if (submenuEl) {
            submenuElWithBorder.classList.add('highlighted');
            setTimeout(() => {
                submenuElWithBorder.classList.remove('highlighted');
            }, 400);

            if (!isElementInViewport(submenuEl)) {
                let y = submenuEl.offsetTop - this.headerEl.el.clientHeight;

                if (y < 0) {
                    y = 0;
                }
                this.listEl.scrollByPoint(0, y, 500);
            }
        }
    }

    smartOrderDataUpdate(order) {
        this.order = order;
    }

    calcMenuItems() {
        if (this.menuItems.length === 0) {
            this.menuItems = menuItems
                .filter(el => el.type === this.category.toLowerCase())
                .map(el => {
                    return {
                        ...el,
                        quantity: this.order[el.id] ? this.order[el.id].quantity : 0
                    }
                });
        } else {
            const newMenuItems = menuItems
                .filter(el => el.type === this.category.toLowerCase())
                .map(el => {
                    return {
                        ...el,
                        quantity: this.order[el.id] ? this.order[el.id].quantity : 0
                    }
                });

            for (let i = 0; i < this.menuItems.length; i++) {
                const curItem = this.menuItems[i];
                const foundedInd = _.findIndex(newMenuItems, {id: curItem.id});
                if (foundedInd >= 0) {
                    curItem.quantity = newMenuItems[foundedInd].quantity;
                }
            }
        }
    }

    addToCart(item) {
        this.orderDetailService.addOrder(item, 1);
    }

    deleteFromCart(item) {
        this.orderDetailService.deleteOrder(item, 1);
    }
}
