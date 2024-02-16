import React, {Link} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App2 from './App2';
import Admin from './Admin';
import Docs404 from './Docs404';
import { MetaMaskProvider } from '@metamask/sdk-react';
import 'bootstrap/dist/css/bootstrap.css'
import Modal from 'react-modal';
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
Modal.setAppElement('#root');

const root = ReactDOM.createRoot(document.getElementById('root'));
const contractAddress = "0x7A390728bb8Bb4d60Aae10CcC8AE1a03f76E6f21"

root.render(
  <React.StrictMode>
    <MetaMaskProvider debug={false} sdkOptions={{
      checkInstallationImmediately: false,
      dappMetadata: {
        name: "Demo React App",
        url: window.location.host,
      }
    }}>
      <Container>
      <Row>
        <Col><App2 contractAddress = {contractAddress}/></Col>
        <Col><Admin contractAddress = {contractAddress}/></Col>
      </Row>
      </Container>
      
    </MetaMaskProvider>
  </React.StrictMode>
);

/*
      <BrowserRouter > 
        <Routes>
          <Route path="/admin" element={ <Admin /> } /> 
          <Route path="/" element={ <App2 /> } /> \
          <Route path={"/*"} element={<Docs404 language={"NULL"} />} />
        </Routes>
      </BrowserRouter>

*/
