import { artifacts, ethers } from "hardhat";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { encodeFunctionCall } from "web3-eth-abi";
const ERC1967Proxy = require('@openzeppelin/contracts/build/contracts/ERC1967Proxy.json')
const fs = require('fs');


async function main() {
    const [alice, bob] = await ethers.getSigners();

    // ---- Deploy Delegation Manager ---- //
    const delegationManager = await ethers.getContractFactory("DelegationManager");
    const delegationManagerTransaction = await delegationManager.deploy(alice.address);
    await delegationManagerTransaction.waitForDeployment();

    console.log("Delegation Manager deployed at: ", await delegationManagerTransaction.getAddress());

    // ---- Deploy MultiSigDelator ---- //
    const multiSigDelegator = await ethers.getContractFactory('MultiSigDeleGator');
    const multiSigDelegatorTransaction = await multiSigDelegator.deploy(
        await delegationManagerTransaction.getAddress(),
        ENTRYPOINT_ADDRESS_V07,
    );
    await multiSigDelegatorTransaction.waitForDeployment();

    const multiSigDelAddress = await multiSigDelegatorTransaction.getAddress();

    // ---- Deploy Alice ---- //
    const { abi } = await artifacts.readArtifact("MultiSigDeleGator");
    const callInitialize = encodeFunctionCall(
        abi.find(({ name }) => name === 'initialize'), [[alice.address], 1]
    )
    const proxy = await ethers.getContractFactory(ERC1967Proxy.abi, ERC1967Proxy.bytecode)
    const proxyTransaction = await proxy.deploy(multiSigDelAddress, callInitialize)
    await proxyTransaction.waitForDeployment();

    console.log("MultiSig Delegate Alice Proxy deployed to:", await proxyTransaction.getDeployedCode());

    // ---- Deploy Bob ---- //
    const callInitializeBob = encodeFunctionCall(
        abi.find(({ name }) => name === 'initialize'), [[bob.address], 1]
    )

    const bobProxyTransaction = await proxy.deploy(multiSigDelAddress, callInitializeBob)
    await bobProxyTransaction.waitForDeployment();

    console.log("MultiSig Delegate Alice Proxy deployed to:", await bobProxyTransaction.getDeployedCode())

    fs.writeFileSync('./status.json', JSON.stringify({
        DelegationManagerAddress: await delegationManagerTransaction.getAddress(),
        MultiSigDelegatorImplementationAddress: multiSigDelAddress,
        AliceAddress: await proxyTransaction.getAddress(),
        BobAddress: await bobProxyTransaction.getAddress(),
    }));

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});