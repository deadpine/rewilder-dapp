import React, { useState, useEffect } from "react";
import Router from 'next/router'

import { useDisclosure } from "@chakra-ui/react";
import Slider from "@material-ui/core/Slider";
import { useEthers, useContractFunction, useEtherBalance } from "@usedapp/core";
import { ethers } from 'ethers';

import Layout from "./../components/Layout";
import { addressFor } from "../lib/addresses";
import { useBalanceOf, useTokenOfOwner } from "../lib/rewilderNFT";
import ConnectWalletModal from "../components/ConnectWalletModal";
import ThanksForDonating from "../components/ThanksForDonating";
import Button from "../components/Button";
import InformationIcon from "../components/InformationIcon";
import FLAVOR_TEXT from "../lib/flavorText";
import networkMatches from "../lib/networkMatches";
import config from "../config";

import RewilderDonationCampaign from "./../artifacts/contracts/RewilderDonationCampaign.sol/RewilderDonationCampaign.json";

function IndexPage() {
  const { account, error, library } = useEthers();
  const { onOpen, isOpen, onClose } = useDisclosure();
  const etherBalance  = useEtherBalance(account);
  
  const [amount, setAmount] = useState(1);
  const [walletOpened, setWalletOpened] = useState(false);
  const networkIncorrect = !networkMatches();
  
  const clamp = (n, lower, upper) => Math.min(Math.max(n, lower), upper);
  
  // TODO: move this to rewilderNFT.js :: useDonate or something
  const RewilderDonationCampaignInterface = new ethers.utils.Interface(RewilderDonationCampaign.abi)
  const campaignAddress = addressFor("RewilderDonationCampaign");
  const campaign = new ethers.Contract(
    campaignAddress,
    RewilderDonationCampaignInterface,
  );
  
  const { state: donateTx , events, send: requestDonateToWallet } =
    useContractFunction(campaign, "donate", { transactionName: 'Donate' });
    
  const maybeNFTBalance = useBalanceOf(account);
  const nftBalance = maybeNFTBalance && maybeNFTBalance.toNumber();
  const maybeTokenId = useTokenOfOwner(account, nftBalance);
  const tokenId =  maybeTokenId && maybeTokenId.toNumber();
  
  const alreadyDonated = donateTx.status=="Success" || tokenId > 0;
  const insufficientBalance = amount > etherBalance/1e18;

  const getTierForAmount = (amount) => {
    return amount < 33 ? "cypress" : amount < 66 ? "araucaria" : "sequoia";
  };
  
  const ethToUSD = 3500;
  const hectaresEstimation = amount*ethToUSD/8000;
  const tier = getTierForAmount(amount);
  const flavorText = FLAVOR_TEXT[tier]; 

  const donateButtonText = networkIncorrect?
    `Change wallet network to ${config.networkName} to donate`:
    !account?
      "Connect Wallet":
      alreadyDonated?
        "Thanks for donating!":
        insufficientBalance?
          "Insufficient Balance":
          "Donate and mint your NFT";

  const donateButtonLoadingText = !account?
    "Connecting Wallet":
    "Sign Transaction in Wallet"

  const sliderMarks = [
    {
      value: 1,
    },
    {
      value: 33,
    },
    {
      value: 66,
    },
  ];
    
  useEffect(() => {
    if (error) {
      console.log(`error`, error);
    }
  }, [error]);
  
  const redirectDelayMS = 2000;
  useEffect(() => {
    if (events) {
      const tokenId = events[0].args[2].toNumber();
      console.log(`tokenId=${tokenId} minted, redirecting in ${redirectDelayMS}ms...`);
      setTimeout(() => {
        Router.push(`/donation/${tokenId}`);
      }, redirectDelayMS);
    }
  }, [events]);
  useEffect(() => {
    if (donateTx.status == 'Exception' || 
        donateTx.status == 'Mining') {
      console.log('status=', donateTx.status);
      setWalletOpened(false);
    }
  }, [donateTx]);
  const handleSliderChange = (event, newValue) => {
    setAmount(newValue);
  };

  const handleInputChange = (event) => {
    if (event.target.value == "") {
      setAmount("");
      return;
    }
    const value = clamp(event.target.value, 1, 100);
    setAmount(value);
  };


  // call the campaign smart contract, send a donation
  const donate = () => {
    if (!account) {
      return onOpen();
    }
    if (!amount) return;
    const donationAmountWEI = ethers.utils.parseEther(amount.toString());

    if (library) {
      console.log(`${account} is about to donate`, donationAmountWEI/1e18, "ETH");
      requestDonateToWallet({value: donationAmountWEI});
      setWalletOpened(true);
    }
  }

  return (
    <Layout>
      <section class="hero-v1-area">
        <div class="container">
          <div class="hero-v1-wrapper">
            <div class="hero-v1-thumb">
              <img src={`assets/images/card-image-${tier}.jpg`} alt="hero" class="banner-image" />
              <p class="bannar-text">“{flavorText}”</p>
            </div>
            <div class="hero-v1-content">
              <div class="shape">
                <img src="assets/img/shape/triangle.png" alt="shape" />
              </div>
              <div class="title">
                <img src="assets/img/logo/hero-logo.svg" alt="logo" />
                <h2>Edition 001: Origin</h2>
              </div>
                

                {
                !alreadyDonated?
                <>
                <div class="tree-group">
                  <div class="single-tree">
                    <div class="tree-img small-tree">
                      <img src={`assets/images/tree/tree-1-${tier=='cypress'?'green':'gray'}.png`} alt="tree"/>
                    </div>
                    <div class="tree-title">
                      <h5 class="image-1 image-title">Cypress</h5>
                    </div>
                  </div>
                  <div class="single-tree">
                    <div class="tree-img meduum-tree">
                      <img src={`assets/images/tree/tree-2-${tier=='araucaria'?'green':'gray'}.png`} alt="tree"/>
                    </div>
                    <div class="tree-title">
                      <h5 class="image-2 image-title">Araucaria</h5>
                    </div>
                  </div>
                  <div class="single-tree">
                    <div class="tree-img">
                      <img src={`assets/images/tree/tree-3-${tier=='sequoia'?'green':'gray'}.png`} alt="tree"/>
                    </div>
                    <div class="tree-title">
                      <h5 class="image-3 image-title">Sequoia</h5>
                    </div>
                  </div>
                </div>
                <div class="range-input">
                    <input type="range" min="1" max="100" value="1" step="0.1" list="tickmarks" id="rangeInput" />
                    <div id="selector" style={{left: `${amount}%`}}>
                      <div class="SelectBtn">
                      </div>
                    </div>
                    <div id="Progressbar" style={{width: `${amount}%`}}></div>
                    <Slider 
                      value={amount}
                      min={1}
                      step={1}
                      max={100}
                      disabled={alreadyDonated}
                      marks={sliderMarks}
                      onChange={handleSliderChange}
                    />
                </div>
                  {/* v done v */}
                  
                  <div class="donating-value">
                    <h4 class="view-amount">
                      You are donating{" "}
                      <input 
                        className="selected-amount"
                        type="number"
                        value={amount}
                        disabled={alreadyDonated}
                        onChange={handleInputChange}
                        />{" "} <img src="assets/img/icon/eth.svg" height="16" width="16" alt="ETH" /> ETH</h4>
                    <p>
                      We estimate this will help buy ~{hectaresEstimation.toFixed(2)} hectares. 
                      <InformationIcon text={"This is our current best estimate based on early research."}/>
                    </p>
                  </div>
                  <div className="hero-v1-btn">
                    <Button 
                      onClick={donate} 
                      isLoading={walletOpened || donateTx.status=="Mining"}
                      disabled={networkIncorrect || alreadyDonated || insufficientBalance}
                      text={donateButtonText}
                      loadingText={donateButtonLoadingText}
                      />
                  </div>
                </>:
                  <ThanksForDonating tokenId={tokenId}/>
              }
            </div>
          </div>
        </div>
      </section>
      <ConnectWalletModal onOpen={onOpen} isOpen={isOpen} onClose={onClose} ></ConnectWalletModal>
    </Layout>
  );
}

export default IndexPage;
