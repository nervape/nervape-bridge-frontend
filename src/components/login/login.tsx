import React, { useEffect } from 'react';
import Tutorial from '../tutorial/tutorial';
import Footer from '../layout/footer';
import './login.scss';
import MaskGroup from '../../assets/images/login/mask_group.png';
import Title from '../../assets/images/login/title.png';
import TitleM from '../../assets/images/login/title_m.png';
import { getWindowWidthRange, scrollToTop } from '../../utils/util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Login(props: any) {
    const { connectUnipass } = props;
    const widthRange = getWindowWidthRange();
    useEffect(() => {
        setTimeout(() => {
            scrollToTop();
        }, 100);
    }, []);
    return (
        <div className="login">
            <div className="content">
                <div className="top">
                    <div className="title">
                        <img
                            className="title-img"
                            src={widthRange !== 375 ? Title : TitleM}
                            alt="Title"
                        />
                    </div>
                    <div className="mask-cover">
                        <img className="mask-group" src={MaskGroup} alt="MaskGroup" />
                    </div>
                    <div className="bottom-content">
                        <div className="description">
                            The Nervape Bridge is a one-way bridge that allows holders to migrate
                            their Nervape NFTs from Nervos Layer 1 to Godwoken. NFTs bridged to
                            Godwoken will satisfy the ERC-721 standard.
                        </div>
                        <div className="login-btn">
                            <button className="login-image" onClick={() => connectUnipass()}>
                                CONNECT TO UNIPASS V3
                            </button>
                            {/* <span className="coming_on">COMING ON NOVEMBER 16, 2:00 AM (UTC)</span> */}
                        </div>
                        <Tutorial></Tutorial>
                    </div>
                </div>
                <div className="bottom"></div>
            </div>
            <Footer></Footer>
        </div>
    );
}
