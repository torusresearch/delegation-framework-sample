import { address, bytes } from "../utils/solidityTypes";

export interface Caveat {
    enforcer: address;
    terms: bytes;
    args: bytes;
}