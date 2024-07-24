import { ethers } from "ethers";
import { address, bytes, uint256 } from "../utils/solidityTypes";

export class Action {
    to: address;
    value: uint256;
    data: bytes;

    constructor(to: address, value: uint256, data: bytes) {
        this.to = to;
        this.value = value;
        this.data = data;
    }

    encode(): string {
        const delegationTypes = [
            "address",
            "uint256",
            "bytes",
        ];

        const abiEncoder = new ethers.AbiCoder();
        return abiEncoder.encode(
            delegationTypes,
            [
                this.to,
                this.value,
                this.data,
            ]
        );
    }
}