/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from 'react';
import './app.scss';
import './assets/fonts/ethnocentric_book_macroman/stylesheet.css';
import 'react-toastify/dist/ReactToastify.css';

import { Address, NervosAddressVersion } from '@lay2/pw-core';
import { BridgeToken, EnrichedMNFT, TransactionBuilderExpectedMNFTData } from './utils/nft';
import { CONFIG } from './utils/config';
import { UnipassV3Wrapper } from './UnipassV3Wrapper';
import { Layout } from './components/layout/layout';
import Login from './components/login/login';
import Account from './components/account/account';
import Bridge from './components/bridge/bridge';
import History from './components/history/history';
import Footer from './components/layout/footer';
import { insertHistories } from './utils/api';
import { scrollToTop } from './utils/util';
import { clearStorage, getStorage, setStorage, WALLET_CONNECT } from './utils/Wallet';

import LoadingGif from './assets/images/loading.gif';

function LoadingModal(props: { show: boolean }) {
    const { show } = props;
    return (
        <div className={`loading-modal ${show && 'show'}`}>
            <div className="loading-content">
                <img src={LoadingGif} alt="LoadingGif" />
                <div className="text">Loading, please wait...</div>
            </div>
        </div>
    );
}

export function App() {
    const [accounts, setAccounts] = useState<string[]>();
    const [receiverAddress, setReceiverAddress] = useState<string>();
    const [layerOneAddress, setLayerOneAddress] = useState<Address>();
    const [layerOneAddressString, setLayerOneAddressString] = useState<string>();
    const [layerOneTransactionHash, setLayerOneTransactionHash] = useState<string>();
    const [unipassV3Wrapper, setUnipassV3Wrapper] = useState<UnipassV3Wrapper>();
    const [balance, setBalance] = useState('0.0');
    const [loading, setLoading] = useState(false);

    const [tabs, setTabs] = useState(['BRIDGE', 'HISTORY']);
    const [selectTab, setSelectTab] = useState('BRIDGE');

    const [isInitPage, setIsInitPage] = useState(false);

    const account = accounts?.[0];

    async function updateBalance() {
        if (unipassV3Wrapper) {
            await unipassV3Wrapper.getBalance();
            setBalance(unipassV3Wrapper.myBalance);
        }
    }
    async function connectUnipass() {
        setLoading(true);
        try {
            const wrapper = new UnipassV3Wrapper();
            await wrapper.init();
            await wrapper.connect();
            setUnipassV3Wrapper(wrapper);
            setLoading(false);
            setLayerOneAddress(wrapper.layerOneAddress);
            setBalance(wrapper.myBalance);
        } catch {
            setLoading(false);
        }
    }

    async function getTransaction(txHash: string) {
        const tx = await unipassV3Wrapper.getTransaction(txHash);
        return tx;
    }
    async function bridgeSelectedItems(nftList, nftChecked, toAddress) {
        setLoading(true);
        const _processedMNFTs: TransactionBuilderExpectedMNFTData[] = [];
        const selectedMNFTs: EnrichedMNFT[] = nftChecked;
        const tokens: BridgeToken[] = [];
        try {
            for (const { token: nft, name } of selectedMNFTs) {
                const classTypeArgs = nft.nftClassCell?.output.type?.args;
                const nftTypeArgs = nft.typeScriptArguments;

                if (!classTypeArgs) {
                    throw new Error('classTypeArgs undefined');
                }

                const unipassExpectedNft: TransactionBuilderExpectedMNFTData = {
                    classTypeArgs,
                    nftTypeArgs,
                    tokenId: nft.getTypeScriptArguments().tokenId.toString(),
                    outPoint: {
                        txHash: nft.outpoint.tx_hash,
                        index: nft.outpoint.index
                    }
                };

                _processedMNFTs.push(unipassExpectedNft);
                tokens.push({
                    from_chain_class_name: name,
                    from_chain_class_id: nft.getTypeScriptArguments().classId,
                    from_chain_token_id: nft.getTypeScriptArguments().tokenId
                });
            }

            const transactionId: string = await unipassV3Wrapper.bridgeMNFTS(
                CONFIG.LAYER_ONE_BRIDGE_CKB_ADDRESS,
                _processedMNFTs,
                receiverAddress
            );

            await insertHistories(layerOneAddressString, transactionId, toAddress, tokens);
            setLayerOneTransactionHash(transactionId);
            localStorage.setItem('processTxHash', transactionId);
            localStorage.setItem('processTokens', JSON.stringify(tokens));
            await unipassV3Wrapper.getBalance();
            setBalance(unipassV3Wrapper.myBalance);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }

    async function initLogin() {
        const _storage = getStorage();
        if (!_storage) {
            setIsInitPage(true);
            return;
        }
        const _storageJson: WALLET_CONNECT = JSON.parse(_storage);
        if (new Date().getTime() <= _storageJson.expiredAt) {
            setLayerOneAddressString(_storageJson.address);
            const wrapper = new UnipassV3Wrapper();
            wrapper.username = _storageJson.username;
            wrapper.layerOneAddress = _storageJson.layerOneAddress;
            await wrapper.init();
            setUnipassV3Wrapper(wrapper);
            await wrapper.getBalance();
            setBalance(wrapper.myBalance);
        } else {
            clearStorage();
        }
        setIsInitPage(true);
    }

    useEffect(() => {
        initLogin();
    }, []);

    useEffect(() => {
        if (layerOneAddress) {
            const _address = layerOneAddress.toCKBAddress(NervosAddressVersion.latest);
            setLayerOneAddressString(_address);
            setStorage({ address: _address, username: unipassV3Wrapper.username, layerOneAddress });
            scrollToTop();
        } else {
            // setLayerOneAddressString(undefined);
        }
    }, [layerOneAddress]);

    if (!isInitPage) return <></>;

    return (
        <Layout>
            {!layerOneAddressString ? (
                <Login connectUnipass={connectUnipass}></Login>
            ) : (
                <>
                    <div className="container">
                        <Account address={layerOneAddressString} balance={balance}></Account>
                        <div className="tabs-container">
                            <div className="tabs flex-center">
                                {tabs.map((tab, index) => (
                                    <div
                                        className={`tab ${selectTab === tab ? 'active' : ''}`}
                                        key={index}
                                        onClick={() => {
                                            setSelectTab(tab);
                                        }}
                                    >
                                        {tab}
                                    </div>
                                ))}
                            </div>
                            <div className="content">
                                {selectTab === 'BRIDGE' ? (
                                    <Bridge
                                        address={layerOneAddressString}
                                        setReceiverAddress={setReceiverAddress}
                                        viewHistory={() => {
                                            scrollToTop();
                                            setLayerOneTransactionHash('');
                                            setSelectTab('HISTORY');
                                        }}
                                        setLoading={(show: boolean) => {
                                            setLoading(show);
                                        }}
                                        balance={balance}
                                        updateBalance={updateBalance}
                                        bridgeNft={bridgeSelectedItems}
                                        getTransaction={getTransaction}
                                        txHash={layerOneTransactionHash}
                                        clearTxHash={() => {
                                            setLayerOneTransactionHash('');
                                        }}
                                    ></Bridge>
                                ) : (
                                    <History address={layerOneAddressString}></History>
                                )}
                            </div>
                        </div>
                    </div>
                    <Footer></Footer>
                </>
            )}
            <LoadingModal show={loading}></LoadingModal>
        </Layout>
    );
}
