import { Component, OnInit, Input } from '@angular/core';
import { faCircle as faCircleSolid,faCopy,faTimes,faFileAlt, faCaretSquareRight, faCog, faCheckCircle, faRedo} from '@fortawesome/free-solid-svg-icons';
import { faCircle,faEdit } from '@fortawesome/free-regular-svg-icons';
import { ModalsService } from '../../../modals/modals.service';
import { WalletService } from '../../../wallet.service';
import { RpcStateService } from '../../../../core/core.module';
import { SnackbarService } from '../../../../core/core.module';
import { ApiEndpoints, message } from '../../../business-model/enums';
import { Log } from 'ng2-logger';
import {
  IPassword,
  encryptpassword
} from '../../../business-model/entities';

export interface MasterElement {
  name: string;
  status: string;
  address: string;
  activefor: string;
  action1: string;
  action2: string;
  action3: string;
}

@Component({
  selector: 'app-master-node',
  templateUrl: './master-node.component.html',
  styleUrls: ['./master-node.component.scss']
})
export class MasterNodeComponent implements OnInit {
  @Input() masterNodes: Array<any>;

  private destroyed: boolean = false;
  private log: any = Log.create('Masternode.component');
  faCircle: any = faCircle;
  faFileAlt: any = faFileAlt;
  faTimes: any = faTimes;
  faCopy: any = faCopy;
  faEdit: any = faEdit;
  faCog: any = faCog;
  faCheckCircle: any = faCheckCircle;
  faRedo: any = faRedo;
  displayedColumns = ["Name", "Status", "Address", "Detail", "Start", "Update"];
  dataSource = [];
  currentNode: any;

  constructor(
    private modalsService: ModalsService,
    private walletServices: WalletService,
    private flashNotification: SnackbarService,
    private _rpcState: RpcStateService) { }

  ngOnInit() {
  }

  openDetail(node: any) {
    const data: any = {
      forceOpen: true,
      modalsService: this.modalsService,
      masternode: node
    };
    this.modalsService.openSmall('masterNode1', data);
  }

  startNode(node: any) {
    this.currentNode = node;
    const data: any = {
      forceOpen: true,
      modalsService: this.modalsService,
      parentRef: this,
      address: node.address,
      title: 'Start Masternode',
      forStaking: false
    };
    this.modalsService.openSmall('passwordInput', data);
  }

  updateZYRK(node: any) {
    const data: any = {
      forceOpen: true,
      modalsService: this.modalsService,
      address: node.address,
      aliasName: node.alias,
      title: 'Update Zyrk Version',
      rpcCommand: 'update-zyrk-version',
      forStaking: false
    };
    this.modalsService.openSmall('vpsPassword', data);
  }

  passwordEntered(passphrase: IPassword) {
    this.walletServices.startMasternode(this.currentNode.alias)
      .takeWhile(() => !this.destroyed)
      .subscribe(res => {
        if (res.result == "successful") {

        } else {
          this.flashNotification.open(res.errorMessage, 'err')
        }
        this.walletServices.walletlock()
          .takeWhile(() => !this.destroyed)
          .subscribe(res => {
          });
      });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
