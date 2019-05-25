import { Component, OnInit, OnDestroy, ComponentRef, ViewContainerRef } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { RpcStateService, SnackbarService } from '../../../core/core.module';
import { message } from '../../business-model/enums';

@Component({
  selector: 'app-master-node1',
  templateUrl: './master-node1.component.html',
  styleUrls: ['./master-node1.component.scss']
})
export class MasterNode1Component implements OnInit, OnDestroy {
  data: any;
  masternode: any;
  private modalContainer: ViewContainerRef;
  private destroyed: boolean = false;
  modal: ComponentRef<Component>;

  constructor(public _dialogRef: MatDialogRef<MasterNode1Component>,
    private flashNotification: SnackbarService ) {
  }

  ngOnInit() {
  }

  setData(data: any) {
    this.data = data;
    this.masternode = data.masternode;
    if (this.masternode.lastSeen != 'N/A') {
      let lsDate = new Date(this.masternode.lastSeen * 1000);
      this.masternode.lastSeenDate = lsDate.toISOString();
    } else {
      this.masternode.lastSeenDate = 'N/A';
    }
  }

  copy() {
    this.flashNotification.open(message.CopiedAddress, 'info');
  }

  close(): void {
    this._dialogRef.close();
    this.modalContainer.remove();
    this.modal.destroy();
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
