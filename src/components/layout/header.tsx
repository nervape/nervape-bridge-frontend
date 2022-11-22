import React, { useCallback, useContext, useEffect, useState } from 'react';
import './header.scss';
import logo from '../../assets/images/header/logo_nervape.svg';
import hamburger from '../../assets/images/header/hamburger.svg';
import twitter from '../../assets/images/header/twitter.png';
import discord from '../../assets/images/header/discode.png';

import { DataContext, getWindowScrollTop, scrollToTop } from '../../utils/util';

export interface NavPageInfo {
    title: string;
    url: string;
    type: string;
    image: string;
}

export interface INavProps {
    activeIndex?: number;
    disableFooter?: boolean;
}

interface INavState extends INavProps {
    disableList: boolean;
}

const pages = [
    {
        title: 'ABOUT',
        url: '/about',
        type: 'navbar',
        image: ''
    },
    {
        title: 'STORY',
        url: '/story',
        type: 'navbar',
        image: ''
    },
    {
        title: 'NFT',
        url: '/nft',
        type: 'navbar',
        image: ''
    },
    {
        title: 'CAMPAIGN',
        url: '/campaign',
        type: 'navbar',
        image: ''
    },
    {
        title: 'WALLET',
        url: '/wallet/',
        type: 'navbar',
        image: ''
    },
    {
        title: 'BRIDGE',
        url: '',
        type: 'navabar',
        image: ''
    }
    // {
    //   title: "",
    //   url: "https://twitter.com/Nervapes",
    //   image: twitter,
    //   type: "icon"
    // },
    // {
    //   title: "",
    //   url: "https://discord.com/invite/7br6nvuNHP",
    //   image: discord,
    //   type: "icon"
    // }
];

export default function NavHeader(props: any) {
    const { activeIndex } = props;
    const [disableList, setDisableList] = useState(true);
    const [hideHeader, setHideHeader] = useState(false);

    const { windowWidth } = useContext(DataContext);

    function filterNfts() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let timer: any;
        let lastTop = 0;
        return function() {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                const currTop = getWindowScrollTop();
                if (currTop - lastTop > 10) {
                    setHideHeader(true);
                    setDisableList(true);
                } else if (currTop - lastTop < -10) {
                    setHideHeader(false);
                }
                lastTop = currTop;
            }, 0);
        };
    }

    const fnFilter = useCallback(filterNfts(), []);

    function fnScrollPage() {
        fnFilter();
    }

    useEffect(() => {
        if (!disableList) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [disableList]);
    useEffect(() => {
        scrollToTop();
        window.addEventListener('scroll', fnScrollPage, true);
        return () => {
            window.removeEventListener('scroll', fnScrollPage, true);
        };
    }, []);

    return (
        <div className={`header-container ${hideHeader && 'hide'}`}>
            <div className={`header ${!disableList && 'disable'}`}>
                <img
                    className="logo"
                    src={logo}
                    onClick={() => {
                        setDisableList(true);
                        window.scrollTo(0, 0);
                    }}
                />
                <div className="hamburger-c">
                    <img
                        className="hamburger"
                        src={hamburger}
                        onClick={() => {
                            setDisableList(!disableList);
                        }}
                    />
                </div>
                <div
                    className="header-menu"
                    onClick={() => {
                        setDisableList(true);
                    }}
                >
                    <ul
                        className={`btn-group ${disableList === true ? 'active-group' : ''}`}
                        onClick={e => {
                            e.stopPropagation();
                        }}
                    >
                        {pages?.map((v: NavPageInfo, i: number) => {
                            return (
                                <div
                                    className={`nav-area ${v.type} ${
                                        activeIndex === i + 1 ? 'active' : ''
                                    }`}
                                    key={i}
                                    onClick={() => {
                                        setDisableList(true);
                                        if (!v.url) return;
                                        window.scrollTo(0, 0);
                                    }}
                                >
                                    <div className="title-text">{v.title}</div>
                                </div>
                            );
                        })}
                        <div className={`icon-nav-c ${windowWidth === 375 && 'mobile'}`}>
                            <div
                                className={`nav-area icon`}
                                onClick={() => {
                                    setDisableList(true);
                                    window.open('https://twitter.com/Nervapes');
                                }}
                            >
                                <img className="icon-image" src={twitter} alt="" />
                            </div>
                            <div
                                className={`nav-area icon`}
                                onClick={() => {
                                    setDisableList(true);
                                    window.open('https://discord.com/invite/7br6nvuNHP');
                                }}
                            >
                                <img className="icon-image" src={discord} alt="" />
                            </div>
                        </div>
                    </ul>
                </div>
            </div>
        </div>
    );
}
