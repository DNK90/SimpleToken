let Config = require("truffle-config");
let Resolver = require("truffle-resolver");
let ResolverIntercept = require("truffle-migrate/resolverintercept");
let Web3 = require("web3");
let fs = require("fs");
let cached = require("./cached.json");

let web3 = new Web3('http://localhost:8545');

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


const STORAGE_CONTRACT = "0xA8805A043A091a5240568f24ff22A3075ed0b507";
const MAIN_CONTRACT = "0xff6781f2cc6F9b6b4A68A0AfC3AaE89133BbB236";
const RECEIVER = "0x69052dCDEaF6a3B5de3771DB24e21f334F9128ac";

function toBN(n) {
    let bn = new web3.utils.BN(n);
    return bn
}

// 'options' is acting like args which are passed to cmd
config = Config.detect(options, null);
options.resolver = new Resolver(config);


// resolver is acting like artifacts in migrations
let resolver = new ResolverIntercept(options.resolver);

let SimpleToken = resolver.require("./SimpleToken.sol");
let SimpleTokenContract = new web3.eth.Contract(SimpleToken.abi, cached.tokenAddress);

let SIMContractAddr = cached.contractAddress;
let SIMContractRaw = resolver.require("./SIMDepositRelease.sol");
let SIMContract = new web3.eth.Contract(SIMContractRaw.abi, SIMContractAddr);

function newToken() {

    cached = {};

    SimpleToken.new().then(function(result) {
        console.log(result.address);
        cached.tokenAddress = result.address;
        SimpleTokenContract = new web3.eth.Contract(SimpleToken.abi, result.address);

        transferSIMToken(MAIN_CONTRACT, getToken(10000)).then(function(result) {
            deploySIMContract(result.address, cached.eventAddress, STORAGE_CONTRACT).then(function(result) {
                console.log("completed");
            });
        });
    });
}


function deployEvent() {

    let Event = resolver.require("./Event.sol");
    Event.new().then(function(result) {

        let address = result.address;
        console.log("Event'addess: %s", address);
        cached.eventAddress = address;
        let EventContract = new web3.eth.Contract(Event.abi, address);

        EventContract.methods.onChange(1, 1, MAIN_CONTRACT, STORAGE_CONTRACT, 1000)
        .send({from: MAIN_CONTRACT})
        .on("transactionHash", function(hash) {
            console.log("Firing onDeposit Event: %s", hash);
        }).then(function(result){
            console.log(result);
            deploySIMContract(cached.tokenAddress, cached.eventAddress, STORAGE_CONTRACT);
        });
    });
}

function transferSIMToken(to, _token) {
    return SimpleTokenContract.methods.transfer(to, _token).send({
        from: STORAGE_CONTRACT
    }).on("transactionHash", function(hash) {
        console.log(hash);
    });
}

// transferSIMToken("0xff6781f2cc6F9b6b4A68A0AfC3AaE89133BbB236", getToken(100000));

function approveAddress(owner, target, cap, callback) {
    SimpleTokenContract.methods.approve(target, cap).send({
        from: owner
    }).on("transactionHash", function(hash) {
        console.log("Approving %s with transaction's hash %s for address %s", target, hash, owner);
    }).then(function(data) {
        console.log("Finish approving %s for address %s", target, owner);
        if (callback) {
            callback();
        }
    });
}

function getAllowance(address, callback) {
    SimpleTokenContract.methods.allowance(address, cached.contractAddress).call().then(function(data) {

        console.log("Finish get allowance for address %s", address);
        console.log(data);
        if (callback) {
            callback();
        }
    });
}

// getAllowance("0xff6781f2cc6F9b6b4A68A0AfC3AaE89133BbB236");
// approveAddress("0xff6781f2cc6F9b6b4A68A0AfC3AaE89133BbB236", cached.contractAddress, getToken(10000));

function deploySIMContract(tokenAddress, eventAddress, wallet) {

    console.log("Start deploying new SIMContract");

    SIMContractRaw.new(cached.tokenAddress, cached.eventAddress, STORAGE_CONTRACT, MAIN_CONTRACT).then(function(result) {
        let address = result.address;
        console.log("New contract has been created at %s", address);

        cached.contractAddress = address;
        const cap = getToken(1000000000);

        // re-initiate SIMContract for 'deposit' use
        SIMContract = new web3.eth.Contract(SIMContractRaw.abi, address);

        console.log("rewrite cached.json");
        fs.writeFile("cached.json", JSON.stringify(cached), "utf8", function() {
            console.log("Saved cached.json");
        });
        
        // do approve that allows contract's address has permission sending token
        approveAddress(MAIN_CONTRACT, address, cap, function() {
            approveAddress(STORAGE_CONTRACT, address, cap, function() {
                runTest();
            });
        });
        
    });
}

function getToken(val) {
    return toBN(Math.pow(10, 18).toString()).mul(toBN(val));
}


function deposit(callback) {
    console.log("Start deposit");
    SIMContract.methods.deposit(2, RECEIVER, getToken(100)).send({
        from: MAIN_CONTRACT
    }).on("transactionHash", function(hash) {
        console.log("transactionHash for deposit: %s", hash);
    }).catch(function(err) {    
        console.log(err);
    }).then(function() {
        console.log("Deposit completed");

        if (callback) {
            callback();
        }

    });
}


function getLatestRate(callback) {
    console.log("Start get latest rate");
    SIMContract.methods.getLatestRate(2).call().catch(function(err) {
        console.log(err);
    }).then(function(result) {
        callback(result);
    });
}


function addNewRate(callback) {
    console.log("Start adding new rate");
    // real rate = rate/1000 => add to params 1000
    SIMContract.methods.updateRating(2, 1000).send({
        from: MAIN_CONTRACT
    }).on("transactionHash", function(hash) {
        console.log("transactionHash for addNewRate: %s", hash);
    }).catch(function(err) {
        console.log(err);
    }).then(function() {
        console.log("addNewRate completed");
        callback();
    });
}


function release() {
    console.log("Start releasing");
    SIMContract.methods.release(RECEIVER, getToken(100), 2).send({
        from: MAIN_CONTRACT
    }).on("transactionHash", function(hash) {
        console.log("transactionHash for release: %s", hash);
    }).catch(function(err) {
        console.log(err);
    }).then(function() {
        console.log("Release completed");
    });
}


function runTest() {
    // make sure deposit completes before release
    deposit(function() {

        let rate = getLatestRate(function(r) {
            if (!r) {
                addNewRate(function() {
                    release();
                });
            } else {
                release();
            }
        });

    });
}


/**
    UNCOMMENT THE FOLLOWING FUNCTIONS TO DO YOUR TEST
    CONFIGURE ADDRESS ACCOUNT IN "truffle.js" FOR DEPLOYING CONTRACT PURPOSE 
**/

// deployEvent();
// newToken();
deploySIMContract();
// runTest();
// release();
// deposit();
// getLatestRate();
