import React, { useState, useEffect } from 'react';
import { useSDK } from '@metamask/sdk-react';
import { ethers } from 'ethers';
import fourPartyModel from './fourPartyModel.json';
import { Button } from 'react-bootstrap';
import { EthrDID } from 'ethr-did';
import User from './user';
import ToolBar from './ToolBar'
import PayMent from './PayMent'
export const App2 = (props) => {
  const {contractAddress} = props;
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const { sdk, connected } = useSDK();
  const [isLoading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [data, setData] = useState(null);
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
    /*
    if (connected) {
      window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        window.location.reload();
      });
    */
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
      // Read params code
      const params = new URLSearchParams(window.location.search);
      const data = params.get('data');
      const payment = params.get('payment');
      setPayment(payment);
      setData(data);
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
  };

  const handleClick = () => setLoading(true);

  return (
    <div className="App2">
      {installCheck()}
      {account && (
      // after sign in
      <>
        <ToolBar account={account} contract={contract} />
        <User account={account} contractAddress={contractAddress}/>
        {(payment) && <PayMent account={account} contract={contract} data={data}/>}
      </>
      )}
    </div>
  );
};

export default App2;
