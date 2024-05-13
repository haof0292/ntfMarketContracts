// SPDX-License-Identifier: MIT 
// adapt and edit from (Nader Dabit): 
// https://github.com/dabit3/polygon-ethereum-nextjs-marketplace/blob/main/contracts/Market.sol
// Author: @haof0292
// date:2024/5/12

pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract MyMarket is ReentrancyGuard {
  uint private _itemCounter = 0;
  uint private _itemSoldCounter;

  address payable public marketowner;
  uint256 public listingFee = 0.001 ether;

  enum State { Created, Release, Inactive }

  struct MarketItem {
    uint id;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable buyer;
    uint256 price;
    State state;
  }
  mapping(uint256 => MarketItem) private marketItems;
 
  event MarketItemCreated (
    uint indexed id,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address buyer,
    uint256 price,
    State state
  );

  event MarketItemSold (
    uint indexed id,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address buyer,
    uint256 price,
    State state
  );

  constructor() {
    marketowner = payable(msg.sender);
  }

  /**
   * @dev Returns the listing fee of the marketplace
   */
  function getListingFee() public view returns (uint256) {
    return listingFee;
  }
  
  /**
   * @dev create a MarketItem for NFT sale on the marketplace.
   * 
   * List an NFT.
   */
  function createMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price
  ) public payable nonReentrant {

    require(price > 0, "Price must be at least 1 wei");
    require(msg.value == listingFee, "Fee must be equal to listing fee");
    require(IERC721(nftContract).getApproved(tokenId) == address(this), "NFT must be approved to market");

    uint256 id = ++_itemCounter;
    marketItems[id] =  MarketItem(
      id,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(address(0)),
      price,
      State.Created
    );
    emit MarketItemCreated(
      id,
      nftContract,
      tokenId,
      msg.sender,
      address(0),
      price,
      State.Created
    );
  }

  /**
   * @dev delete a MarketItem from the marketplace.
   */
  function deleteMarketItem(uint256 itemId) public nonReentrant {
    require(itemId <= _itemCounter, "id must <= item count");
    require(marketItems[itemId].state == State.Created, "item must be on market");
    MarketItem  storage item = marketItems[itemId];
    require(IERC721(item.nftContract).ownerOf(item.tokenId) == msg.sender, "must be the owner");
    require(IERC721(item.nftContract).getApproved(item.tokenId) == address(this), "NFT must be approved to market");
    item.state = State.Inactive;

    emit MarketItemSold(
      itemId,
      item.nftContract,
      item.tokenId,
      item.seller,
      address(0),
      0,
      State.Inactive
    );

  }

  /**
   * @dev (buyer) buy a MarketItem from the marketplace.
   * Transfers ownership of the item, as well as funds
   * NFT:         seller    -> buyer
   * value:       buyer     -> seller
   * listingFee:  contract  -> marketowner
   */
  function createMarketSale(
    address nftContract,
    uint256 id
  ) public payable nonReentrant {

    MarketItem  storage item = marketItems[id]; 
    uint price = item.price;
    uint tokenId = item.tokenId;

    require(msg.value == price, "Please submit the asking price");
    require(IERC721(nftContract).getApproved(tokenId) == address(this), "NFT must be approved to market");

    item.buyer = payable(msg.sender);
    item.state = State.Release;
    _itemSoldCounter ++;    

    IERC721(nftContract).transferFrom(item.seller, msg.sender, tokenId);
    payable(marketowner).transfer(listingFee);
    item.seller.transfer(msg.value);

    emit MarketItemSold(
      id,
      nftContract,
      tokenId,
      item.seller,
      msg.sender,
      price,
      State.Release
    );    
  }

  /**
   * @dev Returns all unsold market items
   * condition: 
   *  1) state == Created
   *  2) buyer = 0x0
   *  3) still have approve
   */
  function fetchActiveItems() public view returns (MarketItem[] memory) {
    return fetchHepler(FetchOperator.ActiveItems);
  }

  /**
   * @dev Returns only market items a user has purchased
   * todo pagination
   */
  function fetchMyPurchasedItems() public view returns (MarketItem[] memory) {
    return fetchHepler(FetchOperator.MyPurchasedItems);
  }

  /**
   * @dev Returns only market items a user has created
   * todo pagination
  */
  function fetchMyCreatedItems() public view returns (MarketItem[] memory) {
    return fetchHepler(FetchOperator.MyCreatedItems);
  }

  enum FetchOperator { ActiveItems, MyPurchasedItems, MyCreatedItems}

  /**
   * @dev fetch helper
   * todo pagination   
   */
   function fetchHepler(FetchOperator _op) private view returns (MarketItem[] memory) {     
    uint total = _itemCounter;
    uint itemCount = 0;
    for (uint i = 1; i <= total; i++) {
      if (isCondition(marketItems[i], _op)) {
        itemCount ++;
      }
    }

    uint index = 0;
    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 1; i <= total; i++) {
      if (isCondition(marketItems[i], _op)) {
        items[index] = marketItems[i];
        index ++;
      }
    }
    return items;
  } 

  /**
   * @dev helper to build condition
   */
  function isCondition(MarketItem memory item, FetchOperator _op) private view returns (bool){
    if(_op == FetchOperator.MyCreatedItems){ 
      return 
        (item.seller == msg.sender
          && item.state != State.Inactive
        )? true
         : false;
    }else if(_op == FetchOperator.MyPurchasedItems){
      return
        (item.buyer ==  msg.sender) ? true: false;
    }else if(_op == FetchOperator.ActiveItems){
      return 
        (item.buyer == address(0) 
          && item.state == State.Created
          && (IERC721(item.nftContract).getApproved(item.tokenId) == address(this))
        )? true
         : false;
    }else{
      return false;
    }
  }
}
