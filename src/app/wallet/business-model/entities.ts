import { TxType } from "./enums";


// main wallet infor ui
export interface IWalletInfo {
    "walletname": string,
    "walletversion": number,
    "balance": number,
    "anonymize_vault": number,
    "anonymize_vault_unconfirmed": number,
    "unconfirmed_balance": number,
    "immature_balance": number,
    "txcount": number,
    "keypoololdest": number,
    "keypoolsize": number,
    "keypoolsize_hd_internal": number,
    "reserve": number,
    "encryptionstatus": string,
    "unlocked_until": number,
    "paytxfee": number,
    "hdmasterkeyid": string
}

export class WalletInfo implements IWalletInfo {

    "walletname": string;
    "walletversion": number;
    "balance": number;
    "anonymize_vault": number;
    "anonymize_vault_unconfirmed": number;
    "unconfirmed_balance": number;
    "immature_balance": number;
    "txcount": number;
    "keypoololdest": number;
    "keypoolsize": number;
    "keypoolsize_hd_internal": number;
    "reserve": number;
    "encryptionstatus": string;
    "unlocked_until": number;
    "paytxfee": number;
    "hdmasterkeyid": string

    constructor(data?: IWalletInfo) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.walletname = data["walletname"];
            this.walletversion = data["walletversion"];
            this.balance = data["balance"];
            this.anonymize_vault = data["anonymize_vault"];
            this.anonymize_vault_unconfirmed = data["anonymize_vault_unconfirmed"];
            this.unconfirmed_balance = data["unconfirmed_balance"];
            this.immature_balance = data["immature_balance"];
            this.txcount = data["txcount"];
            this.keypoololdest = data["keypoololdest"];
            this.keypoolsize = data["keypoolsize"];
            this.keypoolsize_hd_internal = data["keypoolsize_hd_internal"];
            this.reserve = data["reserve"];
            this.encryptionstatus = data["encryptionstatus"];
            this.paytxfee = data["paytxfee"];
            this.hdmasterkeyid = data["hdmasterkeyid"];

        }
    }

    static fromJS(data: any): WalletInfo {
        let result = new WalletInfo();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["balance"] = this.balance;
        data["walletname"] = this.walletname;
        data["anonymize_vault"] = this.anonymize_vault === undefined ? 0.00000000 : this.anonymize_vault;
        data["anonymize_vault_unconfirmed"] = this.anonymize_vault_unconfirmed === undefined ? 0.00000000 : this.anonymize_vault_unconfirmed;
        data["encryptionstatus"] = this.encryptionstatus;
        data["walletversion"] = this.walletversion;
        data["unconfirmed_balance"] = this.unconfirmed_balance;
        data["immature_balance"] = this.immature_balance;
        data["txcount"] = this.txcount;
        data["keypoololdest"] = this.keypoololdest;
        data["keypoolsize"] = this.keypoolsize;
        data["keypoolsize_hd_internal"] = this.keypoolsize_hd_internal;
        data["reserve"] = this.reserve;
        data["paytxfee"] = this.paytxfee;
        data["hdmasterkeyid"] = this.hdmasterkeyid;
        return data;
    }
}

export interface IWalletSendToZyrk {
    id: string;
    amount: number;
    address: string;
    saveForFuture: boolean;
    subtractFeeFromAmount: boolean;
}

export class WalletSendToZyrk implements IWalletSendToZyrk {

    id: string;
    amount: number;
    address: string;
    saveForFuture: boolean;
    subtractFeeFromAmount: boolean;

    constructor(data?: IWalletSendToZyrk) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.id = data["id"];
            this.amount = data["amount"];
            this.address = data["address"];
            this.saveForFuture = data["saveForFuture"];
            this.subtractFeeFromAmount = data["subtractFeeFromAmount"];
        }
    }

    static fromJS(data: any): WalletSendToZyrk {
        let result = new WalletSendToZyrk();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["amount"] = this.amount;
        data["address"] = this.address;
        data["saveForFuture"] = this.saveForFuture;
        data["subtractFeeFromAmount"] = this.subtractFeeFromAmount;
        return data;
    }
}

export interface IRecieveZyrkToWallet {
    account: string;
    addresses: Array<any>;
}

