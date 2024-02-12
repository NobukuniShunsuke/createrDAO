// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;


contract fourPartyModel {

    // アドレスことの残高のmapping
    mapping(address => uint) private _balances;

    // 役割
    mapping(address => bool) private _brands;
    mapping(address => bool) private _acquires;
    mapping(address => bool) private _issuers;
    mapping(address => bool) private _merchants;
    mapping(address => bool) private _merchantsBank;

    uint256 private _totalSupply;

    string  private _name   = "KINDAI JPN";
    string  private _symbol = "KDJPN";
    address private _owner;

    constructor() {
        _owner = msg.sender;
    }

    function name() external view returns (string memory) {
        string memory nameCopy = _name;
        return nameCopy;
    }

    function symbol() external view returns (string memory) {
        string memory symbolCopy = _symbol;
        return symbolCopy;
    }

    function totalSupply() external view returns (uint) {
        return _totalSupply;
    }
    function ownerCheck() external view returns (bool) {
        return msg.sender == _owner;
    }
    function ownerAddress() external view returns (address) {
        return _owner;
    }
    modifier onlyOwner {
        require(msg.sender == _owner, "you're not owner");
        _;
    }

    modifier onlyAcquire {
        require(_acquires[msg.sender]);
        _;
    }
    // change state of address
    function setModifierUser(address account, uint role) public onlyOwner{
        if( role == 0 ){
            _brands[account] = !_brands[account];
        }
        else if ( role == 1 ) {
            _acquires[account] = !_acquires[account];
        }
        else if ( role == 2 ) {
            _issuers[account] = !_issuers[account];
        }
    }

    // change state of address and the address make to merchant
    function setModifierMerchant(address account) public onlyAcquire{
            _merchants[account] = !_merchants[account];
    }
 
    // 追加発行 with log
    event NewMint(address indexed to, uint amount);
    function mint(address account, uint amount) public onlyAdmin{
        _balances[account] += amount;
        _totalSupply += amount;
        emit NewMint(account, amount);
    }

    
    // burn 機能 with log
    event Newburn(address indexed to, uint amount);
    function burn(address account, uint amount) public onlyAdmin{
        require(balanceOf(account) > amount, "transaction couldn't burn user's coin because there not enough coin");
        _setBalance(account, balanceOf(account) - amount);
        _totalSupply -= amount;
        emit Newburn(account, amount);
    }    
    // アカウントの残高を変更する
    function _setBalance(address account, uint amount) private {
        _balances[account] = amount;
    }
    // 残高を返す
    function balanceOf(address account) public view returns (uint) {
        return _balances[account];
    }
    function balanceOfMe() public view returns (uint) {
        return _balances[msg.sender];
    }
    function whoami() public view returns (address) {
        return msg.sender;
    }
    // トランスパー
    function _transfer(address from , address to, uint amount) private {
        require(balanceOf(from) > amount, "user has not enought money");
        
        _setBalance(from , balanceOf(from) - amount );
        _setBalance(to , balanceOf(to) + amount );

    }
    // multisigのための構造体
    struct Transfer {
        address to;
        uint amount;
        bool executed;
        address ownerAddress;
        uint256 requiredConfirmations;
        uint256 totalConfirmations;
        bool isConfirmByIssuer;
        bool isConfirmByBrand;
    }

    // トランスファー情報の配列
    mapping(address => Transfer[]) public transfers;
    // 新しいトランスファーを提出する関数
    function submitTransfer(address _to, uint _amount) external {
        require(balanceOf(msg.sender) > _amount, "not enough coin" );
        Transfer memory newTransfer = 
            Transfer({
                to: _to,
                amount: _amount,
                executed: false,
                ownerAddress: msg.sender,
                requiredConfirmations: 1,
                totalConfirmations: 0,
                isConfirmByIssuer: false,
                isConfirmByBrand: false
            });
        transfers[msg.sender].push(newTransfer);
    }

    modifier onlyAdmin {
        require(_brands[msg.sender] || _issuers[msg.sender], "This address is not admin");
        _;
    }

    
    // brand check
    function checkBrand() public view returns (bool)  {
        return _brands[msg.sender];
    }
    // issuer check
    function checkIssuer() public view returns (bool)  {
        return _issuers[msg.sender];
    }
    // acquire check
    function checkAcquire() public view returns (bool)  {
        return _acquires[msg.sender];
    }
    // merchant check
    function checkMerchant() public view returns (bool) {
        return _merchants[msg.sender];
    }
    // merchantsbank check
    function checkMerchantsBank() public view returns (bool) {
        return _merchantsBank[msg.sender];
    }
    


    // トランスファーを承認する関数
    // brand, issuer だけがこの関数を操作できて、どちらかが一度承諾したらtranferが実行される
    function confirmTransfer(address _userAddress,uint _transferIndex) external onlyAdmin {
        require(_transferIndex < transfers[_userAddress].length, "Transaction not found in the index");
        bool isBrand = _brands[msg.sender];
        bool isIssuer = _issuers[msg.sender];
        if (isBrand) {
            require(!transfers[_userAddress][_transferIndex].isConfirmByIssuer, "This transaction has already been checked");
            transfers[_userAddress][_transferIndex].isConfirmByIssuer = true;
            transfers[_userAddress][_transferIndex].totalConfirmations++;
        }
        if (isIssuer) {
            require(!transfers[_userAddress][_transferIndex].isConfirmByBrand, "This transaction has already been checked");
            transfers[_userAddress][_transferIndex].isConfirmByBrand = true;
            transfers[_userAddress][_transferIndex].totalConfirmations++;
        }

        if (transfers[_userAddress][_transferIndex].totalConfirmations >= transfers[_userAddress][_transferIndex].requiredConfirmations) {
            transfers[_userAddress][_transferIndex].executed = true;
            executeTransfer(_userAddress,_transferIndex);
        }
    }

    event NewExecutedTransfer(address indexed from,address indexed to, uint amount);

    // トランスファーを実行する内部関数
    // 正しいtransferIndexを入れたのか、実行のための承諾数は揃っているのか２つの条件を確認した後、実行される
    function executeTransfer(address _userAddress, uint _transferIndex) internal {
        require(_transferIndex < transfers[_userAddress].length, "Transaction not found in the index");
        require(transfers[_userAddress][_transferIndex].executed == true, "The number of confirmations required for processing is insufficient");
    
        _transfer(
            transfers[_userAddress][_transferIndex].ownerAddress, 
            transfers[_userAddress][_transferIndex].to, 
            transfers[_userAddress][_transferIndex].amount
            );
            
        emit NewExecutedTransfer(
            transfers[_userAddress][_transferIndex].ownerAddress, 
            transfers[_userAddress][_transferIndex].to, 
            transfers[_userAddress][_transferIndex].amount
            );
        delete transfers[_userAddress][_transferIndex];
    }

    //企業・団体用口座の登録
    mapping(address => address) private _merchantsBankCodeToAddress;
    mapping(address => address) private _AddressToMerchantsBankCodes;
    event NewMerchantsBankCode(address indexed merchantsBankCode);
    function makeMerchantsBankCode(address _aquireAddress, address _merchantsBankAddress) public {
        bytes memory address1Bytes = abi.encodePacked(_merchantsBankAddress);
        bytes memory address2Bytes = abi.encodePacked(_aquireAddress);
        bytes memory combinedBytes = abi.encodePacked(address1Bytes, address2Bytes);
        address merchantsBankCode = address(uint160(uint(keccak256(combinedBytes))));
        _merchantsBankCodeToAddress[merchantsBankCode] = _merchantsBankAddress;
        _AddressToMerchantsBankCodes[_merchantsBankAddress] = merchantsBankCode;
        _merchantsBank[_merchantsBankAddress] = !_merchantsBank[_merchantsBankAddress];
        emit NewMerchantsBankCode(merchantsBankCode);
    }

    function showMerchantsBankAddress(address merchantsBankCode) public view returns (address) {
        require(_merchantsBankCodeToAddress[merchantsBankCode] != address(0), "you are not merchantsBank");
        return _merchantsBankCodeToAddress[merchantsBankCode];
    }


    function showMerchantsBankCode(address merchantsBankAddress) public view returns (address) {
        require(_AddressToMerchantsBankCodes[merchantsBankAddress] != address(0), "you are not merchantsBank");
        return _AddressToMerchantsBankCodes[merchantsBankAddress];
    }

    mapping(address => address) private _merchantCodeToAddress;
    mapping(address => address) private _AddressToMerchantCodes;

    event NewMerchantCode(address indexed merchantCode);
    function makeMerchantCode(address _acquireAddress, address _merchantAddress) public onlyAcquire{
        bytes memory address1Bytes = abi.encodePacked(_merchantAddress);
        bytes memory address2Bytes = abi.encodePacked(_acquireAddress);
        bytes memory combinedBytes = abi.encodePacked(address1Bytes, address2Bytes);
        address merchantCode = address(uint160(uint(keccak256(combinedBytes))));
        _merchantCodeToAddress[merchantCode] = _merchantAddress;
        _AddressToMerchantCodes[_merchantAddress] = merchantCode;
        _merchants[_merchantAddress] = !_merchants[_merchantAddress];
        emit NewMerchantCode(merchantCode);
    }

    function showMerchantAddress(address merchantCode) public view returns (address) {
        require(_merchantCodeToAddress[merchantCode] != address(0), "you are not merchant");
        return _merchantCodeToAddress[merchantCode];
    }


    function showMerchantCode(address merchantAddress) public view returns (address) {
        require(_AddressToMerchantCodes[merchantAddress] != address(0), "you are not merchant");
        return _AddressToMerchantCodes[merchantAddress];
    }

    modifier onlyAquier{
        require(_acquires[msg.sender], "This address is not aquier.");
        _;
    }

    event NewMerchantAddressStored(address indexed merchantCode, address indexed merchantAddress);
    //merchantを格納する関数
    function storeMerchantAddress(address merchantCode, address merchantAddress) external onlyAquier {
        require(merchantCode != address(0), "Invalid merchant code");
        require(merchantAddress != address(0), "Invalid merchant address");

        //merchant情報を格納するための構造体
        merchants.push(MerchantInfo({
            code: merchantCode,
            addr: merchantAddress,
            distributeScore: 0 //収益分配を行うためのスコア
            //各merchantに収益を分配する際に、(supply * distributeScore / distributeTotalScore)を用いて分け合いたい
        }));

        //merchant_codeをaddressに関連付け
        _AddressToMerchantCodes[merchantAddress] = merchantCode;

        emit NewMerchantAddressStored(merchantCode, merchantAddress);
    }

    //merchant情報を保持するための構造体
    struct MerchantInfo {
        address code;
        address addr;
        uint distributeScore;
    }

    //全てのmerchant情報を格納する配列
    MerchantInfo[] public merchants;

    //merchant_codeからmerchant情報を所得する関数
    function getMerchantInfo(address merchantCode) public view returns (address) {
        for (uint i = 0; i < merchants.length; i++) {
            if (merchants[i].code == merchantCode) {
                return merchants[i].addr;
            }
        }
        revert("Merchant not found");
    }

    // アドレスごとの投資情報のキーを管理する配列
    address[] public investors; 

    // multisigのための構造体
    struct Investment {
        address merchantsBankAddress;
        uint256 amount;
        bool executed;
        address ownerAddress;
        uint256 requiredConfirmations;
        uint256 totalConfirmations;
        bool isConfirmByIssuer;
        bool isConfirmByBrand;
        bool rewarded;
    }

    // トランスファー情報の配列
    mapping(address => Investment[]) public investments;

    // 投資者情報の初期化
    function initializeInvestor(address investor) internal {
        if (investments[investor].length == 0) {
            investors.push(investor);
        }
    }
    // アドレスごとの投資額を管理するマッピング
    mapping(address => uint256) public _investorInvestmentAmount;

    // 投資者ごとの投資額の合計を格納するマッピング
    mapping(address => uint256) public _totalInvestmentsAmount;

    //会社・製作委員会等への出資情報を提出する関数
    function submitInvestment(uint256 _amount) external {
        require(balanceOf(msg.sender) > _amount, "not enough coin" );

        // 投資家が初めて投資を行う場合、初期化を行う
        initializeInvestor(msg.sender);
        
        Investment memory newInvestment = 
            Investment({
                merchantsBankAddress: address(this),
                amount: _amount,
                executed: false,
                ownerAddress: msg.sender,
                requiredConfirmations: 1,
                totalConfirmations: 0,
                isConfirmByIssuer: false,
                isConfirmByBrand: false,
                rewarded: false
            });
        investments[msg.sender].push(newInvestment);

        // 投資者ごとの投資額を更新
        _investorInvestmentAmount[msg.sender] += _amount;
        // 投資者ごとの投資額の合計を更新
        _totalInvestmentsAmount[address(this)] += _amount;
    }

    function totalInvestmentsAmount(address account) external view returns (uint256) {
        return _totalInvestmentsAmount[account];
    }

    function getInvestorInvestmentAmount(address account) external view returns (uint256) {
        return _investorInvestmentAmount[account];
    }


    //会社・製作委員会等にトークンを出資する関数
    function investInCompany(address _userAddress,uint256 _InvestmentIndex) external onlyAdmin{
        require(_InvestmentIndex < investments[_userAddress].length, "Investment not found in the index");
        bool isBrand = _brands[msg.sender];
        bool isIssuer = _issuers[msg.sender];

        //投資者から会社が所持する口座を持つ銀行へのsubmitTransfer/comfirmTransfer処理
        if (isBrand) {
            require(!investments[_userAddress][_InvestmentIndex].isConfirmByIssuer, "This investment has already been checked");
            investments[_userAddress][_InvestmentIndex].isConfirmByIssuer = true;
            investments[_userAddress][_InvestmentIndex].totalConfirmations++;
        }
        if (isIssuer) {
            require(!investments[_userAddress][_InvestmentIndex].isConfirmByBrand, "This investment has already been checked");
            investments[_userAddress][_InvestmentIndex].isConfirmByBrand = true;
            investments[_userAddress][_InvestmentIndex].totalConfirmations++;
        }

        if (investments[_userAddress][_InvestmentIndex].totalConfirmations >= investments[_userAddress][_InvestmentIndex].requiredConfirmations) {
            investments[_userAddress][_InvestmentIndex].executed = true;
            executeInvestmentTransfer(_userAddress,_InvestmentIndex);
        }

        //投資完了のイベントを発行
        emit InvestmentCompleted(msg.sender, investments[_userAddress][_InvestmentIndex].amount);
    }

    // 投資を実行する内部関数
    // 正しいInvestTransferIndexを入れたのか、実行のための承諾数は揃っているのか２つの条件を確認した後、実行される
    function executeInvestmentTransfer(address _userAddress, uint256 _InvestmentIndex) internal {
        require(_InvestmentIndex < investments[_userAddress].length, "Investment not found in the index");
        require(investments[_userAddress][_InvestmentIndex].executed == true, "The number of confirmations required for processing is insufficient");
    
        _transfer(
            investments[_userAddress][_InvestmentIndex].ownerAddress, 
            investments[_userAddress][_InvestmentIndex].merchantsBankAddress, 
            investments[_userAddress][_InvestmentIndex].amount
            );
            
        delete investments[_userAddress][_InvestmentIndex];
    }

    // 分配処理
    function distributeTokens() external onlyAdmin {
        require(_totalInvestmentsAmount[address(this)] > 0, "No investments have been made");

        // 分配処理
        for (uint i = 0; i < investors.length; i++) {
            address investor = investors[i];

            // トークンを投資者のアドレスに転送
            _transfer(address(this), investor, _investorInvestmentAmount[investor]);
        }
    }

    //報酬を投資者に送る関数
    function sendLinkToInvestor(address _userAddress, uint256 _InvestmentIndex, string calldata link) external onlyAdmin {
        require(_InvestmentIndex < investments[_userAddress].length, "Invalid investment index");
        require(!investments[_userAddress][_InvestmentIndex].rewarded, "Investor has already been rewarded");

        //外部処理を行い、投資者に報酬リンクを送る
        /* string memory dataUrl = fetchDataFromExternalAPI(); */

        //投資者が報酬を受け取ったことを記録
        investments[_userAddress][_InvestmentIndex].rewarded = true;

        //報酬リンク送信完了のイベントを発行
        emit LinkSentToInvestor(investments[_userAddress][_InvestmentIndex].ownerAddress, link);
    }

    //外部APIからデータを所得する関数
    /*
    function fetchDataFromExternalAPI() internal pure returns (string memory) {
        //この部分は、外部APIへのリクエストを行うコードに書き換える必要がある
        return "https://www.google.com/";
    }
    */

    //投資完了のイベント
    event InvestmentCompleted(address indexed ownerAddress, uint256 amount);
    //報酬の送信完了のイベント
    event LinkSentToInvestor(address indexed ownerAddress, string link);

}