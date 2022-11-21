import { Address } from '@lay2/pw-core';

export type WALLET_CONNECT = {
    address: string;
    layerOneAddress?: Address;
    username: string;
    expiredAt?: number;
};

const WalletStorageKey = 'Bridge_Wallet_Connect_Info';

export function getStorage() {
    return localStorage.getItem(WalletStorageKey);
}

export function setStorage(info: WALLET_CONNECT) {
    const _info: WALLET_CONNECT = { ...info, expiredAt: new Date().getTime() + 30 * 60 * 1000 };
    localStorage.setItem(WalletStorageKey, JSON.stringify(_info));
}

export function clearStorage() {
    localStorage.removeItem(WalletStorageKey);
}
