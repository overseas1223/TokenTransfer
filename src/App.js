import React, { useState, useEffect } from 'react';
import Web3 from "web3";
import { 
  FANTOM_RPCURL, 
  LQDR_ADDRESS, 
  BOO_ADDRESS,
  BEETS_ADDRESS,
  SPELL_ADDRESS,
  LINSPIRIT_ADDRESS,
  WFTM_ADDRESS,
  // TEST_FANTOM_RPCURL,
  // TEST_LQDR_ADDRESS,
  // TEST_BOO_ADDRESS,
  // TEST_BEETS_ADDRESS,
  // TEST_SPELL_ADDRESS,
  // TEST_LINSPIRIT_ADDRESS,
  // TEST_WFTM_ADDRESS,
} from './constants/constant';
import {  
  BEETS_ABI, BOO_ABI, LINSPIRIT_ABI, LQDR_ABI, SPELL_ABI, WFTM_ABI
} from './constants/abi';
import LQDR_ICON from './icon/lqdr.png';
import BOO_ICON from './icon/boo.png';
import BEETS_ICON from './icon/beets.png';
import SPELL_ICON from './icon/spell.png';
import LINSPIRIT_ICON from './icon/linspirit.webp';
import WFTM_ICON from './icon/wftm.png';
import FTM_ICON from './icon/ftm.png';
import './App.css';

