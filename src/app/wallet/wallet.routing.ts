import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CreateComponent } from './create/create.component';
import { MainComponent } from './main/main.component';
import { OverviewComponent } from './overview/overview.component';
import { TransactionsComponent } from './transactions/transaction.component';
import { AddressbookComponent } from './addressbook/addressbook.component';
import { ZyopComponent } from './zyop/zyop.component';
import { MultinodesComponent } from './multinodes/multinodes.component';
import { AllMasterNodeComponent } from './multinodes/all-master-node/all-master-node.component';
import { SettingComponent } from './setting/setting/setting.component';
import { UpdatesComponent } from './updates/updates.component';
import { HelpComponent } from './help/help.component';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'create', component: CreateComponent, data: { title: 'Create', page: 'create' } },
  {
    path: 'main',
    component: MainComponent,
    data: { title: 'Main', page: 'main' },
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent, data: { title: 'Overview', page: 'overview' } },
      { path: 'zyop', component: ZyopComponent, data: { title: 'Zyop', page: 'zyop' } },
      { path: 'transactions', component: TransactionsComponent, data: { title: 'Transaction History', page: 'transactions' } },
      { path: 'addressbook', component: AddressbookComponent, data: { title: 'Address Book', page: 'addressbook' } },
      { path: 'multinodes/all-master-node', component: AllMasterNodeComponent, data: { title: 'All Masternodes', page: 'all-master-node' } },
      { path: 'multi/nodes', component: MultinodesComponent, data: { title: 'Multi  Nodes', page: 'mulitinodes' } },
      { path: 'settings', component: SettingComponent, data: { title: 'Settings' } },
      { path: 'updates', component: UpdatesComponent, data: { title: 'Updates', page: 'updates' } },
      { path: 'help', component: HelpComponent, data: { title: 'Help', page: 'help' } },
    ]
  },
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
