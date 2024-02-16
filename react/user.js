import { QRCodeSVG } from 'qrcode.react';
import React, { useState, useEffect } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import ModalBoot from 'react-bootstrap/Modal';
import { ethers } from 'ethers';
import fourPartyModel from './fourPartyModel.json';
import { EthrDID } from 'ethr-did';
export const User = (props) => {
    
    const { account } = props;
    const [qr, setQR]  = useState(null);
    const [contract, setContract] = useState(null);
    const [balance, setBalance] = useState(0);
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [signer, setSigner] = useState(null);
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const qrCode = async () => {
      const url = `${window.location.href}?data=${account}&payment=true`;
      //const url = `http://192.129.4.2:3000/?data=${account}&payment=true`;
      setQR(<QRCodeSVG value={url} />) 
    };
    useEffect(() => {
      
      try {
        const contractAddress = `0x7A390728bb8Bb4d60Aae10CcC8AE1a03f76E6f21`;
        setSigner(new ethers.BrowserProvider(window.ethereum).getSigner());
        setContract(new ethers.Contract(contractAddress, fourPartyModel.abi, signer));
      } catch (err) {
        console.warn(`failed to connect..`, err);
      }
    }, []);
    const checkBalance = async () => {
      try {
        let provier = await new ethers.BrowserProvider(window.ethereum);
        let result = await contract.connect(provier).balanceOf(account);
        let balance = Number(result);
        setBalance(balance);
        console.log(`balance log:`, balance);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    const checkInvestmentAmount = async () => {
      try {
        let provier = await new ethers.BrowserProvider(window.ethereum);
        let result = await contract.connect(provier).getInvestorInvestmentAmount(account);
        let balance = Number(result);
        setBalance(balance);
        console.log(`Investment log:`, balance);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const submitTransaction = async () => {
      console.log(`submiting trasaction`);
      // Get singer 
      let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
      // Send the transaction
      const tx = await contract.connect(signer).submitTransfer(address, amount);
      // Wait for the transaction to be included
      await tx.wait();
    };
    const submitInvestment = async () => {
      console.log(`submiting investment`);
      // Get singer 
      let signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
      // Send the transaction
      const tx = await contract.connect(signer).submitInvestment(amount);
      // Wait for the transaction to be included
      await tx.wait();
    };
    const handleAddressChange = (e) => {
      setAddress(e.target.value);
    };
  
    const handleAmountChange = (e) => {
      setAmount(e.target.value);
    };
    return (
        
      <div className="User" style={{textAlign: 'center', marginLeft: '15%', marginRight: '15%', marginTop: '3%'}}>
        <h1>Welcome User!</h1>
        <div style={{marginTop: '3%', marginBottom: '3%'}} >
          <Button variant="outline-secondary" onClick={()=> {handleShow(); qrCode();}}>
            QR
          </Button>
        </div>
        <>
          <ModalBoot show={show} onHide={handleClose}>
            <ModalBoot.Header >
              <ModalBoot.Title>Receiving payment from a friend</ModalBoot.Title>
            </ModalBoot.Header>
            <ModalBoot.Body >{qr}</ModalBoot.Body>
          </ModalBoot>
        </>
        <>
          <InputGroup className="mb-3">

          <Form.Control
            aria-label="Example text with button addon"
            aria-describedby="basic-addon1"
            value={balance} onChange={handleAmountChange}
            readOnly
          />
          <Button variant="outline-secondary" id="button-addon1" onClick={checkBalance}>
          CheckBalance
          </Button>
          <Button variant="outline-secondary" id="button-addon1" onClick={checkInvestmentAmount}>
          CheckInvestmentAmount
          </Button>
          </InputGroup>
        </>

        <h1>Submit Transfer</h1>

        <>
          <FloatingLabel
            controlId="floatingInput"
            label="Ethereum address"
            className="mb-3"
          >
            <Form.Control type="Address" placeholder="Address" value={address} onChange={handleAddressChange}/>
          </FloatingLabel>
          <InputGroup className="mb-3">
            <FloatingLabel controlId="floatingInput" label="Amount">
              <Form.Control             
              aria-label="Example text with button addon"
              aria-describedby="basic-addon2"
              type="value" 
              placeholder="Amount" 
              value={amount} 
              onChange={handleAmountChange}/>
            </FloatingLabel>
            <Button variant="outline-secondary" id="button-addon2" onClick={submitTransaction}>
            submit
            </Button>
          </InputGroup>
        </>

        <h1>Submit Investment</h1>

        <>
          <InputGroup className="mb-3">
            <FloatingLabel controlId="floatingInput" label="Amount">
              <Form.Control             
              aria-label="Example text with button addon"
              aria-describedby="basic-addon2"
              type="value" 
              placeholder="Amount" 
              value={amount} 
              onChange={handleAmountChange}/>
            </FloatingLabel>
            <Button variant="outline-secondary" id="button-addon2" onClick={submitInvestment}>
            submit
            </Button>
          </InputGroup>
        </>
      
      </div>
    );
    
  }; 
  
  
  export default User;
