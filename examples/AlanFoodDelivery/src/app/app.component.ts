import {Component, ElementRef, ViewChild} from '@angular/core';
import {Platform, NavController} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {OrderDetailService} from './order.detail.service';
import _ from "underscore";
import "@alan-ai/alan-button";
import menuItems from '../const/menuItems';
import {Router} from "@angular/router";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    private total: number = 0;
    private order: any;
    private time: string;
    private date: string;
    private address: string;
    private visualState: any = {};
    private greetingWasSaid: boolean = false;
    @ViewChild('alanBtnEl') alanBtnComponent: ElementRef<HTMLAlanButtonElement>;

    constructor(private platform: Platform,
                private splashScreen: SplashScreen,
                private statusBar: StatusBar,
                public navCtrl: NavController,
                private router: Router,
                private orderDetailService: OrderDetailService) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            this.orderDetailService.syncRoute(this.router.url);
        });
    }

    ngOnInit() {
        this.orderDetailService.getOrderedItems().subscribe((order: any) => {
            this.total = Object.keys(order).reduce((summ, key) => order[key].price + summ, 0);
            this.order = order;
            this.updateOrderVisualState();
        });
        this.orderDetailService.getAddress().subscribe((address: string) => {
            this.address = address;
            this.updateAddressVisualState();
        });
        this.orderDetailService.getTime().subscribe((time: string) => {
            this.time = time;
            this.updateTimeAndDateVisualState();
        });
        this.orderDetailService.getDate().subscribe((date: string) => {
            this.date = date;
            this.updateTimeAndDateVisualState();
        });
        this.orderDetailService.getSyncedRoute().subscribe((route: string) => {
            if (route) {
                this.updateVisualState({route: route});
            }
        });
    }

    ngAfterViewInit() {
        // add event listener for connectionStatus,
        // when connection established we greet a user in the app
        this.alanBtnComponent.nativeElement.addEventListener('connectionStatus', (data) => {
            const connectionStatus = (<CustomEvent>data).detail;
            if (connectionStatus === 'connected') {
                if (!this.greetingWasSaid) {
                    this.greetUserForFirstTime();
                    this.greetingWasSaid = true
                }
            }
        });

        // add event listener for commands which we received from the alan server
        this.alanBtnComponent.nativeElement.addEventListener('alanCommand', (data) => {
            const commandData = (<CustomEvent>data).detail;

            console.info('Command was received: ', commandData);

            if (commandData.command === 'addToCart') {
                const foodItem = _.findWhere(menuItems, {id: commandData.item});
                if (foodItem) {
                    this.orderDetailService.addOrder(foodItem, commandData.quantity);
                }
            }

            if (commandData.command === 'removeFromCart') {
                const foodItem = _.findWhere(menuItems, {id: commandData.item});
                if (foodItem) {
                    this.orderDetailService.deleteOrder(foodItem, commandData.quantity);
                }
            }

            if (commandData.command === 'address') {
                this.orderDetailService.setAddress(commandData.address);
                this.updateAddressVisualState();
            }

            if (commandData.command === 'time') {
                this.orderDetailService.setTime(commandData.time);

                if (commandData.date) {
                    this.orderDetailService.setDate(commandData.date);
                }
                this.updateAddressVisualState();
            }

            if (commandData.command === 'navigation') {
                if (commandData.action === 'back') {
                    if (this.visualState.route &&
                        this.visualState.route.indexOf('/menu/') > -1) {
                        this.navCtrl.navigateBack(['/']);
                    } else {
                        this.navCtrl.pop();
                    }
                } else {
                    if (this.visualState.route &&
                        this.visualState.route.toLowerCase() !== commandData.route.toLowerCase()) {
                        this.navCtrl.navigateForward([commandData.route]);
                    }
                }
            }

            if (commandData.command === 'highlight') {
                this.orderDetailService.syncUi(commandData);
            }

            if (commandData.command === 'clearOrder') {
                this.navCtrl.navigateForward(['/cleared-order']);
            }

            if (commandData.command === 'finishOrder') {
                this.navCtrl.navigateForward(['/finish-order']);
            }
        });
    }

   async greetUserForFirstTime() {
        this.alanBtnComponent.nativeElement.componentOnReady().then(async () => {
            try {
                await this.alanBtnComponent.nativeElement.activate();
                this.alanBtnComponent.nativeElement.callProjectApi("greet", {}, () => { });
            } catch(e) {
                console.info('DEBUG', e);
            }
        });
    }

    updateOrderVisualState() {
        this.updateVisualState({order: this.order, total: this.orderDetailService.getTotal()});
    }

    updateAddressVisualState() {
        this.updateVisualState({address: this.address});
    }

    updateTimeAndDateVisualState() {
        this.updateVisualState({time: this.time, date: this.date});
    }

    updateVisualState(data) {
        this.visualState = {...this.visualState, ...data};
        this.alanBtnComponent.nativeElement.setVisualState(this.visualState);
    }
}
