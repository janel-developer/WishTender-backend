To add a cart in mongo:

```
db.sessions.insertOne({"_id" : "mIxDSVrYYXLyUq_io625Hd3b03_fqaem",
    "expires" : ISODate("2021-04-05T19:06:21.847Z"),
    "session" : "{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"languageCode\":\"en-US\",\"cart\":{\"aliasCarts\":{\"603a8d02bf6c85032169fe7c\":{\"items\":{\"603a8e00bf6c85032169fe7e\":{\"item\":{\"_id\":\"603a8e00bf6c85032169fe7e\",\"itemName\":\"Gucci Ken Scott Print Hooded Jacket - Farfetch\",\"price\":210000,\"url\":\"https://www.farfetch.com/shopping/women/gucci-ken-scott-print-hooded-jacket-item-16331626.aspx?storeid=10644\",\"currency\":\"USD\",\"wishlist\":\"603a8d02bf6c85032169fe7d\",\"itemImage\":\"/data/images/itemImages/ca1c1ba8-44df-4b0a-8b65-486e2a346f0f.png\",\"alias\":{\"wishlists\":[\"603a8d02bf6c85032169fe7d\"],\"_id\":\"603a8d02bf6c85032169fe7c\",\"handle\":\"dadasheshe1\",\"aliasName\":\"KULLi\",\"currency\":\"USD\",\"handle_lowercased\":\"dadasheshe1\",\"__v\":1,\"profileImage\":\"/data/images/profileImages/e22c1277-38d3-4189-a434-dc22be5f86d0.png\"},\"__v\":0},\"qty\":1,\"price\":210000},\"60564e5c457d6517e54db74f\":{\"item\":{\"_id\":\"60564e5c457d6517e54db74f\",\"itemName\":\"Alexander McQueen Hybrid Panelled Jeans - Farfetch\",\"price\":329000,\"url\":\"https://www.farfetch.com/shopping/women/alexander-mcqueen-hybrid-panelled-jeans-item-16091948.aspx?storeid=9359\",\"currency\":\"USD\",\"wishlist\":\"603a8d02bf6c85032169fe7d\",\"itemImage\":\"/data/images/itemImages/e9a77ae4-8739-41aa-a337-5a0315788ff2.png\",\"alias\":{\"wishlists\":[\"603a8d02bf6c85032169fe7d\"],\"_id\":\"603a8d02bf6c85032169fe7c\",\"handle\":\"dadasheshe1\",\"aliasName\":\"KULLi\",\"currency\":\"USD\",\"handle_lowercased\":\"dadasheshe1\",\"__v\":1,\"profileImage\":\"/data/images/profileImages/e22c1277-38d3-4189-a434-dc22be5f86d0.png\"},\"__v\":0},\"qty\":2,\"price\":658000}},\"totalQty\":3,\"totalPrice\":868000,\"alias\":{\"wishlists\":[\"603a8d02bf6c85032169fe7d\"],\"_id\":\"603a8d02bf6c85032169fe7c\",\"handle\":\"dadasheshe1\",\"aliasName\":\"KULLi\",\"currency\":\"USD\",\"handle_lowercased\":\"dadasheshe1\",\"__v\":1,\"profileImage\":\"/data/images/profileImages/e22c1277-38d3-4189-a434-dc22be5f86d0.png\"}}}}}"
})
```

Add session in postman

connect.sid: s%3AmIxDSVrYYXLyUq_io625Hd3b03_fqaem.e8lUzzBOeoyOUvki01xi3e9bJfw7R0vizODYLK9KyMg
