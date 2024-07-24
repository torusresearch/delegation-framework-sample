
import { ecsign, toRpcSig, keccak256 } from "ethereumjs-util";
import { getBytes } from "ethers";
import { ENTRYPOINT_ADDRESS_V07, getAccountNonce, getUserOperationHash } from "permissionless";
import { EntryPointVersion, UserOperation } from "permissionless/_types/types";

export async function signUserOp(op: UserOperation<EntryPointVersion>, privateKey: string, chainId: number): Promise<UserOperation<EntryPointVersion>> {
    const message = getUserOperationHash({
        userOperation: op as any,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        chainId: chainId
    });

    const msg = Buffer.concat([
        Buffer.from('\x19Ethereum Signed Message:\n32', 'ascii'),
        Buffer.from(getBytes(message))
    ])

    console.log("Sig", op.signature);

    const sigResponse = ecsign(keccak256(msg), Buffer.from(getBytes(`0x${privateKey}`)))
    const signature = toRpcSig(sigResponse.v, sigResponse.r, sigResponse.s)
    op.signature = signature as any;
    return op;
}

export async function prepareUserOp(bundlerClient: any, publicClient: any, delegator: string, callData: any): Promise<UserOperation<EntryPointVersion>> {
    const nonce = await getAccountNonce(publicClient, {
        sender: delegator as any,
        entryPoint: ENTRYPOINT_ADDRESS_V07
    });

    const gasPrice = await bundlerClient.getUserOperationGasPrice();

    const userOperation: UserOperation<EntryPointVersion> = {
        sender: delegator as any,
        nonce: nonce,
        callData: callData as any,
        callGasLimit: BigInt(0),
        verificationGasLimit: BigInt(0),
        preVerificationGas: BigInt(0),
        maxFeePerGas: gasPrice.standard.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.standard.maxPriorityFeePerGas,
        signature: '0x'
    };

    const gasEstimate = await bundlerClient.estimateUserOperationGas({
        userOperation: userOperation,
    });

    userOperation.callGasLimit = gasEstimate.callGasLimit;
    userOperation.verificationGasLimit = gasEstimate.verificationGasLimit;
    userOperation.preVerificationGas = gasEstimate.preVerificationGas;
    return userOperation;
}