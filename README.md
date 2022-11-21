# Nervos mNFT to Godwoken bridge (Unipass v3)

## Run

```
yarn && yarn start
```

## Build

```
yarn build
```

## Bridge Architecture

This bridge is a centralized (!) way to send mNFT (one of available NFT standards on Nervos) on Nervos Layer 1 to a specific "bridge" account and then receive it to a user-defined receiving Ethereum address.

The mNFT standard is going to be processed and stored as metadata for Layer 2 EVM NFT using ERC721 standard.

## License

MIT