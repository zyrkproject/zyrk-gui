import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Log, Level } from 'ng2-logger';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  Log.setProductionMode();
  enableProdMode();
}

if (environment.envName === 'dev') {
  Log.onlyModules('(.*?)');
}

const log: any = Log.create('main');

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(success => log.d('Ready. (env: ' + environment.envName + ')'))
  .catch(err => console.error(err));
