=====MODELS=====

User {
  username: String,
  password: String
}

Shop {
  type: String ("Mine", "Me", "Player"),
  owner: String (username of the cell/shop owner),
  offers: [{
    type: String ("buy" or "sell"),
    item: String ("iron", "diamond", "egg", "dirt"),
    itemType: String ("single", "ingot", "block", "ore"),
    amount: Number ("1", "16", "64"),
    price: Number ("1", "2.5", "33000")
  }]
}

=====PAGE LAYOUT=====

OFFERS
Shop offers at the top
Your offers
Everyone else's offers

DEALS
