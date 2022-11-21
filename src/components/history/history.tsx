import React, { useEffect, useState } from 'react';
import { getHistories } from '../../utils/api';
import HistoryDetail from './detail';
import './history.scss';
import SuccessIcon from '../../assets/images/history/success.png';
import FailedIcon from '../../assets/images/history/failed.png';
import PendingIcon from '../../assets/images/history/pending.png';

function HistoryItem(props: { showHistoryDetail: Function; history: HISTORY; index: number }) {
    const { showHistoryDetail, history, index } = props;

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

    return (
        <div
            className="history"
            onClick={() => {
                showHistoryDetail(history, index);
            }}
        >
            <div className="index">{formatIndex(index)}</div>
            <div className="number">{history.tokens.length}</div>
            <div className="date">
                {history.submitted_at ? formatTime(history.submitted_at) : '/'}
            </div>
            <div className="status">
                <img
                    className={history.status}
                    src={
                        // eslint-disable-next-line no-nested-ternary
                        history.status === 'In Progress'
                            ? PendingIcon
                            : history.status === 'Completed'
                            ? SuccessIcon
                            : FailedIcon
                    }
                    alt=""
                />
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
export class HISTORY_NFT {
    from_chain_class_name: string;

    from_chain_class_id: number;

    from_chain_token_id: number;

    to_chain_class_type: string;

    to_chain_token_id: number;

    _id: string;
}

export class HISTORY {
    completed_at: number;

    from_chain_address: string;

    from_chain_tx_hash: string;

    to_chain_tx_hash: string;

    submitted_at: number;

    to_chain_address: string;

    status: string;

    tokens: HISTORY_NFT[];

    index?: number;
}

export default function History(props: { address: string }) {
    const { address } = props;
    const [histories, setHistories] = useState<HISTORY[]>([]);
    const [currHistory, setCurrHistory] = useState<HISTORY>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [timer, setTimer] = useState(null);

    async function fnGetHistories(_address: string) {
        getHistories(_address).then(res => {
            setHistories(res || []);
            const progress = res.filter(history => history.status === 'In Progress');
            if (progress.length) {
                const _timer = setTimeout(() => {
                    fnGetHistories(_address);
                }, 10000);
                setTimer(_timer);
            }
        });
    }
    useEffect(() => {
        fnGetHistories(address);
    }, [address]);

    useEffect(() => {
        return () => {
            // eslint-disable-next-line no-unused-expressions
            timer && clearTimeout(timer);
        };
    });

    function showHistoryDetail(history: HISTORY, index: number) {
        setCurrHistory({ ...history, index });
        setShowDetail(true);
    }

    return (
        <div className="history-content">
            <div className="title-tabs">
                <div className="index">Bridge #</div>
                <div className="number">Count</div>
                <div className="date">Date Bridged</div>
                <div className="status">Status</div>
            </div>
            <div className="histories">
                {histories.map((history, index) => (
                    <HistoryItem
                        key={histories.length - 1 - index}
                        history={history}
                        index={histories.length - 1 - index}
                        showHistoryDetail={showHistoryDetail}
                    ></HistoryItem>
                ))}
            </div>
            <HistoryDetail
                show={showDetail}
                history={currHistory}
                close={() => {
                    setShowDetail(false);
                }}
            ></HistoryDetail>
        </div>
    );
}
