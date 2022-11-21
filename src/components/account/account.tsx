import React, { useEffect, useState } from 'react';
import './account.scss';
import 'antd/dist/antd.css';
import { Dropdown, Menu, message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getWindowWidthRange } from '../../utils/util';
import { clearStorage } from '../../utils/Wallet';
// import BridgeTitle from '../../assets/images/login/bridge_title.png';

export default function Account({ address, balance }) {
    const [myAddress, setMyAddress] = useState('');
    const [open, setOpen] = useState(false);
    const widthRange = getWindowWidthRange();

    const menu = (
        <Menu
            items={[
                {
                    label: (
                        <CopyToClipboard
                            text={address}
                            onCopy={() => {
                                message.success(`Copy Success!`);
                                setOpen(false);
                            }}
                        >
                            <span>Copy Address</span>
                        </CopyToClipboard>
                    ),
                    key: '0'
                },
                {
                    label: (
                        <button
                            className="logout-out cursor"
                            onClick={() => {
                                sessionStorage.removeItem('UP-A');
                                clearStorage();
                                window.location.reload();
                            }}
                        >
                            Sign Out
                        </button>
                    ),
                    key: '1'
                }
            ]}
        ></Menu>
    );

    useEffect(() => {
        const subLength = widthRange !== 375 ? 7 : 5;
        const dotStr = widthRange !== 375 ? '......' : '...';
        setMyAddress(
            `${address.substr(0, subLength)}${dotStr}${address.substr(
                address.length - subLength,
                subLength
            )}`
        );
    }, [address, balance]);

    return (
        <div className="account">
            <div className="title">
                <span>NERVAPE BRIDGE</span>
            </div>
            <Dropdown
                overlay={menu}
                trigger={['click', 'hover']}
                overlayClassName="account-dropmenu"
                onOpenChange={_open => {
                    setOpen(_open);
                }}
            >
                <div className={`address cursor ${open && 'open'}`}>
                    <span>{myAddress}</span>
                </div>
            </Dropdown>
        </div>
    );
}
