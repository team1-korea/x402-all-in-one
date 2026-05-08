// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ToneToken
 * @dev ERC-20 + EIP-3009 (transferWithAuthorization) for x402 payments on Avalanche APIX L1.
 * EIP-712 domain: name="TONE", version="1"
 */
contract ToneToken {
    string public constant name = "TONE";
    string public constant symbol = "TONE";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // EIP-712
    bytes32 public immutable DOMAIN_SEPARATOR;

    bytes32 public constant TRANSFER_WITH_AUTHORIZATION_TYPEHASH =
        keccak256(
            "TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)"
        );

    // EIP-3009 nonce state: address => nonce => used
    mapping(address => mapping(bytes32 => bool)) public authorizationState;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce);

    constructor(uint256 initialSupply) {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name)),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
        _mint(msg.sender, initialSupply);
    }

    // ── ERC-20 ─────────────────────────────────────────────────────────────

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            require(allowed >= value, "APIX: insufficient allowance");
            allowance[from][msg.sender] = allowed - value;
        }
        _transfer(from, to, value);
        return true;
    }

    // ── EIP-3009 ────────────────────────────────────────────────────────────

    /**
     * @dev Execute a transfer with a signed authorization (EIP-3009).
     *      The facilitator calls this to settle a payment.
     */
    function transferWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(block.timestamp > validAfter, "APIX: auth not yet valid");
        require(block.timestamp < validBefore, "APIX: auth expired");
        require(!authorizationState[from][nonce], "APIX: nonce already used");

        bytes32 structHash = keccak256(
            abi.encode(
                TRANSFER_WITH_AUTHORIZATION_TYPEHASH,
                from,
                to,
                value,
                validAfter,
                validBefore,
                nonce
            )
        );

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
        address signer = ecrecover(digest, v, r, s);
        require(signer == from, "APIX: invalid signature");

        authorizationState[from][nonce] = true;
        emit AuthorizationUsed(from, nonce);

        _transfer(from, to, value);
    }

    // ── Internal ────────────────────────────────────────────────────────────

    function _transfer(address from, address to, uint256 value) internal {
        require(from != address(0), "APIX: transfer from zero");
        require(to != address(0), "APIX: transfer to zero");
        require(balanceOf[from] >= value, "APIX: insufficient balance");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
    }

    function _mint(address to, uint256 value) internal {
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }
}
