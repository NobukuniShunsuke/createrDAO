import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSDK } from '@metamask/sdk-react';
import { ethers } from 'ethers';
import fourPartyModel from './fourPartyModel.json';
import { Button, ButtonGroup } from 'react-bootstrap';
import ModalBoot from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Spinner from 'react-bootstrap/Spinner';
export const Admin = (props) => {
    const {contractAddress} = props;
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [walletContractConneted, setWalletContractConneted] = useState(null);
    const { sdk, connected } = useSDK();
    const [isLoading, setLoading] = useState(false);
    const [accountLoading, setAccountLoading] = useState(false);
    const [accountLoadingPercentage, setAccountLoadingPercentage] = useState(0);
    const [accountLoadingState, setAccountLoadingState] = useState("");
    const [address, setAddress] = useState("");
    const [ownerButton, setownerButton] = useState(false);
    const [index, setIndex] = useState("");
    const [amount, setAmount] = useState('');
    const [merchantCode, setMerchantCode] = useState(null);
    const [balance, setBalance] = useState("");
    const [txWait, setTxWait] = useState(false);
    const [qr, setQR]  = useState(null);
    const [show, setShow] = useState(false);
    const [allcoin ,setAllcoin] = useState(0);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [positions, setPositions] = useState({
        checked : false,
        owner : false,
        merchant : false,
        merchantsBank : false,
        acquire : false,
        issuer : false,
        brand : false,
    });
    const metamskConnect = async () => {
      // Function to connect to Metamask
      try {
        const accounts = await sdk?.connect();
        console.log(accounts?.[0]);
        setAccount(accounts?.[0]);
      } catch (err) {
        console.warn(`failed to connect.. ${err}`);
      }
    };
    const smartContractConnect = () => {
        // Connect smart contract
        try {
          const signer = new ethers.BrowserProvider(window.ethereum).getSigner();
          const smartContract = new ethers.Contract(contractAddress, fourPartyModel.abi, signer);
          setContract(smartContract);
        } catch (err) {
          console.warn(`failed to connect..`, err);
        }
      };
    
    const connect = () => {
        metamskConnect();
        smartContractConnect();
        setWalletContractConneted(true);
        if (connected) {
          window.ethereum.on('accountsChanged', function (accounts) {
            // Time to reload your interface with accounts[0]!
            window.location.reload();
          });
        }
      };
    
    useEffect(() => {
       
        function simulateNetworkRequest() {
          return new Promise((resolve) => setTimeout(resolve, 2000));
        }
    
        if (isLoading) {
          simulateNetworkRequest().then(() => {
            setLoading(false);
          });
        }
      }, [isLoading]);

    const installCheck = () => {
        if (connected && !account) {
          return (
            <div style={{ textAlign: 'center', paddingTop: '15%' }}>
              <Button variant="outline-secondary" disabled={isLoading} size="lg" onClick={() => { connect(); handleClick(); }}>
                {isLoading ? 'Loading…' : 'Sign in'}
              </Button>
            </div>
          );
        } else if (!sdk?.connect()) return null; 
    }
    const PositionChecker = async () => {
        setAccountLoading(true)
        setAccountLoadingPercentage(0)
        setAccountLoadingState("making getSigner")
        let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
        setAccountLoadingPercentage(10)
        setAccountLoadingState("making ownerCheck")
        let onwer = await contract.connect(signer).ownerCheck();
        setAccountLoadingPercentage(30)
        setAccountLoadingState("making checkMerchant")
        let merchant = await contract.connect(signer).checkMerchant();
        setAccountLoadingPercentage(50)
        setAccountLoadingState("making checkAcquire")
        let merchantsBank = await contract.connect(signer).checkMerchantsBank();
        setAccountLoadingPercentage(60)
        setAccountLoadingState("making checkMerchantsBank")
        let acquire = await contract.connect(signer).checkAcquire();
        setAccountLoadingPercentage(70)
        setAccountLoadingState("making checkIssuer")
        let isssuer = await contract.connect(signer).checkIssuer();
        setAccountLoadingPercentage(90)
        setAccountLoadingState("making checkBrand")
        let brand = await contract.connect(signer).checkBrand();
        console.log("owner : ",onwer)
        console.log("merchant : ",merchant)
        console.log("merchantsbank :", merchantsBank)
        console.log("acquire : ",acquire)
        console.log("isssuer : ",isssuer)
        console.log("brand : ",brand)
        setAccountLoadingPercentage(100)
        setPositions({
            checked : true,
            owner : onwer,
            merchant : merchant,
            merchantsBank : merchantsBank,
            acquire : acquire,
            issuer : isssuer,
            brand : brand,
        })
        setAccountLoadingState("complete")
        
    }
    const handleChecker = () => {
        PositionChecker()
        
    }
    const adminCheck = () => {
        return (
            <div>
                {!positions.checked && !accountLoading && <Button onClick={handleChecker}>checker</Button>}
                {!positions.checked && accountLoading && <ProgressBar striped variant="success" now={accountLoadingPercentage} label={accountLoadingState}/>}
                {!positions.checked && accountLoading && <Button onClick={handleChecker} disabled>checker</Button>}
            </div>
        );
    };
    const modifyIssuer = async () => {
        // for owner
        try {
          setownerButton(true)
          console.log(`changing ${address} to Issuer`);
          // Get signer 
          setTxWait(true)
          let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
          // Send the transaction
          const tx = await contract.connect(signer).setModifierUser(address, `2`);
          // Wait for the transaction to be included
          await tx.wait();
          setownerButton(false)
          setTxWait(false)
        } catch (error) {
          setownerButton(false)
          console.error('Error:', error);
        }
      };
      
    const modifyBrand = async () => {
        // for owner
        try {
        setownerButton(true)
        console.log(`changing ${address} to Brand`);
        // Get singer 
        setTxWait(true)
        let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
        // Send the transaction
        const tx = await contract.connect(signer).setModifierUser(address, `0`);
        // Wait for the transaction to be included
        await tx.wait();
        setownerButton(false)
        setTxWait(false)
        } catch (error) {
            setownerButton(false)
            console.error('Error:', error);
        } 
      };
     
    const modifyAcquire = async () => {
        // for owner
        try {
        setownerButton(true)
        console.log(`changing ${address} to Acquire`);
        // Get singer 
        setTxWait(true)
        let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
        // Send the transaction
        const tx = await contract.connect(signer).setModifierUser(address, `1`);
        // Wait for the transaction to be included
        await tx.wait();
        setownerButton(false)     
        setTxWait(false)   
        } catch (error) {
            setownerButton(false)
            console.error('Error:', error);
        } 
      };
    const mint_form = async () => {
        console.log(`Minting ${amount} tokens to address ${address}`);
        // Get singer 
        setTxWait(true)
        let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
        // Send the transaction
        const tx = await contract.connect(signer).mint(address, amount); //_contract.mint(address, amount);
        // Wait for the transaction to be included
        await tx.wait();
        setTxWait(false)
      };
    const burn_form = async () => {
        console.log(`Burning ${amount} tokens to address ${address}`);
        // Get singer 
        setTxWait(true)
        let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
        // Send the transaction
        const tx = await contract.connect(signer).burn(address, amount);
        // Wait for the transaction to be included
        await tx.wait();
        setTxWait(false)
      };
    const modifyMerchant = async () => {
        // State to manage the Merchant status 
        console.log(`changing ${address} to Merchant`);
        // Get singer 
        setTxWait(true)
        let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
        // Send the transaction
        const tx = await contract.connect(signer).setModifierMerchant(address);
        // Wait for the transaction to be included
        await tx.wait();
        setTxWait(false)
      }
    
    const makeMercahnt = async () => {
        /**
        * Generates a unique merchant code for a new merchant registration.
        * The generated code follows a specific format and is used to uniquely identify each merchant.
        * This function is typically called when creating a new merchant account.
        *
        * @returns {Address} The generated merchant code.
        */
        setTxWait(true)
        console.log(`make code for ${address} to Merchant`);
        // Get singer 
        let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
        // Send the transaction
        const tx = await contract.connect(signer).makeMerchantCode(account, address);
        // Wait for the transaction to be included
        await tx.wait();
        setTxWait(false)
      }

      const modifyMerchantsBank = async () => {
        // State to manage the Merchant status 
        console.log(`changing ${address} to Merchant`);
        // Get singer 
        setTxWait(true)
        let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
        // Send the transaction
        const tx = await contract.connect(signer).setModifierMerchantsBank(address);
        // Wait for the transaction to be included
        await tx.wait();
        setTxWait(false)
      }

      const makeMerchantsBank = async () => {
        /**
        * Generates a unique merchant code for a new merchant registration.
        * The generated code follows a specific format and is used to uniquely identify each merchant.
        * This function is typically called when creating a new merchant account.
        *
        * @returns {Address} The generated merchant code.
        */
        setTxWait(true)
        console.log(`make code for ${address} to Merchant`);
        // Get singer 
        let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
        // Send the transaction
        const tx = await contract.connect(signer).makeMerchantsBankCode(account, address);
        // Wait for the transaction to be included
        await tx.wait();
        setTxWait(false)
      }
    
    const checkMerchantCode = async () => {
        try {
          // Get singer 
          setTxWait(true)
          let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
          // Send the transaction
          const tx = await contract.connect(signer).showMerchantCode(account);
          // Wait for the transaction to be included
          let result = tx
          console.log(result);
          setMerchantCode(result);      
          setTxWait(false)  
        } catch (error) {
            console.error('Error:', error);
          }
      }
    const storeMerchant = async () => {
        //get signer
        setTxWait(true)
        console.log(`make code for ${address} and ${merchantCode} to Merchant`);
        let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
        //Send the transaction
        const tx = await connect(signer).storeMerchantAddress(address, merchantCode);
        //Wait for the transaction to be included
        await tx.wait();
        setTxWait(false)
    }
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
    const checkBalanceforMerchantsBank = async () => {
        try {
          let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
          let result = await contract.connect(signer).showMerchantsBankCode(account);
          result = await contract.connect(signer).balanceOf(result);
          let balance = Number(result)
          setBalance(balance);
          console.log(`balance log:`, balance);
        } catch (error) {
          console.error('Error:', error);
        }
    };
    const checktotalInvestmentsAmount = async () => {
      try {
        let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
        let result = await contract.connect(signer).totalInvestmentsAmount(contractAddress);
        let balance = Number(result)
        setBalance(balance);
        console.log(`balance log:`, balance);
      } catch (error) {
        console.error('Error:', error);
      }
  };
    const checkAllcoin = async () => {
        try {
            let provier = await new ethers.BrowserProvider(window.ethereum);
            let result = await contract.connect(provier).totalSupply();
            setAllcoin(Number(result))
            console.log("all coin : ",result)
          } catch (error) {
            console.error('Error:', error);
          }
    }

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

    const confirmInvestment = async () => {
      console.log(`confirming Investment`);
      // Get singer 
      let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
      // Send the transaction
      console.log("address", { address });
      console.log("index", { index });
      const tx = await contract.connect(signer).investInCompany(address, index);
      // Wait for the transaction to be included
      await tx.wait();
    };

    const distributeTokens = async () => {
      console.log(`distributing tokens`);
      // Get singer 
      let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
      // Send the transaction
      const tx = await contract.connect(signer).distributeTokens();
      // Wait for the transaction to be included
      await tx.wait();
    };

    const qrCodeForMerchant = async () => {
        const url = `${window.location.href}?data=${account}&payment=true`;
        setQR(<QRCodeSVG value={url} />) 
      };
    const ownerPage = () => {
        return (
            <div>
                welcome owner
                <InputGroup className="mb-3">
                    <Button variant="outline-secondary" id="button-addon1" onClick={modifyAcquire} disabled={ownerButton || address.length < 42}>
                        aqcuire
                    </Button>
                    <Button variant="outline-secondary" id="button-addon1" onClick={modifyIssuer} disabled={ownerButton || address.length < 42}>
                        isssuer
                    </Button>
                    <Button variant="outline-secondary" id="button-addon1" onClick={modifyBrand} disabled={ownerButton || address.length < 42}>
                        brand
                    </Button>
                    <Form.Control
                        aria-label="Example text with button addon"
                        aria-describedby="basic-addon1"
                        placeholder="Enter Address"
                        value={address} 
                        onChange={handleAddressChange}
                    />
                </InputGroup>
                {txWait && <><Spinner animation="border" variant="primary" /></>}
            </div>
        );
    };
    const issuerBrandPage = () => {
        return (
            <div>
                {positions.issuer && <>welcome issuer</>}
                {positions.brand && <>welcome brand</>}
                <InputGroup className="mb-3">
                    <Button variant="outline-secondary" id="button-addon1" onClick={burn_form} disabled={ownerButton || address.length < 42}>
                        burn
                    </Button>
                    <Button variant="outline-secondary" id="button-addon1" onClick={mint_form} disabled={ownerButton || address.length < 42}>
                        mint
                    </Button>
                    <Form.Control
                        aria-label="Example text with button addon"
                        aria-describedby="basic-addon1"
                        placeholder="Enter Address"
                        value={address} 
                        onChange={handleAddressChange}
                    />
                    <Form.Control
                        aria-label="Example text with button addon"
                        aria-describedby="basic-addon1"
                        placeholder="Enter Amount"
                        value={amount} 
                        onChange={handleAmountChange}
                    />
                </InputGroup>
                <InputGroup className="mb-3">
                    <Button variant="outline-secondary" id="button-addon1" onClick={confirmTransaction} disabled={ownerButton || address.length < 42}>
                        confirmTransfer
                    </Button>
                    <Form.Control
                        aria-label="Example text with button addon"
                        aria-describedby="basic-addon1"
                        placeholder="Enter Address"
                        value={address} 
                        onChange={handleAddressChange}
                    />
                    <Form.Control
                        aria-label="Example text with button addon"
                        aria-describedby="basic-addon1"
                        placeholder="Enter Index"
                        value={index} 
                        onChange={handleIndexChange}
                    />
                </InputGroup>
                <InputGroup className="mb-3">
                    <Button variant="outline-secondary" id="button-addon1" onClick={confirmInvestment} disabled={ownerButton || address.length < 42}>
                        confirmInvest
                    </Button>
                    <Form.Control
                        aria-label="Example text with button addon"
                        aria-describedby="basic-addon1"
                        placeholder="Enter Address"
                        value={address} 
                        onChange={handleAddressChange}
                    />
                    <Form.Control
                        aria-label="Example text with button addon"
                        aria-describedby="basic-addon1"
                        placeholder="Enter Index"
                        value={index} 
                        onChange={handleIndexChange}
                    />
                </InputGroup>
                <InputGroup className="mb-3">
                  <Button variant="outline-secondary" id="button-addon1" onClick={checktotalInvestmentsAmount} >
                    check totalInvestment
                  </Button>
                  <Form.Control
                    aria-label="Example text with button addon"
                    aria-describedby="basic-addon1"
                    value={balance} onChange={handleAddressChange}
                    readOnly
                  />
                </InputGroup>
                <InputGroup className="mb-3">
                    <Button onClick={distributeTokens}>
                      distributeTokens
                    </Button>
                </InputGroup>
                {txWait && <><Spinner animation="border" variant="primary" /></>}
            </div>
        );
    };
    const acquirePage = () => {
        return (
            <div>
                {positions.acquire && <>welcome acquire</>}
                <InputGroup className="mb-3" >
                    <Button variant="outline-secondary" id="button-addon1" onClick={burn_form} disabled={txWait || address.length < 42}>
                        burn
                    </Button>
                    <Button variant="outline-secondary" id="button-addon1" onClick={modifyMerchant} disabled={txWait || address.length < 42}>
                        modifyMerchant
                    </Button>
                    <Button variant="outline-secondary" id="button-addon1" onClick={makeMercahnt} disabled={txWait || address.length < 42}>
                        makeMercahnt
                    </Button>
                </InputGroup>
                <InputGroup className="mb-3" >
                    <Form.Control
                        aria-label="Example text with button addon"
                        aria-describedby="basic-addon1"
                        placeholder="Enter Address"
                        value={address} 
                        onChange={handleAddressChange}
                    />
                    <Form.Control
                        aria-label="Example text with button addon"
                        aria-describedby="basic-addon1"
                        placeholder="Enter Amount"
                        value={amount} 
                        onChange={handleAmountChange}
                    />
                </InputGroup>
                {txWait && <><Spinner animation="border" variant="primary" /></>}
            </div>
        );
    };
    const merchantPage = () => {
        return (
            <div>
                {positions.merchant && <>welcome merchant</>}
                <InputGroup className="mb-3">
                    <Button variant="outline-secondary" id="button-addon1" onClick={checkBalanceforMerchant} >
                        check
                    </Button>
                    <Form.Control
                        aria-label="Example text with button addon"
                        aria-describedby="basic-addon1"
                        placeholder="you're balance"
                        value={balance} 
                        readOnly
                        onChange={handleAddressChange}
                    />
                </InputGroup>
                <Button onClick={checkMerchantCode}>checkMerchantCode</Button>
                {merchantCode && merchantCode}
                {merchantCode && 
                <>
                    <Button variant="outline-secondary" onClick={()=> {handleShow(); qrCodeForMerchant();}}>
                        QR
                    </Button>
                    <>
                    <ModalBoot show={show} onHide={handleClose}>
                        <ModalBoot.Header >
                        <ModalBoot.Title>Receiving payment from a user</ModalBoot.Title>
                        </ModalBoot.Header>
                        <ModalBoot.Body >{qr}</ModalBoot.Body>
                    </ModalBoot>
                    </>
                </>}
                {txWait && <><Spinner animation="border" variant="primary" /></>}
            </div>
        );
    };
    const merchantsBankPage = () => {
      return (
        <div>
          {positions.merchantsBank && <>welcome merchantsBank</>}
          <InputGroup className="mb-3">
            <Button variant="outline-secondary" id="button-addon1" onClick={checkBalanceforMerchantsBank} >
            check balance
            </Button>
            <Form.Control
              aria-label="Example text with button addon"
              aria-describedby="basic-addon1"
              placeholder="you're balance"
              value={balance} 
              readOnly
              onChange={handleAddressChange}
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <Button variant="outline-secondary" id="button-addon1" onClick={checktotalInvestmentsAmount} >
            check totalInvestment
            </Button>
            <Form.Control
              aria-label="Example text with button addon"
              aria-describedby="basic-addon1"
              placeholder="you're totalInvestment"
              value={balance} 
              readOnly
              onChange={handleAddressChange}
            />
          </InputGroup>
          {txWait && <><Spinner animation="border" variant="primary" /></>}
        </div>
      );
    };
    const handleIndexChange = (e) => {
        setIndex(e.target.value);
      };
    const handleAddressChange = (e) => {
        setAddress(e.target.value);
      };
    const handleAmountChange = (e) => {
        setAmount(e.target.value);
      };
    const handleMerchantCodeChange = (e) => {
      setAmount(e.target.value);
      };
    const handleClick = () => setLoading(true);
    return (
      <div className="Admin">
        {installCheck()}
        {walletContractConneted && 
        <>
            <h1>Admin Page</h1>
            {adminCheck()}
            {/* after checked */}
            {positions.checked && (
                <>
                    <Button onClick={checkAllcoin}>check all coin</Button>
                    {allcoin && <>all coin : {allcoin}</>}
                    {positions.owner && ownerPage()}
                    {(positions.issuer || positions.brand) && issuerBrandPage()}
                    {positions.acquire && acquirePage()}
                    {positions.merchant && merchantPage()}
                    {positions.merchantsBank && merchantsBankPage()}
                </>
            )}
        </>
        }
      </div>
    );
  };
  
  export default Admin;
