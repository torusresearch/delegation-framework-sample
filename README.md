# Delegation Framework Sample

This project demonstrates a basic usecase of the Metamask Delegation framework to delegate the control, and execute the transation on the delegator's behalf.

## Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/torusresearch/delegation-framework-sample
cd delegation-framework-sample
```

## Create a .env File
Create a .env file in the root directory of the project and add the following environment variables:
```
ALICE=<Alice's Private Key>
BOB=<Bob's Private Key>
API_KEY=<Your Pimlico API Key>
```
Replace <Alice's Private Key>, <Bob's Private Key>, and <Your API Key> with the actual values.

## Install Dependencies
Install the necessary dependencies using npm or yarn:

```bash
npm install
# or
yarn install
```

## Compile the Contracts
Compile the smart contracts using Hardhat. This command will compile all the Solidity contracts in the contracts directory.

```
npx hardhat compile
```

## Run the Deploy Script
Deploy the contracts to your specified network, by default it'll deploy on Sepolia testnet. Make sure Hardhat configuration file (hardhat.config.js) is correctly set up for the custom network.

```bash
npm run deploy
```

## Retrieve Delegator Addresses
Once the deploy script is successfully run, the delegator addresses for Bob and Alice will be stored in the `status.json` file in the root directory of the project. Open the `status.json` file to find the addresses:

```json
{
    "DelegationManagerAddress": "0x935851fDBFBC20FEda2A916034B8F5cCAD11F7e4",
    "MultiSigDelegatorImplementationAddress": "0x44Da3aDBfAB9495c1fc90fAAc0446809298863af",
    "AliceAddress": "0x818c08558DFA0a4749666589be561efdAb1ab67E",
    "BobAddress": "0x5E275ed8BAba0152B7A642658f261525db8c2388"
}
```

Copy these addresses and update the aliceDelegator and bobDelegator address in `index.tsx`.

## Run the sample
Once you have setup the addresses, and .env file, you can run the sample. It'll first delegate Alice's control to Bob's delegator. After the delegation, the Bob's delegator will submit a transaction to move funds from Alice's SCA. To modify the action, you can play around with `Action` used to generate `reedemCallData` in `index.tsx`. For instance if you want to approve token, then the action would be `Action(tokenAddress, 0, encodedCallData for approve)`.

```bash
npm run run
```
