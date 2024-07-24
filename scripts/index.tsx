
import { artifacts } from "hardhat";
import { ENTRYPOINT_ADDRESS_V07, createBundlerClient } from "permissionless";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { sepolia } from "viem/chains";
import { http } from "viem";
import { Delegation } from "./types/delegation";
import { encodeFunctionCall } from "web3-eth-abi";
import { encodeDelgations } from "./utils/encoding";
import { prepareUserOp, signUserOp } from "./utils/userOps";
require('dotenv').config();

async function main() {
  // Run deploy.ts first, and then use the delegator address generated from status.json
  const aliceDelegator = "0x818c08558DFA0a4749666589be561efdAb1ab67E";
  const bobDelegator = "0x5E275ed8BAba0152B7A642658f261525db8c2388";

  const bundlerRPC = `https://api.pimlico.io/v2/11155111/rpc?apikey=${process.env.API_KEY}`;
  const rpc = "https://1rpc.io/sepolia";

  const delegationManagerArtifact = await artifacts.readArtifact("DelegationManager");
  const delegatorArtifact = await artifacts.readArtifact('DeleGatorCore');

  const bundlerClient = createPimlicoBundlerClient({
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: sepolia,
    transport: http(bundlerRPC),
  })

  const publicClient = createBundlerClient({
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    chain: sepolia,
    transport: http(rpc)
  })


  // Delegation from Alice to Bob
  const delegation: Delegation = new Delegation(
    bobDelegator,
    aliceDelegator,
    // Root delegator
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    [],
    0,
    '0x'
  );

  const delegationCallData = encodeFunctionCall(
    delegationManagerArtifact.abi.find(({ name }) => name === 'delegate'), [delegation]
  )

  const actionCallData = encodeFunctionCall(
    delegatorArtifact.abi.find(({ name }) => name === 'execute'), [{
      "to": aliceDelegator,
      "value": BigInt(0),
      "data": delegationCallData
    },]
  );


  const alicePrivateKey = process.env.ALICE;

  // Prepare UserOp for Alice MultiSigDelegator 
  const aliceUserOperation = await prepareUserOp(bundlerClient, publicClient, aliceDelegator, actionCallData);

  const signedUserOperation = await signUserOp(aliceUserOperation, alicePrivateKey as any, 11155111);

  const userOpHash = await bundlerClient.sendUserOperation({
    userOperation: signedUserOperation as any,
  });

  console.log("Alice's userop hash", userOpHash);

  const delegationReceipt = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash
  });

  if (!delegationReceipt.success) {
    throw "Alice delegation transaction failed";
  }


  const encodedDelegations = encodeDelgations([delegation]);
  const reedemCallData = encodeFunctionCall(
    delegatorArtifact.abi.find(({ name }) => name === 'redeemDelegation'), [
    encodedDelegations, {
      "to": aliceDelegator,
      "value": BigInt(1e10),
      "data": delegationCallData
    }]
  );

  const bobPrivateKey = process.env.BOB;

  // Prepare UserOp for Bob MultiSigDelegator to redeem delegation
  const bobUserOperation = await prepareUserOp(bundlerClient, publicClient, bobDelegator, reedemCallData);

  const bobSignedUserOperation = await signUserOp(bobUserOperation, bobPrivateKey as any, 11155111);

  const bobUserOpHash = await bundlerClient.sendUserOperation({
    userOperation: bobSignedUserOperation as any,
  });

  console.log("Bob's userop hash", bobUserOpHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});