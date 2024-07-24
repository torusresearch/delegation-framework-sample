import { AbiCoder } from "ethers";
import { Delegation } from "../types/delegation";

const abiEncoder = new AbiCoder();
export function encodeDelgations(delegations: [Delegation]): string {
    return abiEncoder.encode(
        [`tuple( 
          address delegate,
          address delegator,
          bytes32 authority,
          tuple(address enforcer, bytes terms, bytes args)[] caveats,
          uint256 salt,
          bytes signature
       )[]`],
        [delegations]
    )
}