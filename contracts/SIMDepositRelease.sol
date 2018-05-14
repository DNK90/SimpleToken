pragma solidity ^0.4.18;


contract SimpleTokenI {
	function allowance(address owner, address spender) public view returns (uint256) { }
	function transferFrom(address from, address to, uint256 value) public returns (bool) { }
	function approve(address spender, uint256 value) public returns (bool) { }

	function totalSupply() public view returns (uint256) { }
	function balanceOf(address who) public view returns (uint256) { }
	function transfer(address to, uint256 value) public returns (bool) { }

	event Transfer(address indexed from, address indexed to, uint256 value);
	event Approval(address indexed owner, address indexed spender, uint256 value);
}


contract SIMDepositRelease {

	SimpleTokenI tokenAddress;
	address eventAddress;
	address storageAddress;
	mapping(uint256 => uint256[]) rates;
	address owner;

	modifier onlyadmin {
		if (msg.sender != owner) throw;
		_;
    }

    function() payable {}

    function SIMDepositRelease(address _tokenAddress, address _eventAddress, address _storageAddress, address _owner) {
    	tokenAddress = SimpleTokenI(_tokenAddress);
    	eventAddress = _eventAddress;
    	storageAddress = _storageAddress;
		owner = _owner;
    }

    function callTransferFrom(address _sender, address _receiver, uint256 _amount) returns (bool) {
    	return tokenAddress.transferFrom(_sender, _receiver, _amount);
    	// return tokenAddress.call(bytes4(keccak256("transferFrom(address,address,uint256)")), _sender, _receiver, _amount);
    }

    function onChange(uint256 _event, uint256 _type, address _from, address _to, uint256 _amount) public returns (bool) {
    	return eventAddress.call(bytes4(keccak256("onChange(uint256,uint256,address,address,uint256)")), _event, _type, _from, _to, _amount);
    }

	function deposit(uint256 _type, address _receiver, uint256 _amount) public {

		require(_amount > 0);

        uint256 amount = _amount;
    	bool result = callTransferFrom(msg.sender, storageAddress, amount);
    	onChange(1, _type, msg.sender, _receiver, amount);
	}

	function release(address _receiver, uint256 _amount, uint256 _type) public onlyadmin {
		// _type: 1 is eth, 2 is this
		uint256 rate = rates[_type][rates[_type].length - 1];
		
		require(rate > 0);
		require(_amount > 0);

		uint256 amount = _amount * (rate/1000);

		callTransferFrom(storageAddress, _receiver, amount);
		onChange(2, _type, storageAddress, _receiver, amount);
	}

	function getLatestRate(uint256 _type) public returns (uint256) {
		return rates[_type][rates[_type].length - 1];
	}

	function getRate(uint256 _type, uint256 _idx) public returns (uint256){
		require(_idx < rates[_type].length);
		return rates[_type][_idx];
	}

	function getRates(uint256 _type) public returns (uint256[]) {
		return rates[_type];
	}

	function updateRating(uint256 _code, uint256 _newRate) public onlyadmin {
		rates[_code].push(_newRate);
	}
}
