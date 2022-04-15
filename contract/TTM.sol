// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error AlreadyClaimed();
error NoRestUnMint();
error ShouldBeMultisig();

contract TTM is ERC1155, Ownable {

    bytes32 public merkleRoot;
    uint8 public totalSupply = 166;
    uint8 public restUnMint;
    mapping(address => bool) public claimed;
    address public multiSig;

    constructor(bytes32 _merkleRoot, address _multiSig)
        ERC1155("ipfs://QmetFMEgUtFmRxG3XWKRnzxpmJoJLiKvBrLn8LmojEdVh9/metadata.json")
    {
        merkleRoot = _merkleRoot;
        restUnMint = totalSupply;
        multiSig = _multiSig;
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
        if (claimed[msg.sender] == true) revert AlreadyClaimed();
        if (restUnMint == 0) revert NoRestUnMint();
        claimed[msg.sender] = true;
        restUnMint--;
        require(MerkleProof.verify(merkleProof, merkleRoot, keccak256(abi.encodePacked(msg.sender))), "invalid merkle proof");
        _mint(msg.sender,0, 1, "");
    }
    
    //We reserve 10 nfts for multisig, if someone did not mint for a long time, the multi-signature could mint all the remaining nfts
    function multiSigMint()
        public
    {
        if (msg.sender != multiSig) revert ShouldBeMultisig();
        if (restUnMint == 0) revert NoRestUnMint();
        _mint(msg.sender,0, restUnMint, "");
        restUnMint = 0;
    }

}
