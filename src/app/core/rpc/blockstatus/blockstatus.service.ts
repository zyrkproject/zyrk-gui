import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Log } from 'ng2-logger';

import { RpcStateService } from '../rpc-state/rpc-state.service';
import { PeerService } from '../peer/peer.service';

@Injectable()
export class BlockStatusService {

  private log: any = Log.create('blockstatus.service id:' + Math.floor((Math.random() * 1000) + 1));

  private highestBlockHeightNetwork: number = -1;
  private highestBlockHeightInternal: number = -1;
  private startingBlockCount: number = -1;
  private totalRemainder: number = -1;

  private lastUpdateTime: number;

  private arrayLastEstimatedTimeLefts: Array<number> = [];
  private amountToAverage: number = 100;

  public statusUpdates: Subject<any> = new Subject<any>();

  private status: any = {
    syncPercentage: 0,
    remainingBlocks: undefined,
    lastBlockTime: undefined,
    increasePerMinute: 0,
    estimatedTimeLeft: undefined,
    manuallyOpened: false,
    networkBH: -1,
    internalBH: -1
  };

  constructor(
    private _peerService: PeerService,
    private _rpcState: RpcStateService
  ) {

    this.log.d('constructor blockstatus');

    this._peerService.getBlockCount()
      .subscribe(
        height => {
          this.log.d('getBlockCount(): triggered');
          this.status.lastBlockTime = new Date(+this._rpcState.get('getblockchaininfo').mediantime * 1000);
          this.calculateSyncingDetails(height);


          if (this.highestBlockHeightInternal < height) {
            this.lastUpdateTime = Date.now();
          }

          this.highestBlockHeightInternal = height;
          this.status.internalBH = height;

          if (this.startingBlockCount === -1) {
            this.startingBlockCount = height;
          }
        },
        error => console.log('constructor blockstatus: state blocks subscription error:' + error));

    this._peerService.getBlockCountNetwork()
      .subscribe(
        height => {
          this.log.d(`getBlockCountNetwork(): new height ${height}`);
          this.highestBlockHeightNetwork = height;
          this.status.networkBH = height;
          if (this.totalRemainder === -1 && this.startingBlockCount !== -1) {
            this.totalRemainder = height - this.startingBlockCount;
          }
        },
        error => this.log.error('constructor blockstatus: getBlockCountNetwork() subscription error:' + error));
  }

  private calculateSyncingDetails(newHeight: number) {

    const internalBH = this.highestBlockHeightInternal;
    const networkBH = this.highestBlockHeightNetwork;

    if (internalBH < 0 || networkBH < 0) {
      this.status.syncPercentage = 0;
      return;
    }

    this.status.remainingBlocks = networkBH - internalBH;

    this.status.syncPercentage = internalBH / networkBH * 100;
    if (this.status.syncPercentage > 100) {
      this.status.syncPercentage = 100;
    }

    const timeDiff: number = Date.now() - this.lastUpdateTime;
    const blockDiff: number = newHeight - internalBH;

    if (timeDiff > 0 && this.totalRemainder > 0) {
      const increasePerMinute = blockDiff / this.totalRemainder * 100 * (60 * 1000 / timeDiff);
      if (increasePerMinute < 100) {
        this.status.increasePerMinute = +increasePerMinute.toFixed(2);
      } else {
        this.status.increasePerMinute = 100;
      }
    }

    if (blockDiff > 0) {
      this.estimateTimeLeft(blockDiff, timeDiff);
    }

    this.statusUpdates.next(this.status);
  }

  private getRemainder() {
    const diff = this.highestBlockHeightNetwork - this.highestBlockHeightInternal;
    return (diff < 0 ? 0 : diff);
  }

  private estimateTimeLeft(blockDiff: number, timeDiff: number) {

    let returnString = '';

    const secs = this.exponentialMovingAverageTimeLeft(Math.floor((this.getRemainder() / blockDiff * timeDiff) / 1000)),
          seconds = Math.floor(secs % 60),
          minutes = Math.floor((secs / 60) % 60),
          hours = Math.floor((secs / 3600) % 3600);

    if (hours > 0) {
      returnString += `${hours} ${hours > 1 ? 'hours' : 'hour'} `;
    }
    if (minutes > 0) {
      returnString += `${minutes} ${minutes > 1 ? 'minutes' : 'minute'} `;
    } else if (hours === 0 && seconds > 0) {
      returnString += `Any minute now!`;
    }
    if (returnString === '') {
      returnString = '∞';
    }

    this.status.estimatedTimeLeft = returnString;
  }

  private exponentialMovingAverageTimeLeft(estimatedTimeLeft: number): number {

    const length = this.arrayLastEstimatedTimeLefts.push(estimatedTimeLeft);

    if (length > this.amountToAverage) {
      this.arrayLastEstimatedTimeLefts.shift();
    }

    const k = 2 / (length - (length > 1 ? 1 : 0));

    let EMA = 0;
    this.arrayLastEstimatedTimeLefts.forEach((time, i) => {
      EMA = time * k + EMA * (1 - k);
    });

    const averageEstimatedTimeLeft = Math.floor(EMA);

    this.log.d(`exponentialMovingAverageTimeLeft(): length=${length} averageInSec=${Math.floor(averageEstimatedTimeLeft)}`);
    return averageEstimatedTimeLeft;
  }

}
