import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
    {path: '', redirectTo: 'menu', pathMatch: 'full'},
    {path: 'menu', loadChildren: './menu/menu.module#MenuPageModule'},
    {path: 'menu/:category', loadChildren: './submenu/submenu.module#CategoryPageModule'},
    {path: 'cart', loadChildren: './cart/cart.module#CartPageModule'},
    {path: 'address', loadChildren: './address/address.module#AddressPageModule'},
    {path: 'time', loadChildren: './time/time.module#TimePageModule'},
    {path: 'finish-order', loadChildren: './finish-order/finish-order.module#FinishOrderPageModule'},
    {path: 'cleared-order', loadChildren: './cleared-order/cleared-order.module#ClearedOrderPageModule'},
    {path: 'date', loadChildren: './date/date.module#DatePageModule'},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
