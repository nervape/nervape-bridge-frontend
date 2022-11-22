import PWCore, {
    Builder,
    Address,
    Amount,
    Cell,
    RawTransaction,
    Transaction,
    BuilderOption,
    CellDep,
    AmountUnit,
    AddressPrefix
} from '@lay2/pw-core';
import BasicCollector from './BasicCollector';
import { CONFIG } from './config';

export class TransferNFTBuilder extends Builder {
    constructor(
        private toAddress: Address,
        private cells: Cell[],
        protected options: BuilderOption = {},
        private cellDeps: CellDep[],
        protected collector: BasicCollector,
        private evmAddress: string
    ) {
        super(options.feeRate, collector, options.witnessArgs);
    }

    async build(fee = new Amount('100000', AmountUnit.shannon)): Promise<Transaction> {
        const inputCells: Cell[] = [];
        const outputCells: Cell[] = [];

        if (this.cells.length === 0) {
            throw new Error('no live cells, not neccessary to change lock');
        }

        const fromAddress = this.cells[0].lock.toAddress(
            CONFIG.PW_CORE_CHAIN_ID === 0 ? AddressPrefix.Mainnet : AddressPrefix.Testnet
        );
        const toAddressLock = this.toAddress.toLockScript();

        // let pushOnceEthereumAddressCell = true;

        for (const cell of this.cells) {
            inputCells.push(cell);

            // mNFT Cell
            const outputCell = cell.clone();
            outputCell.lock = toAddressLock;
            outputCells.push(outputCell);
        }

        // mNFT Receiver Ethereum Address
        const ethereumAddressCellData = `0x${CONFIG.NERVAPE_MNFT_ISSUER_ID}${this.evmAddress.slice(
            2
        )}`.toLowerCase();
        const ethereumAddressCell = new Cell(
            new Amount(
                (
                    CONFIG.BRIDGE_STORAGE_ADDRESS_CKB +
                    this.cells.length * CONFIG.BRIDGE_FEE_CKB
                ).toString(),
                AmountUnit.ckb
            ),
            toAddressLock,
            undefined,
            undefined,
            ethereumAddressCellData
        );
        outputCells.push(ethereumAddressCell);

        // Calculate the required capacity.
        // const outputCellsCapacitySum = outputCells.reduce((a, b) => a.add(b.capacity), Amount.ZERO);

        // Input MNFT cell already contains CKB for creating output cell
        const neededAmount = ethereumAddressCell.capacity.add(fee);

        // Add necessary capacity.
        const capacityCells = await this.collector.collectCapacity(fromAddress, neededAmount);
        for (const cell of capacityCells) {
            inputCells.push(cell);
        }

        // Calculate the input capacity and change cell amounts.
        const inputCapacity = capacityCells.reduce((a, c) => a.add(c.capacity), Amount.ZERO);
        const changeCapacity = inputCapacity.sub(neededAmount);

        // Add the change cell.
        const changeLockScript = fromAddress.toLockScript();
        const changeCell = new Cell(changeCapacity, changeLockScript);
        outputCells.push(changeCell);

        // Add the required cell deps.
        const cellDeps = [...this.cellDeps];

        if (PWCore.config) {
            cellDeps.push(
                PWCore.config.defaultLock.cellDep,
                PWCore.config.pwLock.cellDep,
                PWCore.config.sudtType.cellDep
            );
        }

        const rawTx = new RawTransaction(inputCells, outputCells, cellDeps);

        const tx = new Transaction(rawTx, [this.witnessArgs]);
        this.fee = Builder.calcFee(tx, this.feeRate);

        return tx;
    }

    getCollector() {
        return this.collector;
    }
}
