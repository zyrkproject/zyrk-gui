export enum TxType {
  PUBLIC = 'part',
  BLIND = 'blind',
  ANON = 'anon'
}

export enum payType {
  sendPayment = 'sendpayment'
}

export enum typeOfAddresses {
  Send = 'send',
  Receive = 'receive'
}

export enum categories {
  Send = 'send',
  Receive = 'receive',
  Node = 'node'
}

export enum message {
  walletMessage = 'Failed to get wallet information.',
  recentTransactionMessage = 'Failed to get recent transactions.',
  transactionMessage = 'Failed to get transaction.', 
  bitcoinpriceMessage  = 'Failed to get bitcoin price.',
  AddressAddedMessage = 'Failed to add an address!',
  AddressEditedMessage = 'Failed to edit an address!',
  AddressDeletedMessage = 'Failed to delete an address!',
  EnterData= 'Please enter something!',
  SendAmount = 'Wallet failed to get balance.',
  GetNewAddress = 'Failed to get a new address.',
  ReceiveZYRKtoWallet = 'Wallet failed to add ZYRK.',
  GetAddress = 'Failed to get an address.',
  SendAmountToVaultMessage = 'Zyop failed to get balance!',
  SaveCurrencyMessage = 'Failed to save currency.',
  PasswordValidationMessage = 'Passwords do not match.',
  ChangePasswordMessage = 'Failed to change password.',
  CurrencyChangeMessage = 'Your settings have been saved.',
  CopiedAddress = 'Address has been added to your clipboard.',
  DepositMessage = 'Failed to deposit amount.',
  PassphraseNotMatch = 'Password does not match. Please check if the password is correct!',
  PassphraseChanged = 'Passphrase was successfully changed! Please restart the wallet.',
  WalletEncrypted = 'Zyrk GUI+ will restart now due to wallet encryption.',
  GetAllAddresses = 'Failed to get address book addresses.',
  GetFeeForAmount = 'Failed to get fee.',
  ListTransactions = 'Failed to get list of transactions!',
  UnAnonymizeAmount = 'Zyop conversion failed!',
  MasternodeListConf = 'Failed to get list of Masternodes!',
  MasternodeList = 'Failed to get list of all Masternodes!'
}

export enum ApiEndpoints {
  SendToAddress = 'sendtoaddress',
  ListStealthAddresses = 'listanonymize',
  FilterTransactions = 'filtertransactions',
  ListTransactions = 'listtransactions',
  GetWalletInfo = 'getwalletinfo',
  ReceivedZyrk = 'getaddressesbyaccount',
  AddNode = 'addnode',
  GetTransaction = 'gettransaction',
  GetBalance = 'getbalance',
  AddressBook = 'manageaddressbook',
  ValidadeAddress = 'validateaddress',
  Filteraddresses = 'filteraddresses',
  Filtertransactions  = 'filtertransactions',
  Encryptwallet = 'encryptwallet',
  Walletpassphrase = 'walletpassphrase',
  Walletpassphrasechange = 'walletpassphrasechange' ,
  Mnemonic = 'mnemonic',
  Extkeygenesisimport = 'extkeygenesisimport',
  GetBtc = 'https://api.coinpaprika.com/v1/tickers/zyrk-zyrk?quotes=USD,BTC',
  GetEur = 'https://api.coinpaprika.com/v1/tickers/zyrk-zyrk?quotes=USD,BTC',
  ZYRKHitoryUrl = '',
  GetMarketInfo = '',
  Getblockchaininfo = 'getblockchaininfo',
  Getnewaddress = 'getnewaddress',
  Setaccount = 'setaccount',
  MasternodeListConf = 'masternode list-conf',
  Masternode = 'masternode',
  MasternodeList = 'masternodelist',
  Torstatus  = 'torstatus',
  EnableTor  = 'enabletor',
  SaveCurrency = '',
  GetPriceinfo = 'getpriceinfo',
  AnonymizeAmount = 'anonymizeamount',
  ListReceivedbyAddress = 'listreceivedbyaddress',
  GetAccountAddress = 'getaccountaddress',
  ListAccounts = 'listaccounts',
  GetAddressesbyAccount = 'getaddressesbyaccount',
  GetFeeForAmount = 'getfeeforamount',
  GetNetworkInfo = 'getnetworkinfo',
  GetAllAddresses = 'getalladdresses',
  ManageAddressbook = 'manageaddressbook',
  UnAnonymizeAmount = 'unanonymizeamount',
  WalletLock = 'walletlock',
  StopZyrkd = 'stop',
  GetPubCoinPack = 'getpubcoinpack'
}
