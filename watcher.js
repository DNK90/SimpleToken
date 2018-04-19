let Web3 = require("web3");
let Resolver = require("truffle-resolver");
let ResolverIntercept = require("truffle-migrate/resolverintercept");
let Config = require("truffle-config");

options = {
    working_dir: '/Users/kiendn/coding/tutorial/truffle/deploy_contract_without_cmd',
    network: 'rinkeby',
    network_id: 4,
    resolver: null,
    provider: function() {
        return new Web3.providers.HttpProvider('http://localhost:8545');
    },
    logger: {
        log: function(msg) {
            logger.log("  " + msg);
        }
    },
    basePath: "/Users/kiendn/coding/tutorial/truffle/deploy_contract_without_cmd/build/contracts"
};


let web3 = new Web3('http://localhost:8545');
config = Config.detect(options, null);
let resolver = new Resolver(config);
options.resolver = resolver;

let SimpleToken = resolver.require("./SimpleToken.sol");
let SimpleTokenContract = new web3.eth.Contract(SimpleToken.abi, "0xdc890a912bdaddb58c7d2cf8bb1ad246b34ac622");

// let evt = SimpleTokenContract.Testing

function eventListener() {

    SimpleTokenContract.events.Transfer({

    }).on("data", function(data) {
        console.log(data);
    });

    setTimeout(eventListener, 1000);
}


eventListener();


