import React from 'react';
import { HISTORY, HISTORY_NFT } from './history';
import './detail.scss';
import { CONFIG } from '../../utils/config';
import { getWindowWidthRange } from '../../utils/util';

export default function HistoryDetail(props: { close: Function; history: HISTORY; show: boolean }) {
    const { close, history, show } = props;
    const widthRange = getWindowWidthRange();
    const contractAddress = {
        character: CONFIG.L2_CHARACTER_ADDRESS,
        scene: CONFIG.L2_SCENE_ADDRESS,
        item: CONFIG.L2_ITEM_ADDRESS,
        special: CONFIG.L2_SPECIAL_ADDRESS
    };

    // eslint-disable-next-line no-shadow
    function formatIndex(index: number) {
        return index < 9 ? `#0${index + 1}` : `#${index + 1}`;
    }

    function formatTime(time: number) {
        const date = new Date(time);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month > 9 ? month : `0${month}`}/${day > 9 ? day : `0${day}`}/${year}`;
    }

    function formatTxHash(txHash: string) {
        const subLength = widthRange !== 375 ? 10 : 5;
        return `${txHash.substr(0, subLength)}...${txHash.substr(
            txHash.length - subLength,
            subLength
        )}`;
    }

    function formatTokenId(tokenId: number) {
        if (tokenId < 10) return `00${tokenId}`;
        if (tokenId < 100) return `0${tokenId}`;
        return tokenId;
    }

    return (
        <div
            className={`history-detail ${show && 'show'}`}
            onClick={() => {
                close();
            }}
        >
            <div
                className="bg"
                onClick={e => {
                    e.stopPropagation();
                }}
            >
                {history && (
                    <div className="detail-content">
                        <div className="row">
                            <div className="left status">
                                <div className="label">Bridge #:</div>
                                <div className="value">{formatIndex(history.index)}</div>
                            </div>
                            <div className="right last-update">
                                <div className="label">Status:</div> {history.status}
                            </div>
                        </div>
                        <div className="row">
                            <div className="left status">
                                <div className="label">Date Bridged:</div>{' '}
                                <div className="value">
                                    {history.submitted_at ? formatTime(history.submitted_at) : '/'}
                                </div>
                            </div>
                            <div className="right last-update">
                                <div className="label">Last Update:</div>{' '}
                                <div className="value">
                                    {history.completed_at ? formatTime(history.completed_at) : '/'}
                                </div>
                            </div>
                        </div>
                        <div className="row flex">
                            <div className="left bridge-no">
                                <div className="label">L1 TX:</div>
                                <div className="value">
                                    <a
                                        target="_blank"
                                        href={`${CONFIG.BRIDGE_L1_TX_ADDRESS}/${history.from_chain_tx_hash}`}
                                    >
                                        {formatTxHash(history.from_chain_tx_hash)}
                                    </a>
                                </div>
                            </div>
                            <div className="right bridge-no">
                                <div className="label">L2 TX:</div>
                                <div className="value">
                                    {history.to_chain_tx_hash ? (
                                        <a
                                            target="_blank"
                                            href={`${CONFIG.BRIDGE_L2_TX_ADDRESS}tx/${history.to_chain_tx_hash}`}
                                        >
                                            {formatTxHash(history.to_chain_tx_hash)}
                                        </a>
                                    ) : (
                                        '/'
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="row one receipient">
                            <div className="label name">Destination Address:</div>
                            <div className="value">
                                {history.to_chain_address
                                    ? history.to_chain_address.toLowerCase()
                                    : '/'}
                            </div>
                        </div>

                        <div className="row one nft-row">
                            <div className="label bridged-nft">Bridged NFT(s):</div>
                            <div className="nfts">
                                {history.tokens &&
                                    history.tokens.map((nft: HISTORY_NFT, index: number) => (
                                        <div className="nft" key={index}>
                                            <div
                                                className="span cursor"
                                                onClick={() => {
                                                    // eslint-disable-next-line no-useless-return
                                                    if (!nft.to_chain_token_id) return;
                                                    const address = `${
                                                        CONFIG.BRIDGE_L2_TX_ADDRESS
                                                    }nft-item/${
                                                        contractAddress[
                                                            nft?.to_chain_class_type.toLocaleLowerCase()
                                                        ]
                                                    }/${nft.to_chain_token_id}`;
                                                    window.open(address);
                                                }}
                                            >
                                                {`${nft.from_chain_class_name} #${formatTokenId(
                                                    nft.from_chain_token_id
                                                )}`}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
