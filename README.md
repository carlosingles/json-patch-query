# JSON Patch Query

This library aims to implement the specification outlined by the TM Forum outlined [here](https://projects.tmforum.org/wiki/pages/viewpage.action?spaceKey=PUB&title=TMF630+REST+API+Design+Guidelines+v4.0.1)

## Usage

### `JSONPatchQuery.apply(document: any, patch: Operation[]): any`
Accepts a document and an array of patch operations to be performed on the document. Individual patch operation must adhere to the operations listed in [JSON Patch RFC6902](https://datatracker.ietf.org/doc/html/rfc6902#section-2) and use a `path` property that adheres to the [JSON Path Format](https://goessner.net/articles/JsonPath/index.html#e2).

Returns the mutated document.

### Examples
For working examples of JSON Patch Query, look at the [`src/test/unit.test.ts`](https://github.com/carlosingles/json-patch-query/blob/main/src/test/unit.test.ts) file in this repository, where there a wide variety of examples executing the different operations.


## Edge Cases
Consider a document that has two items that may have an ambiguous JSON path, in this case, it's two `orderItem` objects that have `productOffering.id` equal to `1513`:
```json
{
  "id": "3774",
  "description": "This product order covers ...",
  "requestedCompletionDate": "2017-07-14",
  "orderItem": [{
    "action": "add",
    "quantity": 1,
    "productOffering": {
      "href": "/productOffering/1513",
      "id": "1513",
      "name": "Offer Good Plan"
    },
    "product": {
      "relatedParty": [{
        "id": "7894",
        "name": "Mary",
        "role": "customer"
      }]
    }
  }, {
    "action": "add",
    "quantity": 2,
    "productOffering": {
      "href": "/productOffering/1513",
      "id": "1513",
      "name": "Offer Good Plan"
    },
    "product": {
      "relatedParty": [{
        "id": "3456",
        "name": "John",
        "role": "customer"
      }]
    }
  }]
}
```

You may update the `relatedParty` of a specific `orderItem` with a JSON path as follows:
```
// Update the name where the relatedParty.id of the product is 7894
$.orderItem[?(@.productOffering.id=="1513")].product.relatedParty[?(@.id=="7894")].name
```

However, if you wanted to update the quantity of the same `orderItem`, a JSON path with a query would not be possible, instead you would need to provide the index upfront.
```
// ❌ JSON Path does not support nested queries, quantity cannot be updated this way
$.orderItem[?(@.productOffering.id=="1513" && @.product.relatedParty[?(@.id=="7894")])].quantity

// ✅ Update the quantity of the orderItem where the relatedParty.id of the product is 7894 (with a fixed index)
$.orderItem[?(@.productOffering.id=="1513" && @.product.relatedParty[0].id=="7894")].quantity
```
This limitation is due to the way that JSON Path traverses the document whilst performing the query. Once it has gone down the tree, it can no longer go back up the tree to retrieve the property. Additionally, nested queries are not supported within JSON Path.

That is, unlike XPath, JSON Path does not have operations for accessing parent or sibling nodes from the given node.