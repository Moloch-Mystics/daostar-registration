import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
    EIP4824Registration,
    EIP4824RegistrationFactory,
    EIP4824RegistrationFactory__factory,
    EIP4824Registration__factory,
} from "../typechain";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    let accounts: SignerWithAddress[];
    let registrationTemplateFactory: EIP4824Registration__factory;
    let registrationSummonerFactory: EIP4824RegistrationFactory__factory;
    let registrationTemplate: EIP4824Registration;
    let registrationSummoner: EIP4824RegistrationFactory;

    accounts = await hre.ethers.getSigners();

    accounts = await ethers.getSigners();
    registrationTemplateFactory = (await ethers.getContractFactory(
        "EIP4824Registration",
        accounts[0]
    )) as EIP4824Registration__factory;
    registrationSummonerFactory = (await ethers.getContractFactory(
        "EIP4824RegistrationFactory",
        accounts[0]
    )) as EIP4824RegistrationFactory__factory;

    console.log(await accounts[0].getAddress());

    registrationTemplate = await registrationTemplateFactory.deploy();

    await registrationTemplate.deployed();
    registrationSummoner = await registrationSummonerFactory.deploy(
        registrationTemplate.address
    );
    await registrationSummoner.deployed();

    console.log({
        registrationSummoner: registrationSummoner.address,
    });

    console.log("Configured...");
};
export default func;
func.id = "nft_token_deploy";
func.tags = ["local"];