export class RecieveZyrkToWallet implements IRecieveZyrkToWallet {
    account: string;
    addresses: Array<any>;

    constructor(data?: IRecieveZyrkToWallet) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

}

export interface ITransactionBuilder {
    id: string;
    input: TxType;
    output: TxType;
    toAddress: string;
    toLabel: string;
    address: string;
    amount: number;
    comment: string;
    commentTo: string;
    narration: string;
    numsignatures: number;
    validAddress: boolean;
    validAmount: boolean;
    isMine: boolean;
    currency: string;
    ringsize: number;
    subtractFeeFromAmount: boolean;
    estimateFeeOnly: boolean;
}

export class TransactionBuilder implements ITransactionBuilder {

    id: string;
    input: TxType = TxType.PUBLIC;
    output: TxType = TxType.PUBLIC;
    toAddress: string;
    toLabel: string;
    address: string;
    amount: number;
    comment: string;
    commentTo: string;
    narration: string;
    numsignatures: number = 1;
    validAddress: boolean;
    validAmount: boolean;
    isMine: boolean;
    currency: string = 'part';
    ringsize: number = 8;
    subtractFeeFromAmount: boolean = false;
    estimateFeeOnly: boolean = true;

    constructor(data?: ITransactionBuilder) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.id = null;
            this.input = data["input"];
            this.output = data["output"];
            this.toAddress = data["toAddress"];
            this.toLabel = data["toLabel"];
            this.amount = data["amount"];
            this.comment = data["comment"];
            this.commentTo = data["commentTo"];
            this.narration = data["narration"];
            this.numsignatures = data["numsignatures"];
            this.validAddress = data["validAddress"];
            this.validAmount = data["validAmount"];
            this.isMine = data["isMine"];
            this.currency = data["currency"];
            this.ringsize = data["ringsize"];
            this.subtractFeeFromAmount = data["subtractFeeFromAmount"];
            this.estimateFeeOnly = data["estimateFeeOnly"];
        }
    }

    static fromJS(data: any): TransactionBuilder {
        let result = new TransactionBuilder();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};

        data["id"] = this.id;
        data["input"] = this.input;
        data["output"] = this.output;
        data["toAddress"] = this.toAddress;
        data["toLabel"] = this.toLabel;
        data["address"] = this.address;
        data["amount"] = this.amount;
        data["comment"] = this.comment;
        data["commentTo"] = this.commentTo;
        data["narration"] = this.narration;
        data["numsignatures"] = this.numsignatures;
        data["validAddress"] = this.validAddress;
        data["validAmount"] = this.validAmount;
        data["isMine"] = this.isMine;
        data["currency"] = this.currency;
        data["ringsize"] = this.ringsize;
        data["subtractFeeFromAmount"] = this.subtractFeeFromAmount;
        data["estimateFeeOnly"] = this.estimateFeeOnly;

        return data;
    }
}

export interface walletinfo {
    walletname: string,
    walletversion: number,
    balance: number,
    unconfirmed_balance: number,
    immature_balance: number,
    txcount: number,
    keypoololdest: number,
    keypoolsize: number,
    keypoolsize_hd_internal: number,
    paytxfee: number,
    hdmasterkeyid: string
}

export class walletinformation implements walletinfo {

    walletname: string;
    walletversion: number;
    balance: number;
    unconfirmed_balance: number;
    immature_balance: number;
    txcount: number;
    keypoololdest: number;
    keypoolsize: number;
    keypoolsize_hd_internal: number;
    paytxfee: number;
    hdmasterkeyid: string;

    constructor(data?: walletinfo) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.walletname = data["walletname"];
            this.walletversion = data["walletversion"];
            this.balance = data["balance"];
            this.unconfirmed_balance = data["unconfirmed_balance"];
            this.immature_balance = data["immature_balance"];
            this.txcount = data["txcount"];
            this.keypoololdest = data["keypoololdest"];
            this.keypoolsize = data["keypoolsize"];
            this.keypoolsize_hd_internal = data["keypoolsize_hd_internal"];
            this.paytxfee = data["paytxfee"];
            this.hdmasterkeyid = data["hdmasterkeyid"];
        }
    }

    static fromJS(data: any): walletinformation {
        let result = new walletinformation();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        this.walletname = data["walletname"];
        this.walletversion = data["walletversion"];
        this.balance = data["balance"];
        this.unconfirmed_balance = data["unconfirmed_balance"];
        this.immature_balance = data["immature_balance"];
        this.txcount = data["txcount"];
        this.keypoololdest = data["keypoololdest"];
        this.keypoolsize = data["keypoolsize"];
        this.keypoolsize_hd_internal = data["keypoolsize_hd_internal"];
        this.paytxfee = data["paytxfee"];
        this.hdmasterkeyid = data["hdmasterkeyid"];
        return data;
    }
}

