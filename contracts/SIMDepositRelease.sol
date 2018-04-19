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

    function onDeposit(address _from, address _to, uint256 _amount) public returns (bool) {
    	return eventAddress.call(bytes4(keccak256("onDeposit(string,uint256,address,address)")), "ST5", _amount, _from, _to);
    }

	function deposit(uint256 _amount) public payable {
        uint256 amount = _amount * 10 ** 18;
    	callTransferFrom(msg.sender, storageAddress, amount);
    	onDeposit(msg.sender, storageAddress, amount);
	}

	function release(address _receiver, uint256 _amount) public payable {
		uint256 amount = _amount * 10 ** 18;
		callTransferFrom(msg.sender, _receiver, amount);
	}

	function getStorageAddress() public view returns (address) {
		return storageAddress;
	}
}
