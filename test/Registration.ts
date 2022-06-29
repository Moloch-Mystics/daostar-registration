import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BaseProvider } from "@ethersproject/providers";
import { makeInterfaceId } from "@openzeppelin/test-helpers";
import { TransactionReceipt } from "@ethersproject/providers";

import {
    EIP4824Registration,
    EIP4824RegistrationFactory,
    EIP4824RegistrationFactory__factory,
    EIP4824Registration__factory,
} from "../typechain";

const config = {
    daoUri: "https://placeholder.com/",
};

const errorMessages = {
    notOwner: "NotOwner",
    initialized: "AlreadyInitialized()",
};

const getNewAddress = async (receipt: TransactionReceipt): Promise<string> => {
    const summonAbi = [
        "event NewRegistration(address indexed daoAddress,string daoURI, address registration)",
    ];
    const iface = new ethers.utils.Interface(summonAbi);
    const log = iface.parseLog(receipt.logs[receipt.logs.length - 1]);
    const { registration } = log.args;
    return registration;
};

describe("Registration", function () {
    let accounts: SignerWithAddress[];
    let registrationTemplateFactory: EIP4824Registration__factory;
    let registrationSummonerFactory: EIP4824RegistrationFactory__factory;
    let registrationTemplate: EIP4824Registration;
    let registrationSummoner: EIP4824RegistrationFactory;

    let registrationContract: EIP4824Registration;

    this.beforeAll(async function () {
        accounts = await ethers.getSigners();

        registrationTemplateFactory = (await ethers.getContractFactory(
            "EIP4824Registration",
            accounts[0]
        )) as EIP4824Registration__factory;
        registrationSummonerFactory = (await ethers.getContractFactory(
            "EIP4824RegistrationFactory",
            accounts[0]
        )) as EIP4824RegistrationFactory__factory;

        registrationTemplate = await registrationTemplateFactory.deploy();
        registrationSummoner = await registrationSummonerFactory.deploy(
            registrationTemplate.address
        );
    });

    beforeEach(async function () {
        const tx = await registrationSummoner.summonRegistration(config.daoUri);
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const addr = await getNewAddress(receipt);
        registrationContract = await registrationTemplateFactory.attach(addr);
    });

    describe("Configuration", function () {
        it("Should setup tests", async function () {
            expect(true);
        });
    });

    describe("Interface", function () {
        it("Exposes 4824 interface for DAO uri", async function () {
            const uri = await registrationContract.daoURI();

            expect(uri).to.equal(config.daoUri);
        });
    });

    describe("Access", function () {
        it("Allows DAO to update URI", async function () {
            await registrationContract.setURI("something else");
            const uri = await registrationContract.daoURI();

            expect(uri).to.equal("something else");
        });

        it("Does not allow anyone else to update URI", async function () {
            registrationContract = await registrationContract.connect(
                accounts[2]
            );
            await expect(
                registrationContract.setURI("something else ")
            ).to.be.revertedWith(errorMessages.notOwner);
        });

        it("Does not allow initialization after summon", async function () {
            await expect(
                registrationContract.initialize(
                    accounts[2].address,
                    "something else "
                )
            ).to.be.revertedWith(errorMessages.initialized);
        });
    });
});
