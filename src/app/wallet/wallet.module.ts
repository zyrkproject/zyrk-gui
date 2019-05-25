import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { ModalsModule } from './modals/modals.module';
import { SharedModule } from './shared/shared.module';

import { routing } from './wallet.routing';

import { FilterService } from './transactions/filter.service';
import { HttpClientModule } from '@angular/common/http'; 
import {HttpModule} from '@angular/http';

import { MainComponent } from './main/main.component';
import { OverviewComponent } from './overview/overview.component';
import { ZyopComponent } from './zyop/zyop.component';
import { TransactionsComponent } from './transactions/transaction.component';
import { AddressbookComponent } from './addressbook/addressbook.component';
import { CreateComponent } from './create/create.component';
import { MultinodesComponent } from './multinodes/multinodes.component';
import { AllMasterNodeComponent } from './multinodes/all-master-node/all-master-node.component';
import { UpdatesComponent } from './updates/updates.component';
import { MasterNodeComponent } from './multinodes/table/master-node/master-node.component';
import { SettingComponent } from './setting/setting/setting.component';
import { SecurityComponent } from './setting/setting/preference/security/security.component';
import { HelpComponent } from './help/help.component';
import { WalletLogService } from './wallet.log.service';
import { WalletService } from './wallet.service';
import { CalculationsService } from './calculations.service';
import { ClipboardModule } from 'ngx-clipboard';
import { ChartsModule } from 'ng2-charts';
import { ProgressBarModule } from 'angular-progress-bar';
import { ConsoleComponent } from './setting/setting/preference/console/console.component';

@NgModule({
  declarations: [
    CreateComponent,
    MainComponent,
    OverviewComponent,
    TransactionsComponent,
    AddressbookComponent,
    ZyopComponent,
    MultinodesComponent,
    AllMasterNodeComponent,
	  UpdatesComponent,
    MasterNodeComponent,
    SettingComponent,
    SecurityComponent,
    AddressbookComponent,
    HelpComponent,
    ConsoleComponent,
  ],
  imports: [
    ModalsModule,
    routing,
    SharedModule,
    HttpClientModule,
    HttpModule,
    ClipboardModule,
    ChartsModule,
    ProgressBarModule
  ],
  exports: [
    MainComponent,
  ],
  providers: [FilterService,WalletService,WalletLogService,CalculationsService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class WalletModule {
  constructor() {
  }
}
