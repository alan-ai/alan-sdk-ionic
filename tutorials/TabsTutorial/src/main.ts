import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import {defineCustomElements as alanBtnDefineCustomElements} from '@alan-ai/alan-button/dist/loader';

if (environment.production) {
  enableProdMode();
}

alanBtnDefineCustomElements(window);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