// add node
export interface IAddNode {
    node: number;
    action: string;
}

export class AddNode implements IAddNode {
    node: number;
    action: string;

    constructor(data?: IAddNode) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.node = data["node"];
            this.action = data["action"];
        }
    }

    static fromJS(data: any): AddNode {
        let result = new AddNode();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["node"] = this.node;
        data["action"] = this.action;
        return data;
    }
}


// main recent transaction infor ui
export interface RecentTransactionInfo {
    account: string;
    // count: number;
    // from: number;
    address: string;
    category: string;
    amount: number;
    label: string,
    vout: number,
    confirmations: number,
    blockhash: string,
    blockindex: number,
    blocktime: number,
    txid: string,
    walletconflicts: Array<any>,
    time: string,
    timereceived: string,
    fee: number,
}

export class IRecentTransactionInfo implements RecentTransactionInfo {

    account: string;
    // count: number;
    // from: number;
    address: string;
    category: string;
    amount: number;
    label: string;
    vout: number;
    confirmations: number;
    blockhash: string;
    blockindex: number;
    blocktime: number;
    txid: string;
    walletconflicts: Array<any>;
    time: string;
    timereceived: string;
    fee: number;

    constructor(data?: RecentTransactionInfo) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.account = data["account"];
            this.address = data["address"];
            this.category = data["category"];
            this.amount = data["amount"];
            this.label = data["label"];
            this.vout = data["vout"];
            this.confirmations = data["confirmations"];
            this.blockhash = data["blockhash"];
            this.blockindex = data["blockindex"];
            this.blocktime = data["blocktime"];
            this.txid = data["txid"];
            this.time = data["time"];
            this.timereceived = data["timereceived"];
            this.fee = data["fee"];

            // this.account = data["account"];
            // this.count = data["count"];
            // this.from = data["from"];
        }
    }

    static fromJS(data: any): IRecentTransactionInfo {
        let result = new IRecentTransactionInfo();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["account"] = this.account;
        data["address"] = this.address;
        data["category"] = this.category;
        data["amount"] = this.amount;
        data["label"] = this.label;
        data["vout"] = this.vout;
        data["confirmations"] = this.confirmations;
        data["blockhash"] = this.blockhash;
        data["blockindex"] = this.blockindex;
        data["blocktime"] = this.blocktime;
        data["txid"] = this.txid;
        data["time"] = this.time;
        data["timereceived"] = this.timereceived;
        data["fee"] = this.fee;
        // data["account"] = this.account;
        // data["count"] = this.count;
        // data["from"] = this.from;
        return data;
    }
}
export interface TransactionInfo {
    txid: string;
    input: TxType;
    output: TxType;
    toAddress: string;
    toLabel: string;
    address: string;
    amount: number;
    comment: string;
    commentTo: string;
    narration: string;
    numsignatures: number;
    validAddress: boolean;
    validAmount: boolean;
    isMine: boolean;
    currency: string;
    ringsize: number;
    subtractFeeFromAmount: boolean;
    estimateFeeOnly: boolean;
}

export class ITransactionInfo implements TransactionInfo {

    txid: string = '3535d04ae144bf2993f8bdc8fef1ebac414c8b75ca58f6ea533844d81b85e107';
    input: TxType = TxType.PUBLIC;
    output: TxType = TxType.PUBLIC;
    toAddress: string;
    toLabel: string;
    address: string;
    amount: number;
    comment: string;
    commentTo: string;
    narration: string;
    numsignatures: number = 1;
    validAddress: boolean;
    validAmount: boolean;
    isMine: boolean;
    currency: string = 'part';
    ringsize: number = 8;
    subtractFeeFromAmount: boolean = false;
    estimateFeeOnly: boolean = true;

