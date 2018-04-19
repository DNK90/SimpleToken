let Web3 = require("web3");
let Resolver = require("truffle-resolver");
let ResolverIntercept = require("truffle-migrate/resolverintercept");
let Config = require("truffle-config");
const cached = require("./cached.json");

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


let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
config = Config.detect(options, null);
let resolver = new Resolver(config);
options.resolver = resolver;

console.log(web3);
let Event = resolver.require("./Event.sol");
let EventContract = new web3.eth.Contract(Event.abi, cached.eventAddress);
// let evt = SimpleTokenContract.Testing

// console.log(EventContract.events);

function eventListener() {

    EventContract.events.allEvents({ fromBlock: 'latest' }, console.log);

    // EventContract.events.OnChange({
    //     fromBlock: 2137735
    // }, function(err, event) {
    //     if (event)
    //         console.log(event);
    // });

    // setTimeout(eventListener, 1000);
}


eventListener();


