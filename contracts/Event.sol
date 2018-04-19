pragma solidity ^0.4.18;


contract Event {

	event OnChange(uint256 _event, uint256 _type, address _from, address _to, uint256 _amount);

	function onChange(uint256 _event, uint256 _type, address _from, address _to, uint256 _amount) public {
		OnChange(_event, _type, _from, _to, _amount);
	}

}