    constructor(data?: TransactionInfo) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.txid = null;
            this.input = data["input"];
            this.output = data["output"];
            this.toAddress = data["toAddress"];
            this.toLabel = data["toLabel"];
            this.amount = data["amount"];
            this.comment = data["comment"];
            this.commentTo = data["commentTo"];
            this.narration = data["narration"];
            this.numsignatures = data["numsignatures"];
            this.validAddress = data["validAddress"];
            this.validAmount = data["validAmount"];
            this.isMine = data["isMine"];
            this.currency = data["currency"];
            this.ringsize = data["ringsize"];
            this.subtractFeeFromAmount = data["subtractFeeFromAmount"];
            this.estimateFeeOnly = data["estimateFeeOnly"];
        }
    }

    static fromJS(data: any): ITransactionInfo {
        let result = new ITransactionInfo();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["txid"] = this.txid;
        data["input"] = this.input;
        data["output"] = this.output;
        data["toAddress"] = this.toAddress;
        data["toLabel"] = this.toLabel;
        data["address"] = this.address;
        data["amount"] = this.amount;
        data["comment"] = this.comment;
        data["commentTo"] = this.commentTo;
        data["narration"] = this.narration;
        data["numsignatures"] = this.numsignatures;
        data["validAddress"] = this.validAddress;
        data["validAmount"] = this.validAmount;
        data["isMine"] = this.isMine;
        data["currency"] = this.currency;
        data["ringsize"] = this.ringsize;
        data["subtractFeeFromAmount"] = this.subtractFeeFromAmount;
        data["estimateFeeOnly"] = this.estimateFeeOnly;
        return data;
    }
}

// add node
export interface IAddBook {
    action: string;
    address: string;
    label: string;
}

export class AddBook implements IAddBook {
    action: string;
    address: string;
    label: string;

    constructor(data?: IAddBook) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.action = data["action"];
            this.address = data["address"];
            this.label = data["label"];
        }
    }

    static fromJS(data: any): AddBook {
        let result = new AddBook();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["action"] = this.action;
        data["address"] = this.address;
        data["label"] = this.label;
        return data;
    }
}

export interface IPassword {
    password: string;
    stakeOnly: boolean;
}

export class encryptpassword implements IPassword {
    password: string;
    stakeOnly: boolean;

    constructor(data?: IPassword) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.password = data["password"];
            this.stakeOnly = data["stakeOnly"];
        }
    }

    static fromJS(data: any): encryptpassword {
        let result = new encryptpassword();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["password"] = this.password;
        data["stakeOnly"] = this.stakeOnly;
        return data;
    }
}


// main bitcoin price infor ui
export interface IBitcoinprice {
    convert: string;
}

export class bitcoinprice implements IBitcoinprice {

    convert: string='BTC';

    constructor(data?: IBitcoinprice) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.convert = data["convert"];
        }
    }

    static fromJS(data: any): bitcoinprice {
        let result = new bitcoinprice();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["convert"] = this.convert;
        return data;
    }
}

export interface IGetblockchaininfo {
    "chain": string,
    "blocks": number,
    "headers": number,
    "bestblockhash": string,
    "moneysupply": string,
    "difficulty": number,
    "mediantime": number,
    "verificationprogress": number,
    "initialblockdownload": boolean,
    "chainwork": string,
    "size_on_disk": number,
    "pruned": boolean
}

export class getblockchaininfo implements IGetblockchaininfo {
    "chain": string;
    "blocks": number;
    "headers": number;
    "bestblockhash": string;
    "moneysupply": string;
    "difficulty": number;
    "mediantime": number;
    "verificationprogress": number;
    "initialblockdownload": boolean;
    "chainwork": string;
    "size_on_disk": number;
    "pruned": boolean

