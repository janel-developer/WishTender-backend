# Order Object

- Order object

```
{
_id: string,
  gifts: [
    {
      // gift object
      item: {
        _id: string,
        itemName: string,
        price: integer,
        url: string,
        currency: string 3-letter uppercase,
        wishlist: string,
        itemImage: string,
      },
      qty: integer,
      price: integer,
    },
    {<gift_object>},
    {<gift_object>}
  ],
  alias: {
    _id: string,
    handle: string,
    aliasName: string,
    currency: string 3-letter uppercase,
    handle_lowercased: string,
  },
  tender: {
    amount: integer,
    currency: string 3-letter uppercase,
    afterConversion: null || integer, //if there was a conversion, sometimes the amount isn't as expected
  },
  noteToWisher: {
    message: string,
    read: null || datetime(iso 8601),
  },
  fromLine: string,
  noteToTender: null || {
    message: string,
    sent:datetime(iso 8601)
  },
  paidOn: datetime(iso 8601),
};


```

## **GET /api/orders/:aliasId**

Returns all paid gift orders gifted to specified alias.

- **URL Params**  
  _Required:_ `aliasId=[integer]`
- **Data Params**  
  None
- **Headers**  
  Authentication: Cookie `<session_cookie>`
- **Success Response:**

  - **Code:** 200  
    **Content:**

  ```
  [
     {<order_object>},
     {<order_object>},
     {<order_object>}
  ]
  ```

* **Error Response:**
  - **Code:** 401  
    **Content:** `{ error : "You are unauthorized to make this request" }`

<details open>
<summary>Successful Response Example:</summary>
<br>

```
[
  {
    _id: '603a9b8bbf6c85032169fe80',
     gifts: [
      {
        item: {
          _id: '603a8e00bf6c85032169fe7e',
          itemName: 'Gucci Ken Scott Print Hooded Jacket - Farfetch',
          price: 210000,
          url:'https://www.farfetch.com/shopping/women/gucci-ken-scott-print-hooded-jacket-item-16331626.aspx?storeid=10644',
          currency: 'USD',
          wishlist: '603a8d02bf6c85032169fe7d',
          itemImage: '/data/images/itemImages/ca1c1ba8-44df-4b0a-8b65-486e2a346f0f.png',
        },
        qty: 1,
        price: 210000,
      },
    ],
    alias: {
      _id: '603a8d02bf6c85032169fe7c',
      handle: 'dadasheshe1',
      aliasName: 'KULLi',
      currency: 'USD',
      handle_lowercased: 'dadasheshe1',
    },
    tender: {
      amount: 210000,
      currency: 'USD',
      converted: null,
    },
    noteToWisher: {
      message: "Hey, you're a huge inspiration for me. This gift is to show my gratitude.",
      read: '2020-02-28T14:42:11.394Z',
    },
    fromLine: 'Fred',
    thankYouNote:{
      message: "Thank you Fred for these awesome gifts!",
      dateSent: '2020-02-28T14:50:11.394Z'
    },
    paidOn: '2020-02-26T14:42:11.394Z',
  },
];
```

</details>
