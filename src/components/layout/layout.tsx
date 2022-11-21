import React, { useEffect, useState } from 'react';
import { DataContext, getWindowWidthRange } from '../../utils/util';
import Header from './header';
import './layout.scss';

export function Layout({ children }) {
    const [windowWidth, setWindowWidth] = useState(0);

    function fnResizeWindow() {
        const width = getWindowWidthRange();
        setWindowWidth(width);
    }

    useEffect(() => {
        fnResizeWindow();
        window.addEventListener('resize', fnResizeWindow, true);
        return () => {
            window.removeEventListener('resize', fnResizeWindow, true);
        };
    }, []);

    return (
        <DataContext.Provider value={{ windowWidth }}>
            <Header activeIndex={6}></Header>
            <div className="app-container">{children}</div>
        </DataContext.Provider>
    );
}
