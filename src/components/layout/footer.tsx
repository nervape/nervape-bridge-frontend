import React, { useContext } from 'react';
import { DataContext } from '../../utils/util';
import './footer.scss';

export default function Footer() {
    const { windowWidth } = useContext(DataContext);

    return (
        <div className={`footer ${windowWidth === 375 && 'mobile'}`}>
            <div className="copy">@&nbsp;2022&nbsp;&nbsp;Nervape</div>
            <div className="footer-item">
                <div className="wiki">
                    <a
                        target="_block"
                        href="https://tourmaline-elderberry-f93.notion.site/Nervape-Community-Wiki-e46261f411ed42e19b859f48da06fe63"
                    >
                        Nervape Wiki
                    </a>
                </div>
                <div className="brand-assets">
                    <a
                        target="_block"
                        href="https://tourmaline-elderberry-f93.notion.site/Nervape-Brand-Assets-b7c52ca6f17c492e87cd18b5496da8f0"
                    >
                        Brand Assets
                    </a>
                </div>
                <div className="contact-us">
                    <a href="mailto:creative@nervape.com">Contact Us</a>
                </div>
            </div>
        </div>
    );
}
