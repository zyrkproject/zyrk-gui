import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
  AfterViewChecked
} from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Log } from 'ng2-logger';

import { RpcService, RpcStateService } from '../../../../../core/core.module';
import { SnackbarService } from '../../../../../core/snackbar/snackbar.service';
import { Command } from './command.model';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent implements OnInit, AfterViewChecked {

  @ViewChild('debug') private commandContainer: ElementRef;
  log: any = Log.create('app-console-modal');

  public commandList: Command[] = [];
  public commandHistory: Array<string> = [];
  public command: string;
  public currentTime: string;
  public disableScrollDown: boolean = false;
  public waitingForRPC: boolean = true;
  public historyCount: number = 0;

  constructor(private _rpc: RpcService,
              private _rpcState: RpcStateService,
              private snackbar: SnackbarService) {
  }

  ngOnInit() {
    this.getCurrentTime();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  rpcCall() {

    this.waitingForRPC = false;
    this.commandHistory.push(this.command);
    this.historyCount = this.commandHistory.length;
    const params = this.command.trim().split(' ')
                    .filter(cmd => cmd.trim() !== '');
    this.log.d(params);

    this._rpc.call(params.shift(), params)
      .subscribe(
        response => this.formatSuccessResponse(response),
        error => this.formatErrorResponse(error));
  }

  formatSuccessResponse(response: any) {
    this.waitingForRPC = true;
    this.commandList.push(new Command(1, this.command, this.getDateFormat()),
      new Command(2, response, this.getDateFormat(), 200));
    this.command = '';
    this.scrollToBottom();
  }

  formatErrorResponse(error: any) {
    this.waitingForRPC = true;
    if (error.code === -1) {
      this.commandList.push(new Command(1, this.command, this.getDateFormat()),
        new Command(2, error.message, this.getDateFormat(), -1));
      this.command = '';
      this.scrollToBottom();
    } else {
      const erroMessage = (error.message) ? error.message : 'Method not found';
      this.snackbar.open(erroMessage, 'err');
      this.command = '';
    }
  }

  isJson(text: any) {
    return (typeof text === 'object');
  }

  clearCommands() {
    this.commandList = [];
  }

  getCurrentTime() {
    this.currentTime = this.getDateFormat();
  }

  getDateFormat() {
    return this.hourSecFormatter(new Date());
  }

  public hourSecFormatter(date) {
    return (
      (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' +
      (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':' +
      (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
    )
  }

  scrollToBottom() {
    if (this.disableScrollDown) {
      return
    }
    this.commandContainer.nativeElement.scrollTop = this.commandContainer.nativeElement.scrollHeight;
  }

  onScroll() {
    const element = this.commandContainer.nativeElement
    const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight
    if (this.disableScrollDown && atBottom) {
      this.disableScrollDown = false
    } else {
      this.disableScrollDown = true
    }
  }

  manageCommandHistory(code: number) {
    if (code === 38) {
      if (this.historyCount > 0) {
        this.historyCount--;
      }
    } else {
      if (this.historyCount <= this.commandHistory.length) {
        this.historyCount++;
      }
    }
    this.command = this.commandHistory[this.historyCount];
  }

  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: any) {
    if ([13, 38, 40].includes(event.keyCode)) {
      event.preventDefault();
    }
    if (event.keyCode === 13 && this.command && this.waitingForRPC) {
      this.disableScrollDown = false;
      this.rpcCall();
    } else if (event.ctrlKey && event.keyCode === 76) {
      this.clearCommands();
    } else if ([38, 40].includes(event.keyCode) && this.commandHistory.length > 0) {
      this.manageCommandHistory(event.keyCode);
    }
  }

  close(): void {
  }

}
