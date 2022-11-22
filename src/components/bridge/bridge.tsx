import { Address, AddressType } from '@lay2/pw-core';
import React, { useCallback, useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import { getNFTsAtAddress } from '../../utils/api';
import { CONFIG } from '../../utils/config';
import { BridgeToken, EnrichedMNFT } from '../../utils/nft';
// import Tutorial from '../tutorial/tutorial';

import './brigde.scss';

import Layer1Icon from '../../assets/images/bridge/layer-1.png';
import GodwokenIcon from '../../assets/images/bridge/godwoken.png';
import CloseIcon from '../../assets/images/bridge/close.png';
import InfoIcon from '../../assets/images/bridge/info_icon.png';
import Confirm from './confirm';
import useIntervalAsync from '../../hooks/useIntervalAsync';

export class NFT {
    checked: boolean;

    renderer: string;

    name: string;
}

function NFTItem(props: { nft: EnrichedMNFT; nftSelected: Function }) {
    const { nft, nftSelected } = props;

    return (
        <div
            className={`nft ${nft.checked ? 'selected' : ''}`}
            onClick={() => {
                nftSelected();
            }}
        >
            <div className="cover-bg">
                <img
                    className="cover"
                    src={`${nft.renderer}?x-oss-process=image/resize,h_100,m_lfit`}
                    alt="bg_image_url"
                />
            </div>
            <div className="name" title={nft.name}>
                {nft.name}
            </div>
            <div className="index">{nft.index}</div>
        </div>
    );
}

function Message({ message }) {
    return <div className="message">{message}</div>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Bridge(props: any) {
    const {
        txHash,
        viewHistory,
        address,
        balance,
        bridgeNft,
        setLoading,
        setReceiverAddress,
        clearTxHash,
        updateBalance,
        getTransaction
    } = props;

    const [nftList, setNftList] = useState<EnrichedMNFT[] | undefined>([]);
    const [filter] = useState('');
    const [nftListFilter, setNftListFilter] = useState<EnrichedMNFT[]>([]);
    const [nftChecked, setNftChecked] = useState([]);
    const [messages, setMessages] = useState([]);
    const [toAddress, setToAddress] = useState('');
    const [myBalance, setMyBalance] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [totalFee, setTotalFee] = useState(0);

    const [canBridge, setCanBridge] = useState(false);

    const isBridging = useCallback(async () => {
        const tx_hash = localStorage.getItem('processTxHash');
        if (tx_hash) {
            const tx = await getTransaction(tx_hash);
            if (tx?.tx_status?.status === 'pending') {
                setCanBridge(false);
            } else {
                setCanBridge(true);
                localStorage.removeItem('processTxHash');
                localStorage.removeItem('processTokens');
            }
        } else {
            setCanBridge(true);
        }
    }, []);

    const updateBridgingStatus = useIntervalAsync(isBridging, 10000);
    useEffect(() => {
        updateBalance();
    }, []);

    useEffect(() => {
        setMyBalance(`${balance} CKB`);
    }, [balance]);

    useEffect(() => {
        if (nftList && nftList.length) {
            setNftChecked(nftList.filter(nft => nft.checked));
            const _filter = filter.toLowerCase();
            setNftListFilter(
                nftList.filter(nft => {
                    const name = nft.name.toLowerCase();
                    const issuerName = nft.issuerName.toLowerCase();
                    if (name.includes(_filter)) {
                        return true;
                    }
                    if (issuerName.includes(_filter)) {
                        return true;
                    }
                    return false;
                })
            );
        } else {
            setNftChecked([]);
            setNftListFilter([]);
        }
    }, [nftList, filter]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function updateToAddress(e: any) {
        setToAddress(e.target.value);
        setReceiverAddress(e.target.value);
    }

    function formatTokenId(tokenId: number) {
        if (tokenId < 10) return `00${tokenId}`;
        if (tokenId < 100) return `0${tokenId}`;
        return tokenId;
    }

    async function fetchMNFTs() {
        setNftList(undefined);
        setLoading(true);
        try {
            const _address = new Address(address, AddressType.ckb);
            const processTokens = localStorage.getItem('processTokens');
            let _MNFTs = await getNFTsAtAddress(_address);
            const _processedMNFTs: EnrichedMNFT[] = [];
            if (processTokens) {
                const _processTokens: BridgeToken[] = JSON.parse(processTokens);
                _MNFTs = _MNFTs.filter(t => {
                    let flag = true;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    _processTokens.forEach((_token: BridgeToken) => {
                        if (
                            t.getTypeScriptArguments().tokenId === _token.from_chain_token_id &&
                            t.getTypeScriptArguments().classId === _token.from_chain_class_id
                        ) {
                            flag = false;
                        }
                    });
                    return flag;
                });
            }
            for (const token of _MNFTs) {
                await token.getConnectedClass();
                await token.getConnectedIssuer();

                const classData = token.getClassData();
                const issuerData = token.getIssuerData();

                _processedMNFTs.push({
                    tokenId: token.id,
                    name: `${classData.name}`,
                    index: `#${formatTokenId(token.getTypeScriptArguments().tokenId)}`,
                    renderer: classData.renderer,
                    issuerName: issuerData.info.name,
                    checked: false,
                    token
                });
            }
            setNftList(_processedMNFTs);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }

    useEffect(() => {
        if (txHash) {
            setShowConfirm(false);
            fetchMNFTs();
        }
    }, [txHash]);

    useEffect(() => {
        if (!address) return;
        updateBridgingStatus();
        fetchMNFTs();
    }, [address]);

    useEffect(() => {
        if (!nftChecked.length) setTotalFee(0);
        setTotalFee(
            CONFIG.BRIDGE_STORAGE_ADDRESS_CKB +
                nftChecked.length * CONFIG.BRIDGE_FEE_CKB +
                CONFIG.BRIDGE_L1_FEE_CKB
        );
    }, [nftChecked]);

    return (
        <>
            <div className="bridge-content">
                <div className="inner-content">
                    <div className="source-content">
                        <div className="label">Source</div>
                        <div className="layer-1">
                            <img src={Layer1Icon} className="layer-1-icon" />
                            Nervos Layer1
                        </div>
                    </div>
                    <div className="row select-nft">
                        <div className="label">Select NFT(s) to bridge:</div>
                        <hr className="full-width dotted" />
                        <div className="nfts">
                            {nftListFilter.map((nft, index) => (
                                <NFTItem
                                    key={index}
                                    nft={nft}
                                    nftSelected={() => {
                                        const list = [...nftList];
                                        list[index].checked = !list[index].checked;
                                        setNftList(list);
                                    }}
                                ></NFTItem>
                            ))}
                        </div>
                        <hr className="full-width dotted" />
                        <div className="selected-bridge">
                            <div className="item selected-item">
                                <div className="value">{nftChecked.length}</div>
                                <div className="name">Selected NFT(s)</div>
                            </div>
                            <div className="item bridge-fee-item">
                                <div className="value">
                                    {nftChecked.length > 0
                                        ? CONFIG.BRIDGE_STORAGE_ADDRESS_CKB +
                                          nftChecked.length * CONFIG.BRIDGE_FEE_CKB +
                                          CONFIG.BRIDGE_L1_FEE_CKB
                                        : 0}{' '}
                                    CKB
                                </div>
                                <div className="name tooltip-name">
                                    <Tooltip
                                        title={() => {
                                            return (
                                                <>
                                                    <p>-&nbsp;L1 Cell Fee: 110 CKB</p>
                                                    <p className="l1-gas">
                                                        -&nbsp;L1 Gas Fee:{' '}
                                                        {CONFIG.BRIDGE_L1_FEE_CKB} CKB
                                                    </p>
                                                    <p>
                                                        -&nbsp;Godwoken Estimated Gas Fee:{' '}
                                                        {CONFIG.BRIDGE_FEE_CKB}
                                                    </p>
                                                    <p>
                                                        <span style={{ opacity: 0 }}>-</span>
                                                        &nbsp;CKB per NFT
                                                    </p>
                                                </>
                                            );
                                        }}
                                        placement="bottom"
                                        trigger={['hover', 'click']}
                                        overlayClassName="tooltip"
                                        color="#506077"
                                    >
                                        Bridge Fee
                                        <img className="info-icon" src={InfoIcon} alt="InfoIcon" />
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="item curr-balance-item">
                                <div className="value">{myBalance}</div>
                                <div className="name">Current Balance</div>
                            </div>
                            {nftChecked.length && balance - totalFee < 61 ? (
                                <div className="item warning-tip">
                                    *Your remaining balance after the transfer must be bigger than
                                    61 CKB
                                </div>
                            ) : (
                                ''
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="destination-content">
                <div className="inner-content">
                    <div className="des-content">
                        <div className="label">Destination</div>
                        <div className="layer-2">
                            <img src={GodwokenIcon} className="layer-2-icon" />
                            Godwoken
                        </div>
                    </div>
                    <div className="row to-address">
                        <input
                            type="text"
                            value={toAddress}
                            onInput={e => {
                                updateToAddress(e);
                            }}
                            onChange={e => {
                                updateToAddress(e);
                            }}
                            placeholder="Destination Address"
                        />
                    </div>
                </div>
            </div>
            <div className="bridge-btn-c">
                {canBridge ? (
                    <button
                        className="btn cursor bridge-btn"
                        onClick={() => {
                            const _messages = [];
                            const regex = /^0x[0-9a-fA-F]{40}$/;
                            // eslint-disable-next-line radix
                            if (parseInt(balance) < totalFee) {
                                _messages.push(
                                    <>
                                        <p>
                                            -&nbsp;Insufficient Balance. Please make sure the
                                            current address has at lease
                                        </p>
                                        <p>
                                            <span style={{ opacity: 0 }}>-</span>
                                            &nbsp;{totalFee} CKB of balance.
                                        </p>
                                    </>
                                );
                            }
                            // eslint-disable-next-line radix
                            if (parseInt(balance) - totalFee < 61) {
                                _messages.push(
                                    <>
                                        <p>
                                            -&nbsp;Your remaining balance after the transfer must be
                                            bigger than 61 CKB
                                        </p>
                                    </>
                                );
                            }
                            if (!nftChecked.length) {
                                _messages.push('- Please select at least 1 NFT to bridge.');
                            }
                            if (!regex.test(toAddress)) {
                                _messages.push(
                                    '- The entered address invalid. Please enter a Godwoken address.'
                                );
                            }
                            setMessages(_messages);
                            if (!_messages.length) {
                                setShowConfirm(true);
                            }
                        }}
                    >
                        BRIDGE
                    </button>
                ) : (
                    <Tooltip
                        title={() => {
                            return (
                                <>
                                    <p>You will be able to request for</p>
                                    <p>another bridge once the previous</p>
                                    <p>bridge is commited</p>
                                </>
                            );
                        }}
                        trigger={['click', 'hover']}
                        overlayClassName="tooltip commit-bridge-tooltip"
                        color="#506077"
                    >
                        <div className="btn cursor committing-bridge">COMMITTING BRIDGE</div>
                    </Tooltip>
                )}
            </div>
            {/* <Tutorial></Tutorial> */}
            <div className="contract-us-tip tip">
                If you encounter issues, please contact us at{' '}
                <a href="mailto:dev@nervape.com">dev@nervape.com</a>
            </div>
            <div className={`messages ${messages.length > 0 && 'show'}`}>
                <div className="message-content">
                    <img
                        src={CloseIcon}
                        className="close"
                        onClick={() => {
                            setMessages([]);
                        }}
                    />
                    {messages.map((message, i) => (
                        <Message key={i} message={message}></Message>
                    ))}
                </div>
            </div>
            <div
                className={`bridge-success-content ${txHash && 'show'}`}
                onClick={() => {
                    clearTxHash();
                }}
            >
                <div
                    className="bridge-success"
                    onClick={e => {
                        e.stopPropagation();
                    }}
                >
                    <div className="tip">
                        Bridge request submitted! You can now view the bridging progress in the
                        history tab.
                    </div>
                    <div className="btn-groups">
                        <button
                            className="btn view-history cursor"
                            onClick={() => {
                                viewHistory();
                            }}
                        >
                            VIEW IN HISTORY
                        </button>
                    </div>
                </div>
            </div>

            <Confirm
                closeConfirm={() => {
                    setShowConfirm(false);
                }}
                show={showConfirm}
                bridgeNft={() => {
                    bridgeNft(nftList, nftChecked, toAddress);
                }}
            ></Confirm>
        </>
    );
}
