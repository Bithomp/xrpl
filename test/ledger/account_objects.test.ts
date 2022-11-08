import nconf from "nconf";
import { expect } from "chai";
import { Client } from "../../src/index";

describe("Client", () => {
  describe("getAccountObjects", () => {
    before(async function () {
      Client.setup(nconf.get("xrpl:connections:testnet"));
      await Client.connect();
    });

    it("works", async function () {
      const result: any = await Client.getAccountObjects("rLRUyXNh6QNmkdR1xJrnJBGURQeNp9Ltyf");
      expect(Object.keys(result)).to.eql(["account", "account_objects", "ledger_hash", "ledger_index", "validated"]);
      expect(JSON.stringify(result.account_objects)).to.eql(
        '[{"Balance":{"currency":"FOO","issuer":"rrrrrrrrrrrrrrrrrrrrBZbvji","value":"-123.45"},"Flags":131072,"HighLimit":{"currency":"FOO","issuer":"rLRUyXNh6QNmkdR1xJrnJBGURQeNp9Ltyf","value":"1000000000"},"HighNode":"0","LedgerEntryType":"RippleState","LowLimit":{"currency":"FOO","issuer":"rNTvdxPWujQn2sUXYBGxmWrGe4ethkLyhb","value":"0"},"LowNode":"0","PreviousTxnID":"682BC63E6B3A17304301D921383516F4EF5F4A521B170EAF8492486B21D638FD","PreviousTxnLgrSeq":22442930,"index":"7A130F5FC6D937B65545220DC483B918A4A137D918EF2F126ECD4CBBFE44A633"}]'
      );
    });
  });

  describe("getAccountAllObjects", () => {
    before(async function () {
      Client.setup(nconf.get("xrpl:connections:testnet"));
      await Client.connect();
    });

    it("works", async function () {
      const result: any = await Client.getAccountAllObjects("rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B");
      expect(Object.keys(result)).to.eql(["account", "account_objects", "ledger_hash", "ledger_index", "validated"]);
      expect(result.account_objects.length).to.gt(500);
    });
  });

  describe("getAccountLinesObjects", () => {
    before(async function () {
      Client.setup(nconf.get("xrpl:connections:testnet"));
      await Client.connect();
    });

    it("works", async function () {
      const result: any = await Client.getAccountLinesObjects("rLRUyXNh6QNmkdR1xJrnJBGURQeNp9Ltyf");
      expect(Object.keys(result)).to.eql(["account", "ledger_hash", "ledger_index", "validated", "lines"]);
      expect(result.lines).to.eql([
        {
          account: "rNTvdxPWujQn2sUXYBGxmWrGe4ethkLyhb",
          balance: "123.45",
          currency: "FOO",
          limit: "1000000000",
          limit_peer: "0",
          no_ripple: false,
          no_ripple_peer: false,
        },
      ]);
    });
  });

  describe("getAccountNFTOffersObjects", () => {
    before(async function () {
      Client.setup(nconf.get("xrpl:connections:xls20net"));
      await Client.connect();
    });

    it("works for buy", async function () {
      const result: any = await Client.getAccountNFTOffersObjects("rJcEbVWJ7xFjL8J9LsbxBMVSRY2C7DU7rz");

      expect(Object.keys(result)).to.eql(["account", "ledger_hash", "ledger_index", "validated", "nft_offers"]);
      expect(result.nft_offers).to.eql([
        {
          nft_id: "000B0000C124E14881533A9AFE4A5F481795C17003A9FACF0000099B00000000",
          amount: "1000000000000000",
          flags: 1,
          index: "0FEDCDB1A329C80B5BF75F3EC3D7634A03B9CCC41B34E67E36C951BA08065D31",
          owner: "rJcEbVWJ7xFjL8J9LsbxBMVSRY2C7DU7rz",
        },
        {
          nft_id: "000B0000C124E14881533A9AFE4A5F481795C17003A9FACF0000099B00000000",
          amount: "0",
          flags: 1,
          index: "8EAAE4372FDD51789CE5899CF6B854D62F6D37AFFD737EDA746FD6D16D7D4438",
          owner: "rJcEbVWJ7xFjL8J9LsbxBMVSRY2C7DU7rz",
          destination: "rM3UEiJzg7nMorRhdED5savWDt1Gqb6TLw",
        },
      ]);
    });

    it("works for sell", async function () {
      const result: any = await Client.getAccountNFTOffersObjects("rM3UEiJzg7nMorRhdED5savWDt1Gqb6TLw");

      expect(Object.keys(result)).to.eql(["account", "ledger_hash", "ledger_index", "validated", "nft_offers"]);
      expect(result.nft_offers).to.eql([
        {
          nft_id: "000B0000C124E14881533A9AFE4A5F481795C17003A9FACF16E5DA9C00000001",
          amount: "1",
          flags: 0,
          index: "F5BC0A6FD7DFA22A92CD44DE7F548760D855C35755857D1AAFD41CA3CA57CA3A",
          owner: "rM3UEiJzg7nMorRhdED5savWDt1Gqb6TLw",
        },
      ]);
    });
  });
});
