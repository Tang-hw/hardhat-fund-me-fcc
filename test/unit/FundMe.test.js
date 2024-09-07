const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

describe("FundMe", async function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = "1000000000000000000";

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    // deploy all incloud mock
    await deployments.fixture(["all"]);
    fundMe = await ethers.getContractAt("FundMe", deployer);
    mockV3Aggregator = await ethers.getContractAt("MockV3Aggregator", deployer);
  });

  describe("constructor", async function () {
    it("sets the aggreator addresses correctly", async function () {
      const response = await fundMe.target;
      assert.equal(response, mockV3Aggregator.target);
    });
  });

  describe("fund", function () {
    // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
    // could also do assert.fail
    it("Fails if you don't send enough ETH", async () => {
      await expect(fundMe.fund()).to.be.revertedWith(
        "You need to spend more ETH!"
      );
    });
    // we could be even more precise here by making sure exactly $50 works
    // but this is good enough for now
    it("Updates the amount funded data structure", async () => {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.getAddressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });
    it("Adds funder to array of funders", async () => {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.getFunder(0);
      assert.equal(response, deployer);
    });
  });
});
