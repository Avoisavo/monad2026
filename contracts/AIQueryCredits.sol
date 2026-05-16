// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AIQueryCredits
/// @notice Permissionless token wallet for AI queries on Monad.
///         Conversion: 1 MON = TOKENS_PER_MON tokens.
///         Every function is public and callable by anyone, but each only
///         affects the caller's own balance — no admin, no locks, no fees.
///
///         Flow:
///           1. `topUp()` payable — send MON, get `msg.value * TOKENS_PER_MON
///              / 1 ether` tokens credited.
///           2. `consume(tokens)` — emits a `Consumed` event the backend
///              watches. No state change; the deposit stays withdrawable.
///           3. `withdraw(tokens)` — burn tokens, receive the equivalent
///              MON back at the same rate.
contract AIQueryCredits {
    /// @notice Tokens minted per 1 MON deposited.
    uint256 public constant TOKENS_PER_MON = 10_000;

    /// @notice Wei equivalent of one token. Derived: 1e18 / 10_000 = 1e14.
    uint256 public constant WEI_PER_TOKEN = 1 ether / TOKENS_PER_MON;

    /// @notice Per-user token balance.
    mapping(address => uint256) public balanceOf;

    event ToppedUp(
        address indexed user,
        uint256 monAmount,
        uint256 tokenAmount,
        uint256 newBalance
    );
    event Consumed(address indexed user, uint256 tokenAmount);
    event Withdrawn(
        address indexed user,
        uint256 monAmount,
        uint256 tokenAmount,
        uint256 newBalance
    );

    /// @notice Send MON to credit your own account.
    function topUp() external payable {
        _credit(msg.sender, msg.value);
    }

    /// @notice Plain transfers also credit the sender.
    receive() external payable {
        _credit(msg.sender, msg.value);
    }

    function _credit(address user, uint256 monAmount) internal {
        require(monAmount > 0, "zero value");
        // Disallow dust that would round to 0 tokens or leave wei stranded.
        require(
            monAmount % WEI_PER_TOKEN == 0,
            "amount must be multiple of 0.0001 MON"
        );
        uint256 tokens = monAmount / WEI_PER_TOKEN;
        uint256 newBal = balanceOf[user] + tokens;
        balanceOf[user] = newBal;
        emit ToppedUp(user, monAmount, tokens, newBal);
    }

    /// @notice Signal that you're spending `tokenAmount` on an AI query.
    ///         Emits `Consumed` — no state change, no MON moves.
    function consume(uint256 tokenAmount) external {
        require(tokenAmount > 0, "zero value");
        emit Consumed(msg.sender, tokenAmount);
    }

    /// @notice Burn `tokenAmount` tokens and receive the equivalent MON.
    function withdraw(uint256 tokenAmount) external {
        require(tokenAmount > 0, "zero value");
        uint256 bal = balanceOf[msg.sender];
        require(bal >= tokenAmount, "insufficient balance");
        unchecked {
            balanceOf[msg.sender] = bal - tokenAmount;
        }
        uint256 monAmount = tokenAmount * WEI_PER_TOKEN;
        (bool ok, ) = msg.sender.call{value: monAmount}("");
        require(ok, "transfer failed");
        emit Withdrawn(msg.sender, monAmount, tokenAmount, bal - tokenAmount);
    }
}
