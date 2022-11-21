import React from 'react';
import './confirm.scss';

export default function Confirm(props) {
    const { bridgeNft, closeConfirm, show } = props;
    return (
        <div className={`confirm-container ${show && 'show'}`}>
            <div className="confirm-content">
                <div className="desc">
                    The Nervape Bridge is a one-way bridge. After bridging the NFTs to Godwoken, you
                    won’t be able to bridge them back to Nervos Layer 1.
                </div>
                <div className="btn-groups">
                    <button className="cancel btn" onClick={closeConfirm}>
                        CANCEL
                    </button>
                    <button className="confirm btn" onClick={bridgeNft}>
                        PROCEED TO BRIDGE
                    </button>
                </div>
            </div>
        </div>
    );
}
