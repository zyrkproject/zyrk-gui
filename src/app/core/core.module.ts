import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { RpcModule } from './rpc/rpc.module';

import { IpcService } from './ipc/ipc.service';
import { RpcService } from './rpc/rpc.service';
import { ZmqService } from './zmq/zmq.service';

import { NotificationService } from './notification/notification.service';
import { BlockStatusService } from './rpc/blockstatus/blockstatus.service';
import { PeerService } from './rpc/peer/peer.service';
import { SnackbarService } from './snackbar/snackbar.service';

/*
  Loading the core library will intialize IPC & RPC
*/
@NgModule({
  imports: [
    CommonModule,
    RpcModule.forRoot() // TODO: should be here?
  ],
  exports: [
    HttpClientModule
  ],
  declarations: []
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        IpcService,
        ZmqService,
        SnackbarService,
        NotificationService
      ]
    };
  }
}

export { IpcService } from './ipc/ipc.service';
export { RpcService } from './rpc/rpc.service';
export { RpcStateService } from './rpc/rpc-state/rpc-state.service';
export { NotificationService } from './notification/notification.service';
export { BlockStatusService } from './rpc/blockstatus/blockstatus.service';
export { PeerService } from './rpc/peer/peer.service';
export { SnackbarService } from './snackbar/snackbar.service';
