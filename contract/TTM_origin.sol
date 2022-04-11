// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TTM is ERC1155, Ownable {

    bytes32 public merkleRoot;
    mapping(address => bool) public claimed;

    constructor(bytes32 _merkleRoot)
        ERC1155("ipfs://QmTreP946FZq2oWe4tXxyYLk7Z4GPccN4Hq2em6DSP4K3t/metadata.json")
    {
        merkleRoot = _merkleRoot;
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function setmerkleRoot(bytes32 _merkleRoot) public onlyOwner{
        merkleRoot = _merkleRoot;
    }

    function mint(bytes32[] calldata merkleProof) 
        public
    {
        require(claimed[msg.sender] == false, "already claimed");
        claimed[msg.sender] = true;
        require(MerkleProof.verify(merkleProof, merkleRoot, keccak256(abi.encodePacked(msg.sender))), "invalid merkle proof");
        _mint(msg.sender,0, 1, "");
    }

}
