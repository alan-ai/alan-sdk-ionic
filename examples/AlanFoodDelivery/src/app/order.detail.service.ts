import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrderDetailService {

    private items: any = {};
    private behaviorSubjectItems: BehaviorSubject<any> = new BehaviorSubject<any>(this.items);

    private address: string = '';
    private behaviorSubjectAddress: BehaviorSubject<string> = new BehaviorSubject<string>(this.address);

    private time: string = '';
    private behaviorSubjectTime: BehaviorSubject<string> = new BehaviorSubject<string>(this.time);

    private date: string = '';
    private behaviorSubjectDate: BehaviorSubject<string> = new BehaviorSubject<string>(this.date);

    private uiSyncState: any = {};
    private behaviorSubjectUiSyncEvent: BehaviorSubject<any> = new BehaviorSubject<any>(this.uiSyncState);

    private uiSyncRoute: string = '';
    private behaviorSubjectUiSyncRoute: BehaviorSubject<string> = new BehaviorSubject<string>(this.uiSyncRoute);


    constructor() {
    }

    getOrderedItems() {
        return this.behaviorSubjectItems;
    }

    getAddress() {
        return this.behaviorSubjectAddress;
    }

    getTime() {
        return this.behaviorSubjectTime;
    }

    getDate() {
        return this.behaviorSubjectDate;
    }

    getSyncedUi() {
        return this.behaviorSubjectUiSyncEvent;
    }

    getSyncedRoute() {
        return this.behaviorSubjectUiSyncRoute;
    }

    addOrder(item: any, quantity: number) {
        if (this.items[item.id]) {
            this.items[item.id].quantity = this.items[item.id].quantity + quantity;
        } else {
            this.items[item.id] = {...item, ...{quantity: quantity}};
        }
        this.behaviorSubjectItems.next(this.items);

        console.info('Items after adding:', this.items);
    }

    deleteOrder(item: any, quantity: number) {
        if (this.items[item.id]) {
            this.items[item.id].quantity = this.items[item.id].quantity - quantity;
            if (this.items[item.id].quantity <= 0) {
                delete this.items[item.id];
            }
        }
        this.behaviorSubjectItems.next(this.items);

        console.info('Items after removing:', this.items);
    }

    clearOrder() {
        this.items = {};
        this.behaviorSubjectItems.next(this.items);
    }

    setAddress(address) {
        this.address = address;
        this.behaviorSubjectAddress.next(this.address);
    }

    setTime(time) {
        this.time = time;
        this.behaviorSubjectTime.next(this.time);
    }

    setDate(date) {
        this.date = date;
        this.behaviorSubjectDate.next(this.date);
    }

    getOrderedItemsCount() {
        return Object.keys(this.items).reduce((sum, key) => this.items[key].quantity + sum, 0);
    }

    getTotal() {
        const order = this.items;
        return Object.keys(order).reduce((sum, key) => (order[key].price * order[key].quantity) + sum, 0);
    }

    syncUi(data) {
        this.uiSyncState = data;
        this.behaviorSubjectUiSyncEvent.next(this.uiSyncState);
    }

    syncRoute(route) {
        this.uiSyncRoute = route;
        this.behaviorSubjectUiSyncRoute.next(this.uiSyncRoute);
    }


    clear() {
        this.clearOrder();
        this.setAddress('');
        this.setTime('');
        this.setDate('');
    }
}