    constructor(data?: IGetblockchaininfo) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.chain = data["chain"];
            this.blocks = data["blocks"];
            this.headers = data["headers"];
            this.bestblockhash = data["bestblockhash"];
            this.moneysupply = data["moneysupply"];
            this.difficulty = data["difficulty"];
            this.mediantime = data["mediantime"];
            this.verificationprogress = data["verificationprogress"];
            this.initialblockdownload = data["initialblockdownload"];
            this.chainwork = data["chainwork"];
            this.size_on_disk = data["size_on_disk"];
            this.pruned = data["pruned"];
        }
    }

    static fromJS(data: any): getblockchaininfo {
        let result = new getblockchaininfo();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["chain"] = this.chain;
        data["blocks"] = this.blocks;
        data["headers"] = this.headers;
        data["bestblockhash"] = this.bestblockhash;
        data["moneysupply"] = this.moneysupply;
        data["difficulty"] = this.difficulty;
        data["mediantime"] = this.mediantime;
        data["verificationprogress"] = this.verificationprogress;
        data["initialblockdownload"] = this.initialblockdownload;
        data["chainwork"] = this.chainwork;
        data["size_on_disk"] = this.size_on_disk;
        data["pruned"] = this.pruned;
        return data;
    }
}

// get new adresses
export interface IGetNewAddress {
    address: string;
}

export class GetNewAddress implements IGetNewAddress {
    address: string;

    constructor(data?: IGetNewAddress) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.address = data["address"];
        }
    }

    static fromJS(data: any): GetNewAddress {
        let result = new GetNewAddress();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["address"] = this.address;
        return data;
    }
}

export interface ISetAccount {
    address: string;
    account: string;
}

export class SetAccount implements ISetAccount {
    address: string;
    account: string;

    constructor(data?: ISetAccount) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.address = data["address"];
            this.account = data["account"];
        }
    }

    static fromJS(data: any): SetAccount {
        let result = new SetAccount();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["address"] = this.address;
        data["account"] = this.account;
        return data;
    }
}

export interface IChangePassword {
    oldpassphrase: string;
    newpassphrase: string;
}

export class ChangePassword implements IChangePassword {
    oldpassphrase: string;
    newpassphrase: string;

    constructor(data?: IChangePassword) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.oldpassphrase = data["oldpassphrase"];
            this.newpassphrase = data["newpassphrase"];
        }
    }

    static fromJS(data: any): ChangePassword {
        let result = new ChangePassword();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["oldpassphrase"] = this.oldpassphrase;
        data["newpassphrase"] = this.newpassphrase;
        return data;
    }
}
export interface ISavecurrency {
    convert: string;
}

export class Savecurrency implements ISavecurrency {
    convert: string;

    constructor(data?: ISavecurrency) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.convert = data["convert"];
        }
    }

    static fromJS(data: any): Savecurrency {
        let result = new Savecurrency();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["convert"] = this.convert;
        return data;
    }
}

export interface INodeinfo {
    alias: string,
    address: number,
    privateKey: string,
    txHash: string,
    outputIndex: number,
    status: string
}

export class NodeInfo implements INodeinfo {
    alias: string;
    address: number;
    privateKey: string;
    txHash: string;
    outputIndex: number;
    status: string;

    constructor(data?: INodeinfo) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.alias = data["alias"];
            this.address = data["address"];
            this.privateKey = data["privateKey"];
            this.txHash = data["txHash"];
            this.outputIndex = data["outputIndex"];
            this.status = data["status"];
        }
    }

    static fromJS(data: any): NodeInfo {
        let result = new NodeInfo();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["alias"] = this.alias;
        data["address"] = this.address;
        data["privateKey"] = this.privateKey;
        data["txHash"] = this.txHash;
        data["outputIndex"] = this.outputIndex;
        data["status"] = this.status;
        return data;
    }
}

// add node
export interface IDepostAmount {
    amount: number;
}

export class DepostAmount implements IDepostAmount {
    amount: number;

    constructor(data?: IDepostAmount) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }
}

export interface IUnAnonymizeAmount {
    amount: number;
    address: string;
}

export class UnAnonymizeAmount implements IUnAnonymizeAmount {
    amount: number;
    address: string;

    constructor(data?: IUnAnonymizeAmount) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(data?: any) {
        if (data) {
            this.amount = data['amount'];
            this.address = data['address'];
        }
    }

    static fromJS(data: any): UnAnonymizeAmount {
        let result = new UnAnonymizeAmount();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data['amount'] = this.amount;
        data['address'] = this.address;
        
        return data;
    }
}
