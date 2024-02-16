import React, { useState, useEffect } from 'react';
import './App.css';
import { useSDK } from '@metamask/sdk-react';
import { ethers } from "ethers";
import fourPartyModel from './fourPartyModel.json';
import { } from 'did-jwt-vc';
import { EthrDID } from 'ethr-did'
import QRcode from 'qrcode';

export const App = () => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [contractData, setContractData] = useState(null);
  const [smartContractConnected, setSmartContractConnected] = useState(null);
  const { sdk, connected, chainId } = useSDK();
  const [balance, setBalance] = useState(null);
  // owner, user, issuer, brand, acquire, merchant
  const [owner, setOwner] = useState(false);
  const [issuer, setIssuer] = useState(false);
  const [acquire, setAcquire] = useState(false);
  const [brand, setBrand] = useState(false);
  const [merchant, setMerchant] = useState(false);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [index, setIndex] = useState(null);
  const [confirmBool, setConfirmBool] = useState(false);
  const [submitBool, setSubmitBool] = useState(false);
  const [did, setDid] = useState(null);
  // merchant
  const [merchantCode, setMerchantCode] = useState("")
  const [merchantQRcode, setMerchantQRcode] = useState(null)

  const makeEtherDID = async () => {
    const txSigner = await new ethers.BrowserProvider(window.ethereum).getSigner();
    const etherDid = new EthrDID({ identifier: account, provider: provider, chainNameOrId: chainId, txSigner: txSigner });
    console.log("etherDID", etherDid.did);
  };
  // Metamask recommends using the SDK, so you don't need to try onboarding tools
  // It works for checking if your computer has Metamask, whatever browser extension or app you're using
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      await connect();
    })();
  }, []);
  const connect = async () => {
    setLoading(true); // 연결 시작 시 로딩 상태를 true로 변경

    // Connect wallet
    try {
      const accounts = await sdk?.connect();
      setAccount(accounts?.[0]);
      if (account === ownerAddress) {
        setOwner(true);
      }
      console.log("wallet connect");
    } catch (err) {
      console.warn(`failed to connect..`, err);
    }

    // Connect smart contract
    try {
      setContract(smartContract);
      const result = await contract.symbol();
      setSmartContractConnected(true);
      console.log("SmartContract connect");
      console.log(`symbol: `, result);
      setContractData(result);
    } catch (err) {
      console.warn(`failed to connect..`, err);
    } finally {
      setLoading(false); // 연결 완료 시 로딩 상태를 false로 변경
    }
  };


  // ganache 또는 다른 네트워크로 배포한 컨트랙트의 어드레스를 입력
  // Put in the address where it was deployed in the contractAddress constant
  const contractAddress = `0x1B255F6e6c3Dd3856D1b63b0AE47f9Cf4Bf62a2b`;
  const provider = new ethers.BrowserProvider(window.ethereum);
  const ownerAddress = `0x4a4e7343e5c555582720c1334b4124a03f5d1171`;

  // 스마트 계약 객체 생성
  // To connect to a smart contract, you need three things: the contract address, ABI, and a provider (like Metamask).
  // If you want to change the contract state, you have to get the signer.
  const smartContract = new ethers.Contract(contractAddress, fourPartyModel.abi, provider);

  // Not Change State Function

  const checkBalance = async () => {
    try {
      let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
      let result = await contract.connect(signer).balanceOf(account);
      let balance = Number(result);
      setBalance(balance);
      console.log(`balance log:`, balance);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const checkBalanceforMerchant = async () => {
    try {
      let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
      let result = await contract.connect(signer).showMerchantCode(account);
      result = await contract.connect(signer).balanceOf(result);
      let balance = Number(result)
      setBalance(balance);
      console.log(`balance log:`, balance);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const checkRole = async () => {
    window.ethereum.on('accountsChanged', function (accounts) {
      // Time to reload your interface with accounts[0]!
      window.location.reload();
    });
    // check brand, issuer, merchant, acquire
    // result return bool
    let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
    const _contract = await contract.connect(signer);
    // chack brand
    try {
      let result = await _contract.checkBrand();
      setBrand(result);
      console.log(`check brand log:`, result);
    } catch (error) {
      console.error('Error:', error);
    }
    // check isssuer
    try {
      let result = await _contract.checkIssuer();
      setIssuer(result);
      console.log(`check issuer log:`, result);
    } catch (error) {
      console.error('Error:', error);
    }
    // check acquire
    try {
      let result = await _contract.checkAcquire();
      setAcquire(result);
      console.log(`check Acquire log:`, result);
    } catch (error) {
      console.error('Error:', error);
    }
    // check merchant and set merchantCode
    try {
      let result = await _contract.checkMerchant();
      setMerchant(result);
      console.log(`check Merchant log:`, result);
      if (merchant) {
        result = await _contract.showMerchantCode(account);
        setMerchantCode(result);
        console.log(`check MerchantCode log:`, result);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const checkFunction = async () => {
    try {
      console.log('log:', contract.interface.format());
      return contract.interface.format()
    } catch (error) {
      console.error('Error:', error);
    }
  };


  // Change State Function
  const mint_form = async (address, amount) => {
    console.log(`Minting ${amount} tokens to address ${address}`);
    // Get singer 
    let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
    // Send the transaction
    const tx = await contract.connect(signer).mint(address, amount); //_contract.mint(address, amount);
    // Wait for the transaction to be included
    await tx.wait();
  };
  const burn_form = async (address, amount) => {
    console.log(`Burning ${amount} tokens to address ${address}`);
    // Get singer 
    let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
    // Send the transaction
    const tx = await contract.connect(signer).burn(address, amount);
    // Wait for the transaction to be included
    await tx.wait();
  };
  // for owner
  const modifyIssuer = async () => {
    try {
      console.log(`changing ${address} to Issuer`);
      // Get signer 
      let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
      // Send the transaction
      const tx = await contract.connect(signer).setModifierUser(address, `2`);
      // Wait for the transaction to be included
      await tx.wait();
    } catch (error) {
      console.error('Error:', error);
    }
  };
  // for owner
  const modifyBrand = async () => {
    console.log(`changing ${address} to Brand`);
    // Get singer 
    let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
    // Send the transaction
    const tx = await contract.connect(signer).setModifierUser(address, `0`);
    // Wait for the transaction to be included
    await tx.wait();
  };
  // for owner
  const modifyAcquire = async () => {
    console.log(`changing ${address} to Acquire`);
    // Get singer 
    let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
    // Send the transaction
    const tx = await contract.connect(signer).setModifierUser(address, `1`);
    // Wait for the transaction to be included
    await tx.wait();
  };

  const modifyMerchant = async () => {
    console.log(`changing ${address} to Merchant`);
    // Get singer 
    let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
    // Send the transaction
    const tx = await contract.connect(signer).setModifierMerchant(address);
    // Wait for the transaction to be included
    await tx.wait();
  }

  const makeMercahnt = async (aquiereAddress, merchantAddress) => {
    console.log(`make code for ${address} to Merchant`);
    // Get singer 
    let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
    // Send the transaction
    const tx = await contract.connect(signer).makeMerchantCode(aquiereAddress, merchantAddress);
    // Wait for the transaction to be included
    await tx.wait();
  }

  

  const checkMerchantCode = async () => {
    // Get singer 
    let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
    // Send the transaction
    const tx = await contract.connect(signer).showMerchantCode(account);
    // Wait for the transaction to be included
    let result = tx
    console.log(result);
    setMerchantCode(result);
  }
  const submitTransaction = async () => {
    console.log(`submiting trasaction`);
    // Get singer 
    let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
    // Send the transaction
    const tx = await contract.connect(signer).submitTransfer(address, amount);
    // Wait for the transaction to be included
    await tx.wait();
  };

  const confirmTransaction = async () => {
    console.log(`confirming trasaction`);
    // Get singer 
    let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
    // Send the transaction
    console.log("address", { address });
    console.log("index", { index });
    const tx = await contract.connect(signer).confirmTransfer(address, index);
    // Wait for the transaction to be included
    await tx.wait();
  };

  const makeMerchantQRCode = async (code) => {
    console.log("making qr with merchant code");
    try {
      const qrCodeImage = await QRcode.toDataURL(code);
      setMerchantQRcode(qrCodeImage);
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  }

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleIndexChange = (e) => {
    setIndex(e.target.value);
  };

  const handleMintButtonClick = () => {
    // 입력된 address와 amount 값을 이용하여 mint_form 함수 호출
    mint_form(address, amount);
  };

  const handleBurnButtonClick = () => {
    // 입력된 address와 amount 값을 이용하여 mint_form 함수 호출
    burn_form(address, amount);
  };

  const handleMerchantModifyButtonClick = () => {
    // 입력된 address와 amount 값을 이용하여 mint_form 함수 호출
    modifyMerchant(address);
  };

  const handleMakeMerchantButtonClick = () => {
    // 입력된 address와 amount 값을 이용하여 mint_form 함수 호출
    makeMercahnt(account, address);
  };

  const confirmPopup = () => {
    setConfirmBool(!confirmBool)
  };

  const submitPopup = () => {
    setSubmitBool(!submitBool)
  };

  const isOwner = () => {
    return account == ownerAddress
  };

  useEffect(() => {
    if (connected && smartContractConnected) {
      checkRole();
    }
  }, [connected, smartContractConnected]);

  // renders

  const renderOwnerSection = () => {
    if (isOwner()) {
      return (
        <div className='button-section'>
          <h1>Welcome Owner</h1>
          <label>
            Address
            <input type="text" value={address} onChange={handleAddressChange} />
          </label>
          <br />
          <button onClick={modifyIssuer}>change state [issuer]</button>
          <button onClick={modifyBrand}>change state [brand]</button>
          <button onClick={modifyAcquire}>change state [acquire]</button>
        </div>
      );
    }
    return null; // if not Owner, render nothing
  };

  const renderUserSection = () => {
    if(!(issuer || acquire || brand || isOwner() || merchant)) 
      return (
      <div className='button-section'>
        <h1>Welcome User</h1>
        {(chainId == "0x539" && chainId) && `Connected private chain `}
        {(chainId == "0x1" && chainId) && `Connected mainnet chain `}
        
        <p></p>
        {balance && `balance: ${balance}`}
        <button style={{ padding: 10, margin: 10 }} onClick={checkBalance}>checkBalance</button>
        <h1><span onClick={submitPopup}>Submit Transfer</span></h1>
        {submitBool && (
          <>
            <label>
              Address
              <input type="text" value={address} onChange={handleAddressChange} />
            </label>
            <br />
            <label>
              Amount
              <input type="text" value={amount} onChange={handleAmountChange} />
            </label>
            <br />
            <button onClick={submitTransaction}>submit</button>
          </>
        )}
      </div>
    )
    return null; // if not user, render nothing
  }

  const renderIssuerBrandSection = () => {
    if(issuer || brand) 
      return (
        <div className='button-section'>
        <h1>Welcome {issuer && "Issuer"} {brand && "Brand"}</h1>
        {contractAddress && `Smart Contract Address \n${contractAddress}`}
        <p></p>
        {contractData && `contractSymbol ${contractData}`}
        <div>
          <label>
            Address
            <input type="text" value={address} onChange={handleAddressChange} />
          </label>
          <br />
          <label>
            Amount
            <input type="text" value={amount} onChange={handleAmountChange} />
          </label>
          <br />
          <label>
            Amount
            <input type="text" value={index} onChange={handleIndexChange} />
          </label>
          <br />
          <button onClick={handleMintButtonClick}>Mint Tokens</button>
          <button onClick={handleBurnButtonClick}>Burn Tokens</button>
          <button onClick={confirmTransaction}>Confirm</button>
        </div>
      </div>
    )
    return null; // if not issuer or brand, render nothing
  }

  const renderAcquireSection = () => {
    if(acquire) 
      return (
        <div className='button-section'>
        <h1>Welcome Acquire</h1>
        <label>
          Address
          <input type="text" value={address} onChange={handleAddressChange} />
        </label>
        <br />
        <label>
          Amount
          <input type="text" value={amount} onChange={handleAmountChange} />
        </label>
        <br />
        <button onClick={handleBurnButtonClick}>Burn Tokens</button>
        <button onClick={handleMerchantModifyButtonClick}>MerchantModify</button>
        <button onClick={handleMakeMerchantButtonClick}>makeMercahnt</button>
        </div>
      )
    return null; // if not acquire, render nothing
  }

  const renderMerchantSection = () => {
    if(merchant) 
      return (
      <div className='button-section'>
        <h1>Welcome Merchant</h1>
        <>
          {balance && `${balance}`}
          <button onClick={checkBalanceforMerchant}>checkbalance</button>
          <p></p>
          {merchantCode && `${merchantCode}`}
          <button onClick={checkMerchantCode}>checkCode</button>
          {merchantQRcode && <img src={merchantQRcode} alt="QR Code" />}
        </>
      </div>
      )
    return null; // if not merchant, render nothing
  }

  return (
    <div className="App">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {!smartContractConnected ? (
            <div>
              <button  className="connect-button" onClick={connect}>
                Connect
              </button>
            </div>
          ) : (
            <>
              <button onClick={checkRole}>Check Role</button>
              <button style={{ padding: 10, margin: 10 }} onClick={makeEtherDID}>Create EtherDID</button>
              {account && (
                <div className="account-info">
                  <h2>My Address</h2>
                  <p>{account}</p>
                </div>
              )}
              {renderOwnerSection()}
              {renderUserSection()}
              {renderIssuerBrandSection()}
              {renderAcquireSection()}
              {renderMerchantSection()}
            </>
          )}
        </>
      )}
    </div> //app return
  ); //app return
}; //app 


export default App;