export default function App() {
  const [flag, setFlag] = useState(false);
  const [balances, setBalances] = useState([0,0,0,0,0,0,0]);
  const [senderAddress, setSenderAddress] = useState('0x3e2C9972edB3c368b2bC382536BCc9DeE10A9D72');
  const [senderKey, setSenderKey] = useState('3be9fe9a12ce43e0c13743600d93087c4d1bca6396e0977bcf30e5f899e63b8a');
  const [receiverAddress, setReceiverAddress] = useState('0x26a52b826E19F833deBB6d9F35b144ed0578a23A');
  // const [senderAddress, setSenderAddress] = useState('0x950B90dA9715025b32c11f325A0a9B324E459A53');
  // const [senderKey, setSenderKey] = useState('09d1d5b3a6f550a1c249f95e9539c98b01864ad1ae0a2855334ff35836adda36');
  // const [receiverAddress, setReceiverAddress] = useState('0x0C83364207D94EaeE5e349c5486b640dcD4E9320');
  const [timerId, setTimerId] = useState(null);
  const [pastTime, setPastTime] = useState(0);
  const web3 = new Web3(new Web3.providers.HttpProvider(FANTOM_RPCURL));
  const decimal = 10 ** 18;
  //LQDR, LINSPIRIT, BOO, BEETS, SPELL,  WFTM
  const Addresses = [
    // TEST_LQDR_ADDRESS,
    // TEST_LINSPIRIT_ADDRESS,
    // TEST_BOO_ADDRESS,
    // TEST_BEETS_ADDRESS,
    // TEST_SPELL_ADDRESS,
    // TEST_WFTM_ADDRESS,
    LQDR_ADDRESS,
    LINSPIRIT_ADDRESS,
    BOO_ADDRESS,
    BEETS_ADDRESS,
    SPELL_ADDRESS,
    WFTM_ADDRESS
  ];
  const TokenNames = ['LQDR', 'LINSPIRIT', 'BOO', 'BEETS', 'SPELL', 'WFTM', 'FTM'];
  const Icons = [LQDR_ICON, LINSPIRIT_ICON, BOO_ICON, BEETS_ICON, SPELL_ICON, WFTM_ICON, FTM_ICON];
  const Abis = [LQDR_ABI, LINSPIRIT_ABI, BOO_ABI, BEETS_ABI, SPELL_ABI, WFTM_ABI];
  let Contracts = [];
  
  for(var i = 0 ; i < 6 ; i ++ ) Contracts.push(new web3.eth.Contract(Abis[i], Addresses[i]));

  const getBalances = async () => {
    let result = [];
    for ( var i = 0 ; i < 6 ; i ++) {
      const res = await Contracts[i].methods.balanceOf(senderAddress).call();
      result.push(Number(res));
    }
    const res = await web3.eth.getBalance(senderAddress);;
    result.push(Number(res));
    setBalances(result);
  }

  useEffect(() => {
    if(pastTime > 0 ) sendToken();
  }, [pastTime]);

  useEffect(() => {
    console.log("UseEffectBalance", balances);
    let sum = 0;
    for(i = 0 ; i < 6 ; i ++ )
      sum = sum + balances[i];
    if(sum > 0) { 
      if(timerId) {
        clearInterval(timerId);
        setTimerId(null);
      }
      sendToken();
    } else {
      if(flag === true) {
        if(timerId === null) {
          const id = setInterval(getBalances, 3000);
          setTimerId(id);
        }
      }
    }
  }, [balances]);

  const Start = () => {
    if(senderAddress === '') {
      alert("Please Input Sender Address");
      return;
    }

    if(senderKey === '') {
      alert("Please Input Sender Key");
      return;
    }

    if(receiverAddress === '') {
      alert("Please Input Receiver Address");
      return;
    }
    setFlag(true);
    getBalances();
  }

  const Stop = () => {
      if(timerId !== null)  {
        clearInterval(timerId);
        setTimerId(null);
        setPastTime(0);
        setFlag(false);
      }
  }

  const sendToken = async () => {
    let sum = 0;
    for(var i = 0 ; i < 6 ; i ++) {
      sum += balances[i];
      if(balances[i] > 0) {
        try {
          const nonce = await web3.eth.getTransactionCount(senderAddress,'pending');
            const sendAmount = Number(balances[i]);
            const encodedABI = Contracts[i].methods.transfer(receiverAddress, sendAmount.toString()).encodeABI();
            var rawTransaction = {
              "nonce": nonce,
              "to": Addresses[i], 
              "gas": 250000, 
              "data": encodedABI, 
              "chainId": 250
            }; 
            const signedTx = await web3.eth.accounts.signTransaction(rawTransaction, senderKey);
            web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(error, hash) {
              if(!error)  {
                console.log(hash);
                let newBalances = [];
                for(var j = 0 ; j < 7; j ++ ) {
                  if(i === j && j !== 6) {
                    newBalances.push(0);
                  } else {
                    newBalances.push(balances[j]);
                  }
                }
                console.log("New Balac", newBalances);
                setBalances(newBalances);
              }
              else {
                if(timerId) {
                  clearInterval(timerId);
                  setTimerId(null);
                }
                getBalances();
              }
            });
          } catch (err) {
            console.log(err);
          }
      }
    }
    if(sum === 0) {
      const id = setInterval(getBalances, 3000);
      setTimerId(id);
    }
  }
  
  return (
      <div className="app">
        <div className="header">Token Info</div>
        <div className="container">
          <div className="token-info">
            <table>
              <tbody>
              {Icons.map((icon, i) => {
                return (
                  <tr key={i}>
                    <td className="token-icon">
                      <img src={icon} className="icon-image" alt={TokenNames[i]}/>
                    </td>
                    <td className="token-name">
                      {TokenNames[i]}
                    </td>
                    <td className="token-balance">
                      {(balances[i] / decimal).toFixed(3)}
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
          <div className="setting">
            <div className="button-group">
              <div className="button-start" onClick={Start}>Start</div>
              <div className="button-stop" onClick={Stop}>Stop</div>
            </div>
            <div className="account-info">
              <input 
                type="text" 
                className="input-text" 
                placeholder='Sender Address' 
                value={senderAddress} 
                onChange={(e) => setSenderAddress(e.target.value)}
              />
              <input 
                type="text" 
                className="input-text" 
                placeholder='Sender PrivateKey'
                value={senderKey}
                onChange={(e) => setSenderKey(e.target.value)}
              />
              <input 
                type="text" 
                className="input-text" 
                placeholder='Receiver Address'
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
              />
              <div style={{display: 'flex', margin: '20px', justifyContent: 'center'}}>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}