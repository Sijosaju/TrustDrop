// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ============================================================
//  Production-Ready DonationTracker
//  Security: ReentrancyGuard + Pausable + onlyOwner
// ============================================================

/**
 * @dev Minimal ReentrancyGuard (no external import needed in Remix)
 */
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

/**
 * @dev Minimal Pausable
 */
abstract contract Pausable {
    bool private _paused;

    event Paused(address account);
    event Unpaused(address account);

    constructor() {
        _paused = false;
    }

    modifier whenNotPaused() {
        require(!_paused, "Contract is paused");
        _;
    }

    function paused() public view returns (bool) {
        return _paused;
    }

    function _pause() internal {
        _paused = true;
        emit Paused(msg.sender);
    }

    function _unpause() internal {
        _paused = false;
        emit Unpaused(msg.sender);
    }
}

// ============================================================
//  Main Contract
// ============================================================
contract DonationTracker is ReentrancyGuard, Pausable {

    // ---- State Variables ----
    address public owner;
    uint256 public minimumDonation = 0.001 ether;
    uint256 public totalDonationsCount;
    uint256 public totalAmountRaised;

    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
        string message; // optional donor message
    }

    Donation[] private donations;

    // ---- Events ----
    event DonationReceived(
        address indexed donor,
        uint256 amount,
        uint256 timestamp,
        string message
    );

    event Withdrawn(address indexed owner, uint256 amount, uint256 timestamp);
    event MinimumDonationUpdated(uint256 newMinimum);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ---- Modifiers ----
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    // ---- Constructor ----
    constructor() {
        owner = msg.sender;
    }

    // ============================================================
    //  DONATE — Main function donors call
    // ============================================================
    function donate(string calldata message) external payable whenNotPaused nonReentrant {
        require(msg.value >= minimumDonation, "Donation below minimum");
        require(bytes(message).length <= 200, "Message too long");

        donations.push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            message: message
        }));

        totalDonationsCount++;
        totalAmountRaised += msg.value;

        emit DonationReceived(msg.sender, msg.value, block.timestamp, message);
    }

    // ============================================================
    //  WITHDRAW — Only owner (organization) can call
    // ============================================================
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit Withdrawn(owner, balance, block.timestamp);
    }

    // ============================================================
    //  ADMIN FUNCTIONS
    // ============================================================

    /// @notice Pause the contract (stops donations)
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause the contract (resumes donations)
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Update minimum donation amount
    function setMinimumDonation(uint256 newMinimum) external onlyOwner {
        require(newMinimum > 0, "Minimum must be > 0");
        minimumDonation = newMinimum;
        emit MinimumDonationUpdated(newMinimum);
    }

    /// @notice Transfer contract ownership to a new address
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // ============================================================
    //  READ FUNCTIONS — Public data queries
    // ============================================================

    function getDonationCount() external view returns (uint256) {
        return donations.length;
    }

    function getTotalBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getTotalAmountRaised() external view returns (uint256) {
        return totalAmountRaised;
    }

    function getDonation(uint256 index) external view returns (
        address donor,
        uint256 amount,
        uint256 timestamp,
        string memory message
    ) {
        require(index < donations.length, "Index out of bounds");
        Donation storage d = donations[index];
        return (d.donor, d.amount, d.timestamp, d.message);
    }

    /// @notice Get multiple donations at once (paginated)
    function getDonations(uint256 from, uint256 count) external view returns (
        address[] memory donors,
        uint256[] memory amounts,
        uint256[] memory timestamps,
        string[] memory messages
    ) {
        require(from < donations.length, "Start index out of range");
        uint256 end = from + count;
        if (end > donations.length) end = donations.length;
        uint256 size = end - from;

        donors     = new address[](size);
        amounts    = new uint256[](size);
        timestamps = new uint256[](size);
        messages   = new string[](size);

        for (uint256 i = 0; i < size; i++) {
            Donation storage d = donations[from + i];
            donors[i]     = d.donor;
            amounts[i]    = d.amount;
            timestamps[i] = d.timestamp;
            messages[i]   = d.message;
        }
    }

    // Fallback — accept plain ETH sends (treated as donation with no message)
    receive() external payable {
        // Counts toward balance but does NOT add to donation records
        // Donors should always use donate()
    }
}
