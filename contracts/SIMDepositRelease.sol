pragma solidity ^0.4.18;


contract SIMDepositRelease {

	address tokenAddress;
	address eventAddress;
	address storageAddress;

    function() payable {}

    function SIMDepositRelease(address _tokenAddress, address _eventAddress, address _storageAddress) {
    	tokenAddress = _tokenAddress;
    	eventAddress = _eventAddress;
    	storageAddress = _storageAddress;
    }

    function callTransferFrom(address _sender, address _receiver, uint256 _amount) returns (bool) {
    	return tokenAddress.call(bytes4(keccak256("transferFrom(address,address,uint256)")), _sender, _receiver, _amount);
    }

    function onChange(uint256 _event, uint256 _type, address _from, address _to, uint256 _amount) public returns (bool) {
    	return eventAddress.call(bytes4(keccak256("onChange(uint256,uint256,address,address,uint256)")), _event, _type, _from, _to, _amount);
    }

	function deposit(uint256 _type, address _receiver, uint256 _amount) public payable {
        uint256 amount = _amount * 10 ** 18;
    	callTransferFrom(msg.sender, storageAddress, amount);
    	onChange(1, _type, msg.sender, _receiver, amount);
	}

	function release(address _receiver, uint256 _amount) public payable {
		// _type: 1 is eth, 2 is this
		uint256 amount = _amount * 10 ** 18;
		callTransferFrom(storageAddress, _receiver, amount);
		onChange(2, 2, storageAddress, _receiver, amount);
	}
}
