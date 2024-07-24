import { ethers, hexlify, toUtf8Bytes } from "ethers";

// Define the Caveat interface
export interface Caveat {
    enforcer: string;
    terms: string;
    args: string;
}

// Define the Delegation class
export class Delegation {
    delegate: string;
    delegator: string;
    authority: string;
    caveats: Caveat[];
    salt: number;
    signature: string;

    constructor(
        delegate: string,
        delegator: string,
        authority: string,
        caveats: Caveat[],
        salt: number,
        signature: string
    ) {
        this.delegate = delegate;
        this.delegator = delegator;
        this.authority = authority;
        this.caveats = caveats;
        this.salt = salt;
        this.signature = signature;
    }

    toJson() {
        return {
            "delegate": this.delegate
        }
    }

    encode(): string {
        const delegationTypes = [
            "address",
            "address",
            "bytes32",
            "tuple(address enforcer, bytes terms, bytes args)[]",
            "uint256",
            "bytes"
        ];

        const formattedCaveats = this.caveats.map(caveat => ({
            enforcer: caveat.enforcer,
            terms: hexlify(toUtf8Bytes(caveat.terms)),
            args: hexlify(toUtf8Bytes(caveat.args))
        }));

        const abiEncoder = new ethers.AbiCoder();

        const encodedDelegation = abiEncoder.encode(
            delegationTypes,
            [
                this.delegate,
                this.delegator,
                this.authority,
                [],
                this.salt,
                this.signature
            ]
        );

        return encodedDelegation;
    }
}
