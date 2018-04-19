pragma solidity ^0.4.18;


contract Event {

	event OnDeposit(bytes32 _type, uint256 _amount, address _from, address _to);

	function onDeposit(string _type, uint256 _amount, address _from, address _to) public {
		OnDeposit(stringToBytes32(_type), _amount, _from, _to);
	}

	function stringToBytes32(string memory source) returns (bytes32 result) {
	    bytes memory tempEmptyStringTest = bytes(source);
	    if (tempEmptyStringTest.length == 0) {
	        return 0x0;
	    }

	    assembly {
	        result := mload(add(source, 32))
	    }
	}

}