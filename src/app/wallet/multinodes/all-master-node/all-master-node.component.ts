import { Component, OnInit, Input } from '@angular/core';
import { faCircle as faCircleSolid,faCopy,faTimes,faFileAlt} from '@fortawesome/free-solid-svg-icons';
import { faCircle,faEdit } from '@fortawesome/free-regular-svg-icons';
import { Router } from '@angular/router';
import { RpcStateService } from '../../../core/core.module';
import { ApiEndpoints, message } from '../../business-model/enums';
import { Log } from 'ng2-logger';

export interface MasterElement {
  status: String, 
  protocol: String, 
  payee: String,
  lastseen: String,
  activeseconds: String,
  lastpaidtime: String,
  lastpaidblock: String,
  IP: String
}

@Component({
  selector: 'app-all-master-node',
  templateUrl: './all-master-node.component.html',
  styleUrls: ['./all-master-node.component.scss']
})
export class AllMasterNodeComponent implements OnInit {
  @Input() masterNodes: Array<any>;

  private destroyed: boolean = false;
  private log: any = Log.create('AllMasternode.component');
  faCircle: any = faCircle;
  faFileAlt: any = faFileAlt;
  faTimes: any = faTimes;
  faCopy: any = faCopy;
  faEdit: any = faEdit;
  faCircleSolid: any = faCircleSolid;
  displayedColumns = ["Address", "Protocol", "Status", "Last Seen","Payee"];
  dataSource: Array<MasterElement> = [];
  constructor(
    private router: Router,
    private _rpcState: RpcStateService) { }

  ngOnInit() {
    this._rpcState.registerStateCall(ApiEndpoints.MasternodeList, 120000, ['full']);
    this.getAllMasterNodes();
  }

  private getAllMasterNodes() {
    this._rpcState.observe(ApiEndpoints.MasternodeList)
      .takeWhile(() => !this.destroyed)
      .subscribe(res => {
        let nodes: Array<MasterElement> = [];
        for (let node in res) {
          const nodeStr = res[node].trim();
          let elements: Array<String> = nodeStr.split(' ');
          elements = elements.filter( el => el.length > 0 );
          if (elements.length == 8) {
            const nodeObj: MasterElement = {
              status: elements[0], 
              protocol: elements[1], 
              payee: elements[2],
              lastseen: elements[3],
              activeseconds: elements[4],
              lastpaidtime: elements[5],
              lastpaidblock: elements[6],
              IP: elements[7]
            }
            nodes.push(nodeObj);
          }
        }
        this.dataSource = nodes;
      },
        error => this.log.error(message.recentTransactionMessage, error));
  }

  goToMasternodes() {
    this.router.navigate(['./main/multi/nodes']);
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
