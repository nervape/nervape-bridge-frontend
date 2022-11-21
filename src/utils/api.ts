import { OutPoint, Output } from '@ckb-lumos/lumos';
import { Address } from '@lay2/pw-core';
import { HISTORY } from '../components/history/history';

import { fetch } from './fetch';
import { CONFIG } from './config';
import { NFT, BridgeToken } from './nft';

export type CkbIndexerCell = {
    block_number: string;
    out_point: OutPoint;
    output: Output;
    output_data: string;
    tx_index: string;
};

export async function getNFTsAtAddress(address: Address) {
    const addressLockScript = address.toLockScript().serializeJson();
    const response = await fetch(CONFIG.CKB_INDEXER_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: 2,
            jsonrpc: '2.0',
            method: 'get_cells',
            params: [
                {
                    script: addressLockScript,
                    script_type: 'lock',
                    filter: {
                        code_hash: CONFIG.MNFT_TYPE_CODE_HASH,
                        hash_type: 'type',
                        args: CONFIG.NERVAPE_MNFT_ISSUER_ID
                    }
                },
                'asc',
                '0x3e8'
            ]
        })
    });
    const result = await response.json();

    return (
        (result.result.objects as CkbIndexerCell[])
            .filter(o => o.output.type?.code_hash === CONFIG.MNFT_TYPE_CODE_HASH)
            // .filter(o => {
            //     // filter nervape nft
            //     const classId = o.output.type?.args?.substr(42, 8);
            //     const issuerId = o.output.type?.args?.substr(0, 42);
            //     return (
            //         classId &&
            //         issuerId &&
            //         parseInt(classId, 16) < 0xc &&
            //         issuerId === `0x${CONFIG.NERVAPE_MNFT_ISSUER_ID}`
            //     );
            // })
            .map(o => {
                if (!o.output.type) {
                    throw new Error('NFT has missing Type Script arguments.');
                }

                return new NFT(o.out_point, o.output_data, o.output.type?.args);
            })
    );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getHistories(address: string) {
    // api
    const histories: HISTORY[] = [
        {
            completed_at: 1668569919240,
            from_chain_address:
                'ckb1qrgp752jcfnm0uemj723grpyva6zappyuj0tuge3etkpjlmjsxmq5qw65xn32dy2e93rtxaevck5ts2sdj986vgtec556',
            from_chain_tx_hash:
                '0x9ecf742c9e05b08ffd3d90f0ca8ce19691c51019ab20d0cd66b9d7e5ee37cc47',
            status: 'Completed',
            submitted_at: 1668569790777,
            to_chain_address: '0xd4f98d41f2e0ee9960635fa49be3a6a1f6016968',
            to_chain_tx_hash: '0xa8f74313dde51985520c3223ab9aaf17d76f8ea818e56a0d9715a0b880d67027',
            tokens: [
                {
                    from_chain_class_id: 1,
                    from_chain_class_name: 'Nervape / GROOVY Developer',
                    from_chain_token_id: 67,
                    to_chain_class_type: 'character',
                    to_chain_token_id: 10020068,
                    _id: '63745b1adc76ddae22190917'
                }
            ]
        }
    ];
    return histories;
}

export async function insertHistories(
    address: string,
    tx_hash: string,
    toAddress: string,
    tokens: BridgeToken[]
) {
    // await fetch(``, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         from_chain_tx_hash: tx_hash,
    //         to_chain_address: toAddress,
    //         tokens
    //     })
    // });
    console.log('success', address, tx_hash, toAddress, tokens);
}
