import { suite, test } from 'mocha';
import { expect } from 'chai';
import JSONPatchQuery, { Operation } from '../JSONPatchQuery';

suite('application/json-patch+query', () => {
  suite('Generic Examples', () => {
    test('Removing items using a complex query', () => {
      const document = {
        swagger: '2.0',
        tags: [
          { name: 'catalog' },
          { name: 'category' },
          { name: 'productOffering' },
          { name: 'productOfferingPrice' },
          { name: 'productSpecification' },
          { name: 'importJob' },
          { name: 'exportJob' },
          { name: 'notification listeners (client side)' },
          { name: 'events subscription' },
        ],
      };
      const patch: Operation[] = [
        {
          op: 'remove',
          path: "$.tags[?(@.name!='catalog' && @.name!='productOffering' && @.name!='productSpecification')]",
        },
      ];
      const expected = {
        swagger: '2.0',
        tags: [
          { name: 'catalog' },
          { name: 'productOffering' },
          { name: 'productSpecification' },
        ],
      };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('Performing an add operation to the top level object', () => {
      const document = { id: 342 };
      const patch: Operation[] = [
        {
          op: 'add',
          path: '$.name',
          value: 'Jane Doe',
        },
      ];
      const expected = { id: 342, name: 'Jane Doe' };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('Performing an add operation with a field that contains a number', () => {
      const document = { id: 342 };
      const patch: Operation[] = [
        {
          op: 'add',
          path: '$.name2',
          value: 'Jane Doe',
        },
      ];
      const expected = { id: 342, name2: 'Jane Doe' };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('Performing an add operation to an existing object with a string value', () => {
      const document = { id: 342, address: { code: 123, line: '123 Fake Street' } };
      const patch: Operation[] = [
        {
          op: 'add',
          path: '$.address',
          value: '123 Fake Street',
        },
      ];
      const expected = { id: 342, address: '123 Fake Street' };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('Performing an add operation with a field that contains a special character', () => {
      const document = { id: 342 };
      const patch: Operation[] = [
        {
          op: 'add',
          path: '$.`@href',
          value: '/jane-doe',
        },
      ];
      const expected = { id: 342, '@href': '/jane-doe' };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('Performing an add operation with a nested field that contains a special character', () => {
      const document = { id: 342, details: { name: "Jane Doe" } };
      const patch: Operation[] = [
        {
          op: 'add',
          path: '$.details.`@href',
          value: '/jane-doe',
        },
      ];
      const expected = { id: 342, details: { '@href': '/jane-doe', name: "Jane Doe" } };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('Performing a remove operation using the escape character', () => {
      const document = { id: 342, details: { name: "Jane Doe", '@href': '/jane-doe' } };
      const patch: Operation[] = [
        {
          op: 'remove',
          path: '$.details.`@href',
        },
      ];
      const expected = { id: 342, details: { name: "Jane Doe" } };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('Performing an add operation with a nested field that contains an escape character that is not used', () => {
      const document = { id: 342, details: { name: "Jane Doe" } };
      const patch: Operation[] = [
        {
          op: 'add',
          path: '$.details.escape`string',
          value: '/jane-doe',
        },
      ];
      const expected = { id: 342, details: { 'escape`string': '/jane-doe', name: "Jane Doe" } };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('Performing an add operation using a nested filter expression', () => {
      const document =
        [{
          "id": "79af5012-c924-45a3-8c43-442724dfcb5c",
          "nested": [
            {
              "id": "acfbcab4-8d75-45ca-9f63-afab5097b925",
              "status": "inactive",
              "@referredType": "InstanceConsumerGroup"
            },
            {
              "id": "dfa0060f-0dc7-4f82-aa9f-ff0f1e73b29e",
              "status": "active",
            },
          ],
        },
        {
          "id": "f36205f4-e144-4ded-9e64-82ede0b26e22",
          "nested": [
            {
              "id": "a3f227c1-de5e-439f-8631-5efb5ec19ac0",
              "status": "active",
            },
            {
              "id": "9bcffb8d-4e3c-4a62-87e5-af7b5c07c088",
              "status": "active",
            },
          ],
        },
        {
          "id": "445edd27-56cc-4a41-a598-0dad778aff41",
          "nested": [
            {
              "id": "eff8fc58-93c6-4549-a4b6-d950686c616e",
              "status": "inactive",
            },
            {
              "id": "6c3ee9af-2c89-4b9a-b987-fd5fd98b95af",
              "status": "inactive",
            },
          ],
        }];
      const patch: Operation[] = [
        {
          op: 'remove',
          path: `$[?(@.nested[?(@.status=='inactive')])]`,
        },
      ];
      const expected = [
        {
          "id": "f36205f4-e144-4ded-9e64-82ede0b26e22",
          "nested": [
            {
              "id": "a3f227c1-de5e-439f-8631-5efb5ec19ac0",
              "status": "active",
            },
            {
              "id": "9bcffb8d-4e3c-4a62-87e5-af7b5c07c088",
              "status": "active",
            },
          ],
        },
      ];
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });
  });

  suite('test operation scenarios', () => {
    test('Numeric value comparison is incorrect', () => {
      const document = { id: 342 };
      const patch: Operation[] = [
        {
          op: 'test',
          path: '$.id',
          value: 2,
        },
      ];
      expect(() => JSONPatchQuery.apply(document, patch)).to.throw(/test operation failed/);
    });

    test('Numeric value comparison matches', () => {
      const document = { id: 2 };
      const patch: Operation[] = [
        {
          op: 'test',
          path: '$.id',
          value: 2,
        },
      ];
      expect(() => JSONPatchQuery.apply(document, patch)).to.not.throw(/test operation failed/);
    });

    test('Boolean value comparison is incorrect', () => {
      const document = { boolean: false };
      const patch: Operation[] = [
        {
          op: 'test',
          path: '$.boolean',
          value: true,
        },
      ];
      expect(() => JSONPatchQuery.apply(document, patch)).to.throw(/test operation failed/);
    });

    test('Object value comparison matches', () => {
      const document = { object: { d: 1, e: 2, f: 3 } };
      const patch: Operation[] = [
        {
          op: 'test',
          path: '$.object',
          value: {
            f: 3,
            d: 1,
            e: 2,
          },
        },
      ];
      expect(() => JSONPatchQuery.apply(document, patch)).to.not.throw(/test operation failed/);
    });

    test('Object value comparison is incorrect', () => {
      const document = { object: { d: 1, e: 2, f: 3 } };
      const patch: Operation[] = [
        {
          op: 'test',
          path: '$.object',
          value: {
            d: 1,
            e: 2,
            f: 4,
          },
        },
      ];
      expect(() => JSONPatchQuery.apply(document, patch)).to.throw(/test operation failed/);
    });

    test('String value comparison matches', () => {
      const document = { string: 'a string value' };
      const patch: Operation[] = [
        {
          op: 'test',
          path: '$.string',
          value: 'a string value',
        },
      ];
      expect(() => JSONPatchQuery.apply(document, patch)).to.not.throw(/test operation failed/);
    });

    test('complex query matches', () => {
      const document = {
        id: '1',
        correlationId: 'TT53482',
        note: [{
          date: '2013-07-24T09:55:30.0Z',
          author: 'Arthur Evans',
          text: 'Not Informed',
        }, {
          date: '2013-07-25T08:55:12.0Z',
          author: 'John Doe',
          text: 'Informed',
        }],
      };
      const patch: Operation[] = [
        {
          op: 'test',
          path: 'note[?(@.author=="John Doe")]',
          value: {
            date: '2013-07-25T08:55:12.0Z',
            author: 'John Doe',
            text: 'Informed',
          },
        },
      ];
      expect(() => JSONPatchQuery.apply(document, patch)).to.not.throw(/test operation failed/);
    });

    test('complex query does not match', () => {
      const document = {
        id: '1',
        correlationId: 'TT53482',
        note: [{
          date: '2013-07-24T09:55:30.0Z',
          author: 'Arthur Evans',
          text: 'Not Informed',
        }, {
          date: '2013-07-25T08:55:12.0Z',
          author: 'John Doe',
          text: 'Informed',
        }],
      };
      const patch: Operation[] = [
        {
          op: 'test',
          path: 'note[?(@.author=="Arthur Evans")]',
          value: {
            date: '2013-07-25T08:55:12.0Z',
            author: 'John Doe',
            text: 'Informed',
          },
        },
      ];
      expect(() => JSONPatchQuery.apply(document, patch)).to.throw(/test operation failed/);
    });
  });

  suite('copy operation scenarios', () => {
    test('copy a primitive value from one location to another', () => {
      const document = [{ id: 123, role: 'Admin' }, { id: 342 }];
      const patch: Operation[] = [
        {
          op: 'copy',
          path: '$.[?(@.id==342)].role',
          from: '$.[?(@.id==123)].role',
        },
      ];
      const expected = [{ id: 123, role: 'Admin' }, { id: 342, role: 'Admin' }];
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('fail to copy a value when the json path resolves multiple nodes', () => {
      const document = {
        details: [
          { name: "address", value: "123 Fake Street" },
          { name: "address", value: "123 Real Street" },
        ]
      };
      const patch: Operation[] = [
        {
          op: 'copy',
          path: '$.realAddress',
          from: '$.details.[?(@.name=="address")].value',
        },
      ];
      expect(() => JSONPatchQuery.apply(document, patch)).to.throw(/"from" value resolved multiple nodes/);
    });

    test('copy an object value from one location to another', () => {
      const document = {
        id: 342,
        address: {
          code: 123,
          state: 'ST',
        },
      };
      const patch: Operation[] = [
        {
          op: 'copy',
          path: '$.secondaryAddress',
          from: '$.address',
        },
      ];
      const expected = {
        id: 342,
        address: {
          code: 123,
          state: 'ST',
        },
        secondaryAddress: {
          code: 123,
          state: 'ST',
        },
      };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('copy a value from within an array to another location', () => {
      const document = {
        users: [{ id: 123, role: 'Admin' }, { id: 342, role: 'User' }],
        admins: [],
      };
      const patch: Operation[] = [
        {
          op: 'copy',
          path: '$.admins',
          from: '$.users.[?(@.role=="Admin")]',
        },
      ];
      const expected = {
        users: [{ id: 123, role: 'Admin' }, { id: 342, role: 'User' }],
        admins: [{ id: 123, role: 'Admin' }],
      };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });
  });

  suite('move operation scenarios', () => {
    test('move a primitive value from one location to another', () => {
      const document = [{ id: 123, role: 'Admin' }, { id: 342 }];
      const patch: Operation[] = [
        {
          op: 'move',
          path: '$.[?(@.id==342)].role',
          from: '$.[?(@.id==123)].role',
        },
      ];
      const expected = [{ id: 123 }, { id: 342, role: 'Admin' }];
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('fail to move a value when the json path resolves multiple nodes', () => {
      const document = {
        details: [
          { name: "address", value: "123 Fake Street" },
          { name: "address", value: "123 Real Street" },
        ],
        otherDetails: []
      };
      const patch: Operation[] = [
        {
          op: 'move',
          path: '$.otherDetails',
          from: '$.details.[?(@.name=="address")]',
        },
      ];
      expect(() => JSONPatchQuery.apply(document, patch)).to.throw(/"from" value resolved multiple nodes/);
    });

    test('move an object value from one location to another', () => {
      const document = {
        id: 342,
        address: {
          code: 123,
          state: 'ST',
        },
      };
      const patch: Operation[] = [
        {
          op: 'move',
          path: '$.secondaryAddress',
          from: '$.address',
        },
      ];
      const expected = {
        id: 342,
        secondaryAddress: {
          code: 123,
          state: 'ST',
        },
      };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('move an object value from one location to another with escape characters', () => {
      const document = {
        id: 342,
        address: {
          '@code': 123,
          state: 'ST',
        },
      };
      const patch: Operation[] = [
        {
          op: 'move',
          path: '$.`@code',
          from: '$.address.`@code',
        },
      ];
      const expected = {
        id: 342,
        address: {
          state: 'ST',
        },
        '@code': 123,
      };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('move a value from within an array to another location', () => {
      const document = {
        users: [{ id: 123, role: 'Admin' }, { id: 342, role: 'User' }],
        admins: [],
      };
      const patch: Operation[] = [
        {
          op: 'move',
          path: '$.admins',
          from: '$.users.[?(@.role=="Admin")]',
        },
      ];
      const expected = {
        users: [{ id: 342, role: 'User' }],
        admins: [{ id: 123, role: 'Admin' }],
      };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });
  });

  suite('TM Forum Examples', () => {
    test('Adding an attribute to one of the components of an array', () => {
      const document = {
        id: '1',
        correlationId: 'TT53482',
        note: [{
          date: '2013-07-24T09:55:30.0Z',
          author: 'Arthur Evans',
        }, {
          date: '2013-07-25T08:55:12.0Z',
          author: 'John Doe',
        }],
      };
      const patch: Operation[] = [
        {
          op: 'add',
          path: 'note[?(@.author=="John Doe")]',
          value: { text: 'Informed' },
        },
      ];
      const expected = {
        id: '1',
        correlationId: 'TT53482',
        note: [{
          date: '2013-07-24T09:55:30.0Z',
          author: 'Arthur Evans',
        }, {
          date: '2013-07-25T08:55:12.0Z',
          author: 'John Doe',
          text: 'Informed',
        }],
      };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('Removing one of the components of an Array Element (the whole structure)', () => {
      const document = {
        id: '1',
        correlationId: 'TT53482',
        note: [{
          date: '2013-07-24T09:55:30.0Z',
          author: 'Arthur Evans',
          text: 'Already called the expert',
        }, {
          date: '2013-07-25T08:55:12.0Z',
          author: 'John Doe',
          text: 'Informed',
        }, {
          date: '2013-07-25T07:55:12.0Z',
          author: 'Diego Salas',
          text: 'Resolved issue',
        }],
      };
      const patch: Operation[] = [
        {
          op: 'remove',
          path: 'note[?(@.author=="John Doe")]',
        },
      ];
      const expected = {
        id: '1',
        correlationId: 'TT53482',
        note: [{
          date: '2013-07-24T09:55:30.0Z',
          author: 'Arthur Evans',
          text: 'Already called the expert',
        }, {
          date: '2013-07-25T07:55:12.0Z',
          author: 'Diego Salas',
          text: 'Resolved issue',
        }],
      };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('Removing an attribute from one of the components of an array', () => {
      const document = {
        id: '4501',
        description: 'This product ...',
        productPrice: [{
          name: 'Regular Price',
          priceType: 'recurring',
          prodPriceAlteration: {
            name: 'Shipping Discount',
            description: 'This prod price alteration ...',
          },
          price: {},
        }, {
          name: 'Setup Price',
          priceType: 'one time',
          price: {},
        }],
      };
      const patch: Operation[] = [
        {
          op: 'remove',
          path: 'productPrice[?(@.name=="Regular Price")].prodPriceAlteration',
        },
      ];
      const expected = {
        id: '4501',
        description: 'This product ...',
        productPrice: [{
          name: 'Regular Price',
          priceType: 'recurring',
          price: {},
        }, {
          name: 'Setup Price',
          priceType: 'one time',
          price: {},
        }],
      };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('Removing a complete complex structure component of an array', () => {
      const document = {
        id: '4501',
        description: 'This product ...',
        productPrice: [{
          name: 'Regular Price',
          priceType: 'recurring',
          prodPriceAlteration: {
            name: 'Shipping Discount',
            description: 'This prod price alteration ...',
          },
          price: {},
        }, {
          name: 'Setup Price',
          priceType: 'one time',
          price: {},
        }],
      };
      const patch: Operation[] = [
        {
          op: 'remove',
          path: 'productPrice[?(@.name=="Setup Price")]',
        },
      ];
      const expected = {
        id: '4501',
        description: 'This product ...',
        productPrice: [{
          name: 'Regular Price',
          priceType: 'recurring',
          prodPriceAlteration: {
            name: 'Shipping Discount',
            description: 'This prod price alteration ...',
          },
          price: {},
        }],
      };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('Replacing an attribute from one of the components of an array', () => {
      const document = {
        id: '42',
        description: 'Virtual Storage Medium',
        lifecycleStatus: 'Active',
        productOfferingPrice: [{
          name: 'Monthly Price',
          priceType: 'recurring',
          price: {
            amount: 12,
            units: 'EUR',
          },
        }, {
          name: 'Setup Price',
          priceType: 'one time',
          price: {
            amount: 30,
            units: 'EUR',
          },
        }],
      };
      const patch: Operation[] = [
        {
          op: 'replace',
          path: 'productOfferingPrice[?(@.name=="Monthly Price")].price.amount',
          value: 25,
        },
      ];
      const expected = {
        id: '42',
        description: 'Virtual Storage Medium',
        lifecycleStatus: 'Active',
        productOfferingPrice: [{
          name: 'Monthly Price',
          priceType: 'recurring',
          price: {
            amount: 25,
            units: 'EUR',
          },
        }, {
          name: 'Setup Price',
          priceType: 'one time',
          price: {
            amount: 30,
            units: 'EUR',
          },
        }],
      };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('Replacing a complete component of an array', () => {
      const document = {
        id: '42',
        description: 'Virtual Storage Medium',
        lifecycleStatus: 'Active',
        productOfferingPrice: [{
          name: 'Monthly Price',
          priceType: 'recurring',
          price: {
            amount: 12,
            units: 'EUR',
          },
        }, {
          name: 'Setup Price',
          priceType: 'one time',
          price: {
            amount: 30,
            units: 'EUR',
          },
        }],
      };
      const patch: Operation[] = [
        {
          op: 'replace',
          path: 'productOfferingPrice[?(@.name=="Setup Price")].price',
          value: {
            amount: 40,
            units: 'USD',
          },
        },
      ];
      const expected = {
        id: '42',
        description: 'Virtual Storage Medium',
        lifecycleStatus: 'Active',
        productOfferingPrice: [{
          name: 'Monthly Price',
          priceType: 'recurring',
          price: {
            amount: 12,
            units: 'EUR',
          },
        }, {
          name: 'Setup Price',
          priceType: 'one time',
          price: {
            amount: 40,
            units: 'USD',
          },
        }],
      };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });

    test('Replacing an attribute from one of the components of a complex array (resolving ambiguities using a fixed index)', () => {
      const document = {
        id: '3774',
        description: 'This product order covers ...',
        requestedCompletionDate: '2017-07-14',
        orderItem: [{
          action: 'add',
          quantity: 1,
          productOffering: {
            href: '/productOffering/1513',
            id: '1513',
            name: 'Offer Good Plan',
          },
          product: {
            relatedParty: [{
              name: 'Mary',
              role: 'customer',
            }],
          },
        }, {
          action: 'add',
          quantity: 1,
          productOffering: {
            href: '/productOffering/1513',
            id: '1513',
            name: 'Offer Good Plan',
          },
          product: {
            relatedParty: [{
              name: 'John',
              role: 'customer',
            }],
          },
        }],
      };
      const patch: Operation[] = [
        {
          op: 'replace',
          path: 'orderItem[?(@.productOffering.id=="1513" && @.product.relatedParty[0].name == "Mary")].quantity',
          value: 25,
        },
      ];
      const expected = {
        id: '3774',
        description: 'This product order covers ...',
        requestedCompletionDate: '2017-07-14',
        orderItem: [{
          action: 'add',
          quantity: 25,
          productOffering: {
            href: '/productOffering/1513',
            id: '1513',
            name: 'Offer Good Plan',
          },
          product: {
            relatedParty: [{
              name: 'Mary',
              role: 'customer',
            }],
          },
        }, {
          action: 'add',
          quantity: 1,
          productOffering: {
            href: '/productOffering/1513',
            id: '1513',
            name: 'Offer Good Plan',
          },
          product: {
            relatedParty: [{
              name: 'John',
              role: 'customer',
            }],
          },
        }],
      };
      const result = JSONPatchQuery.apply(document, patch);
      expect(result).to.eql(expected);
    });
  });

  suite('Generic ELine Service Examples', () => {
    suite('Updating service characteristics at root level', () => {
      test('Adding a new characteristic to the serviceCharacteristic array', () => {
        const document = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          serviceCharacteristic: [
            {
              name: 'maxNumOfEvcEndPoint',
              value: '2',
            },
            {
              name: 'connectionType',
              value: 'Point-To-Point',
            },
          ],
        };
        const patch: Operation[] = [
          {
            op: 'add',
            path: 'serviceCharacteristic',
            value: { name: 'broadcastFrameDelivery', value: 'unconditional' },
          },
        ];
        const expected = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          serviceCharacteristic: [
            {
              name: 'maxNumOfEvcEndPoint',
              value: '2',
            },
            {
              name: 'connectionType',
              value: 'Point-To-Point',
            },
            {
              name: 'broadcastFrameDelivery',
              value: 'unconditional',
            },
          ],
        };
        const result = JSONPatchQuery.apply(document, patch);
        expect(result).to.eql(expected);
      });

      test('Removing a characteristic from serviceCharacteristic array', () => {
        const document = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          serviceCharacteristic: [
            {
              name: 'maxNumOfEvcEndPoint',
              value: '2',
            },
            {
              name: 'connectionType',
              value: 'Point-To-Point',
            },
            {
              name: 'broadcastFrameDelivery',
              value: 'unconditional',
            },
          ],
        };
        const patch: Operation[] = [
          {
            op: 'remove',
            path: 'serviceCharacteristic[?(@.name=="broadcastFrameDelivery")]',
          },
        ];
        const expected = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          serviceCharacteristic: [
            {
              name: 'maxNumOfEvcEndPoint',
              value: '2',
            },
            {
              name: 'connectionType',
              value: 'Point-To-Point',
            },
          ],
        };
        const result = JSONPatchQuery.apply(document, patch);
        expect(result).to.eql(expected);
      });

      test('Updating the value of a characteristic in the serviceCharacteristic array', () => {
        const document = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          serviceCharacteristic: [
            {
              name: 'maxNumOfEvcEndPoint',
              value: '2',
            },
            {
              name: 'connectionType',
              value: 'Point-To-Point',
            },
          ],
        };
        const patch: Operation[] = [
          {
            op: 'replace',
            path: 'serviceCharacteristic[?(@.name=="connectionType")].value',
            value: 'Rooted-Multipoint',
          },
        ];
        const expected = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          serviceCharacteristic: [
            {
              name: 'maxNumOfEvcEndPoint',
              value: '2',
            },
            {
              name: 'connectionType',
              value: 'Rooted-Multipoint',
            },
          ],
        };
        const result = JSONPatchQuery.apply(document, patch);
        expect(result).to.eql(expected);
      });

      test('Add an item to an array of strings', () => {
        const document = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          serviceCharacteristic: [
            {
              name: 'suspensionReason',
              value: ['lostStolen'],
            },
            {
              name: 'connectionType',
              value: 'Point-To-Point',
            },
          ],
        };
        const patch: Operation[] = [
          {
            op: 'add',
            path: 'serviceCharacteristic[?(@.name=="suspensionReason")].value',
            value: 'fraudHeavy',
          },
        ];
        const expected = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          serviceCharacteristic: [
            {
              name: 'suspensionReason',
              value: ['lostStolen', 'fraudHeavy'],
            },
            {
              name: 'connectionType',
              value: 'Point-To-Point',
            },
          ],
        };
        const result = JSONPatchQuery.apply(document, patch);
        expect(result).to.eql(expected);
      });

      test('Remove an item from an array of strings', () => {
        const document = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          serviceCharacteristic: [
            {
              name: 'suspensionReason',
              value: ['lostStolen', 'fraudHeavy'],
            },
            {
              name: 'connectionType',
              value: 'Point-To-Point',
            },
          ],
        };
        const patch: Operation[] = [
          {
            op: 'remove',
            path: 'serviceCharacteristic[?(@.name=="suspensionReason")].value[?(@ =="fraudHeavy")]',
          },
        ];
        const expected = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          serviceCharacteristic: [
            {
              name: 'suspensionReason',
              value: ['lostStolen'],
            },
            {
              name: 'connectionType',
              value: 'Point-To-Point',
            },
          ],
        };
        const result = JSONPatchQuery.apply(document, patch);
        expect(result).to.eql(expected);
      });

      test('Adding an attribute to a service characteristic value of object type', () => {
        const document = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          serviceCharacteristic: [
            {
              name: 'order',
              value: {
                orderReferenceId: 'ORD123456',
                orderSLA: 'Standard',
              },
            },
            {
              name: 'connectionType',
              value: 'Point-To-Point',
            },
          ],
        };
        const patch: Operation[] = [
          {
            op: 'add',
            path: 'serviceCharacteristic[?(@.name=="order")].value',
            value: { nbnAppointmetId: 'APT123456' },
          },
        ];
        const expected = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          serviceCharacteristic: [
            {
              name: 'order',
              value: {
                orderReferenceId: 'ORD123456',
                orderSLA: 'Standard',
                nbnAppointmetId: 'APT123456',
              },
            },
            {
              name: 'connectionType',
              value: 'Point-To-Point',
            },
          ],
        };
        const result = JSONPatchQuery.apply(document, patch);
        expect(result).to.eql(expected);
      });

      test('Updating an attribute to a service characteristic value of object type', () => {
        const document = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          serviceCharacteristic: [
            {
              name: 'order',
              value: {
                orderReferenceId: 'ORD123456',
                orderSLA: 'Standard',
              },
            },
            {
              name: 'connectionType',
              value: 'Point-To-Point',
            },
          ],
        };
        const patch: Operation[] = [
          {
            op: 'replace',
            path: 'serviceCharacteristic[?(@.name=="order")].value.orderSLA',
            value: 'Priority',
          },
        ];
        const expected = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          serviceCharacteristic: [
            {
              name: 'order',
              value: {
                orderReferenceId: 'ORD123456',
                orderSLA: 'Priority',
              },
            },
            {
              name: 'connectionType',
              value: 'Point-To-Point',
            },
          ],
        };
        const result = JSONPatchQuery.apply(document, patch);
        expect(result).to.eql(expected);
      });

      test('Removing an attribute in a service characteristic value of object type', () => {
        const document = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          serviceCharacteristic: [
            {
              name: 'order',
              value: {
                orderReferenceId: 'ORD123456',
                orderSLA: 'Standard',
              },
            },
            {
              name: 'connectionType',
              value: 'Point-To-Point',
            },
          ],
        };
        const patch: Operation[] = [
          {
            op: 'remove',
            path: 'serviceCharacteristic[?(@.name=="order")].value.orderSLA',
          },
        ];
        const expected = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          serviceCharacteristic: [
            {
              name: 'order',
              value: {
                orderReferenceId: 'ORD123456',
              },
            },
            {
              name: 'connectionType',
              value: 'Point-To-Point',
            },
          ],
        };
        const result = JSONPatchQuery.apply(document, patch);
        expect(result).to.eql(expected);
      });
    });

    suite('Updating supporting services', () => {
      test('Adding a new supportingService', () => {
        const document = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          supportingService: [
            {
              name: 'data',
              state: 'active',
              serviceSpecification: {
                name: 'data',
                href: 'serviceCatalogManagement/v2/serviceSpecification/data/d29205f4-e144-4ded-9e64-82ede0b26e88',
              },
            },
          ],
        };
        const patch: Operation[] = [
          {
            op: 'add',
            path: 'supportingService',
            value: {
              id: 'ed7ce908-9e89-11e8-98d0-529269fb1459',
              href: 'activationAndConfiguration/v2/service/service2/ed7ce908-9e89-11e8-98d0-529269fb1459',
              name: 'voicemail',
              state: 'active',
              serviceSpecification: {
                name: 'voicemail',
                href: 'serviceCatalogManagement/v2/serviceSpecification/voicemail/e29205f4-e144-4ded-9e64-82ede0b99999',
              },
              serviceCharacteristic: [
                {
                  name: 'multicastFrameDelivery',
                  value: 'unconditional',
                },
              ],
            },
          },
        ];
        const expected = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          supportingService: [
            {
              name: 'data',
              state: 'active',
              serviceSpecification: {
                name: 'data',
                href: 'serviceCatalogManagement/v2/serviceSpecification/data/d29205f4-e144-4ded-9e64-82ede0b26e88',
              },
            },
            {
              id: 'ed7ce908-9e89-11e8-98d0-529269fb1459',
              href: 'activationAndConfiguration/v2/service/service2/ed7ce908-9e89-11e8-98d0-529269fb1459',
              name: 'voicemail',
              state: 'active',
              serviceSpecification: {
                name: 'voicemail',
                href: 'serviceCatalogManagement/v2/serviceSpecification/voicemail/e29205f4-e144-4ded-9e64-82ede0b99999',
              },
              serviceCharacteristic: [
                {
                  name: 'multicastFrameDelivery',
                  value: 'unconditional',
                },
              ],

            },
          ],
        };
        const result = JSONPatchQuery.apply(document, patch);
        expect(result).to.eql(expected);
      });

      test('Adding serviceRelationship to a service, when property does not exist', () => {
        const document = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'serviceOrdering/v4/serviceOrder/internetDirect/e26205f4-e144-4ded-9e64-82ede0b26e33',
          orderDate: '2020-04-01T14:20:54.1Z',
          requestedCompletionDate: '2020-10-01T14:20:54.1Z',
          startDate: '2020-04-01T14:20:54.1Z',
          state: 'inProgress',
          externalReference: [
            {
              externalReferenceType: 'SalesOrderId',
              name: 'ORD1234567',
            },
            {
              externalReferenceType: 'FeasibilityId',
              name: 'ABC1234567',
            },
          ],
          relatedParty: [
            {
              id: 'B2BSmallandMediumBusiness',
              role: 'InstanceConsumerGroup',
              '@referredType': 'InstanceConsumerGroup',
            },
          ],
          serviceOrderItem: [
            {
              id: 'e26205f4-e144-4ded-9e64-82ede0b26f4',
              action: 'add',
              state: 'inProgress',
              service: {
                id: 'f36205f4-e144-4ded-9e64-82ede0b26e22',
                href: 'activationAndConfiguration/v4/service/internetDirect/f36205f4-e144-4ded-9e64-82ede0b26e22',
              },
            },
          ],
        };
        const patch: Operation[] = [
          {
            op: 'add',
            path: "$.serviceOrderItem[?(@.service.id=='f36205f4-e144-4ded-9e64-82ede0b26e22')].service.serviceRelationship",
            value: [{
              relationshipType: 'substitutionBy',
              service: {
                id: 'd11e1668-2715-409e-a586-6e0bfa55de9e',
                href: 'activationAndConfiguration/v4/service/ethernetAccessInterface/d11e1668-2715-409e-a586-6e0bfa55de9e',
              },
              serviceRelationshipCharacteristic: [
                {
                  name: 'accessTopology',
                  value: 'Fully Redundant',
                },
              ],
            }],
          },
          {
            op: 'add',
            path: "$.serviceOrderItem[?(@.service.id=='f36205f4-e144-4ded-9e64-82ede0b26e22')].service.serviceRelationship",
            value: {
              relationshipType: 'reliesOn',
              service: {
                id: 'd11e1668-2715-409e-a586-6e0bfa55de9e',
                href: 'activationAndConfiguration/v4/service/ethernetAccess/d11e1668-2715-409e-a586-6e0bfa55de9e',
              },
            },
          },
        ];
        const expected = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'serviceOrdering/v4/serviceOrder/internetDirect/e26205f4-e144-4ded-9e64-82ede0b26e33',
          orderDate: '2020-04-01T14:20:54.1Z',
          requestedCompletionDate: '2020-10-01T14:20:54.1Z',
          startDate: '2020-04-01T14:20:54.1Z',
          state: 'inProgress',
          externalReference: [
            {
              externalReferenceType: 'SalesOrderId',
              name: 'ORD1234567',
            },
            {
              externalReferenceType: 'FeasibilityId',
              name: 'ABC1234567',
            },
          ],
          relatedParty: [
            {
              id: 'B2BSmallandMediumBusiness',
              role: 'InstanceConsumerGroup',
              '@referredType': 'InstanceConsumerGroup',
            },
          ],
          serviceOrderItem: [
            {
              id: 'e26205f4-e144-4ded-9e64-82ede0b26f4',
              action: 'add',
              state: 'inProgress',
              service: {
                id: 'f36205f4-e144-4ded-9e64-82ede0b26e22',
                href: 'activationAndConfiguration/v4/service/internetDirect/f36205f4-e144-4ded-9e64-82ede0b26e22',
                serviceRelationship: [
                  {
                    relationshipType: 'substitutionBy',
                    service: {
                      id: 'd11e1668-2715-409e-a586-6e0bfa55de9e',
                      href: 'activationAndConfiguration/v4/service/ethernetAccessInterface/d11e1668-2715-409e-a586-6e0bfa55de9e',
                    },
                    serviceRelationshipCharacteristic: [
                      {
                        name: 'accessTopology',
                        value: 'Fully Redundant',
                      },
                    ],
                  },
                  {
                    relationshipType: 'reliesOn',
                    service: {
                      id: 'd11e1668-2715-409e-a586-6e0bfa55de9e',
                      href: 'activationAndConfiguration/v4/service/ethernetAccess/d11e1668-2715-409e-a586-6e0bfa55de9e',
                    },
                  },
                ],
              },
            },
          ],
        };

        const result = JSONPatchQuery.apply(document, patch);
        expect(result).to.eql(expected);
      });

      test('Throwing an error message, when trying to add a property to a non existent property', () => {
        const document = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'serviceOrdering/v4/serviceOrder/internetDirect/e26205f4-e144-4ded-9e64-82ede0b26e33',
          orderDate: '2020-04-01T14:20:54.1Z',
          requestedCompletionDate: '2020-10-01T14:20:54.1Z',
          startDate: '2020-04-01T14:20:54.1Z',
          state: 'inProgress',
          externalReference: [
            {
              externalReferenceType: 'SalesOrderId',
              name: 'ORD1234567',
            },
            {
              externalReferenceType: 'FeasibilityId',
              name: 'ABC1234567',
            },
          ],
          relatedParty: [
            {
              id: 'B2BSmallandMediumBusiness',
              role: 'InstanceConsumerGroup',
              '@referredType': 'InstanceConsumerGroup',
            },
          ],
          serviceOrderItem: [
            {
              id: 'e26205f4-e144-4ded-9e64-82ede0b26f4',
              action: 'add',
              state: 'inProgress',
              service: {
                id: 'f36205f4-e144-4ded-9e64-82ede0b26e22',
                href: 'activationAndConfiguration/v4/service/internetDirect/f36205f4-e144-4ded-9e64-82ede0b26e22',
              },
            },
          ],
        };
        const patch: Operation[] = [
          {
            op: 'add',
            path: "$.serviceOrderItem[?(@.service.id=='f36205f4-e144-4ded-9e64-82ede0b26e22')].service.serviceRelationship.values",
            value: [{
              relationshipType: 'substitutionBy',
              service: {
                id: 'd11e1668-2715-409e-a586-6e0bfa55de9e',
                href: 'activationAndConfiguration/v4/service/ethernetAccessInterface/d11e1668-2715-409e-a586-6e0bfa55de9e',
              },
              serviceRelationshipCharacteristic: [
                {
                  name: 'accessTopology',
                  value: 'Fully Redundant',
                },
              ],
            }],
          },
        ];
        expect(JSONPatchQuery.apply.bind(JSONPatchQuery, document, patch)).to.throw(Error, /Provided JSON Path did not resolve any nodes/);
      });

      test('Throwing an error message, when trying to add a property to a non existent property via a query', () => {
        const document = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'serviceOrdering/v4/serviceOrder/internetDirect/e26205f4-e144-4ded-9e64-82ede0b26e33',
          orderDate: '2020-04-01T14:20:54.1Z',
          requestedCompletionDate: '2020-10-01T14:20:54.1Z',
          startDate: '2020-04-01T14:20:54.1Z',
          state: 'inProgress',
          externalReference: [
            {
              externalReferenceType: 'SalesOrderId',
              name: 'ORD1234567',
            },
            {
              externalReferenceType: 'FeasibilityId',
              name: 'ABC1234567',
            },
          ],
          relatedParty: [
            {
              id: 'B2BSmallandMediumBusiness',
              role: 'InstanceConsumerGroup',
              '@referredType': 'InstanceConsumerGroup',
            },
          ],
          serviceOrderItem: [
            {
              id: 'e26205f4-e144-4ded-9e64-82ede0b26f4',
              action: 'add',
              state: 'inProgress',
              service: {
                id: 'f36205f4-e144-4ded-9e64-82ede0b26e22',
                href: 'activationAndConfiguration/v4/service/internetDirect/f36205f4-e144-4ded-9e64-82ede0b26e22',
              },
            },
          ],
        };
        const patch: Operation[] = [
          {
            op: 'add',
            path: "$.serviceOrderItem[?(@.service.id=='f36205f4-e144-4ded-9e64-82ede0b26e22')].service.serviceRelationship[?(@.id=='d11e1668-2715-409e-a586-6e0bfa55de9e')]",
            value: [{
              relationshipType: 'substitutionBy',
              service: {
                id: 'd11e1668-2715-409e-a586-6e0bfa55de9e',
                href: 'activationAndConfiguration/v4/service/ethernetAccessInterface/d11e1668-2715-409e-a586-6e0bfa55de9e',
              },
              serviceRelationshipCharacteristic: [
                {
                  name: 'accessTopology',
                  value: 'Fully Redundant',
                },
              ],
            }],
          },
        ];
        expect(JSONPatchQuery.apply.bind(JSONPatchQuery, document, patch)).to.throw(Error, /Provided JSON Path did not resolve any nodes/);
      });

      test('Removing a supportingService', () => {
        const document = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          supportingService: [
            {
              id: 'ed7ce908-9e89-11e8-98d0-529269fb1459',
              href: 'activationAndConfiguration/v2/service/service2/ed7ce908-9e89-11e8-98d0-529269fb1459',
              name: 'voicemail',
              state: 'active',
              serviceSpecification: {
                name: 'voicemail',
                href: 'serviceCatalogManagement/v2/serviceSpecification/voicemail/e29205f4-e144-4ded-9e64-82ede0b26e33',
              },
              serviceCharacteristic: [
                {
                  name: 'multicastFrameDelivery',
                  value: 'unconditional',
                },
              ],

            },
          ],
        };
        const patch: Operation[] = [
          {
            op: 'remove',
            path: 'supportingService[?(@.id=="ed7ce908-9e89-11e8-98d0-529269fb1459")]',
          },
        ];
        const expected = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          supportingService: [],
        };
        const result = JSONPatchQuery.apply(document, patch);
        expect(result).to.eql(expected);
      });
    });

    suite('Updating service characteristics inside supporting services', () => {
      test('Adding a new service characteristic inside supporting services', () => {
        const document = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          supportingService: [
            {
              id: 'ed7ce908-9e89-11e8-98d0-529269fb1459',
              href: 'activationAndConfiguration/v2/service/voicemail/ed7ce908-9e89-11e8-98d0-529269fb1459',
              serviceCharacteristic: [
                {
                  name: 'multicastFrameDelivery',
                  value: 'unconditional',
                },
              ],
            },
          ],
        };
        const patch: Operation[] = [
          {
            op: 'add',
            path: 'supportingService[?(@.id=="ed7ce908-9e89-11e8-98d0-529269fb1459")].serviceCharacteristic',
            value: { name: 'callRestriction', value: ['barPremium'] },
          },
        ];
        const expected = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          supportingService: [
            {
              id: 'ed7ce908-9e89-11e8-98d0-529269fb1459',
              href: 'activationAndConfiguration/v2/service/voicemail/ed7ce908-9e89-11e8-98d0-529269fb1459',
              serviceCharacteristic: [
                {
                  name: 'multicastFrameDelivery',
                  value: 'unconditional',
                },
                {
                  name: 'callRestriction',
                  value: ['barPremium'],
                },
              ],
            },
          ],
        };
        const result = JSONPatchQuery.apply(document, patch);
        expect(result).to.eql(expected);
      });

      test('Adding an item to a service characteristic string array inside supporting services', () => {
        const document = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          supportingService: [
            {
              id: 'ed7ce908-9e89-11e8-98d0-529269fb1459',
              href: 'activationAndConfiguration/v2/service/voicemail/ed7ce908-9e89-11e8-98d0-529269fb1459',
              serviceCharacteristic: [
                {
                  name: 'multicastFrameDelivery',
                  value: 'unconditional',
                },
                {
                  name: 'callRestriction',
                  value: ['barPremium'],
                },
              ],
            },
          ],
        };
        const patch: Operation[] = [
          {
            op: 'add',
            path: 'supportingService[?(@.id=="ed7ce908-9e89-11e8-98d0-529269fb1459")].serviceCharacteristic[?(@.name=="callRestriction")].value',
            value: 'barTotal',
          },
        ];
        const expected = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          supportingService: [
            {
              id: 'ed7ce908-9e89-11e8-98d0-529269fb1459',
              href: 'activationAndConfiguration/v2/service/voicemail/ed7ce908-9e89-11e8-98d0-529269fb1459',
              serviceCharacteristic: [
                {
                  name: 'multicastFrameDelivery',
                  value: 'unconditional',
                },
                {
                  name: 'callRestriction',
                  value: ['barPremium', 'barTotal'],
                },
              ],

            },
          ],
        };
        const result = JSONPatchQuery.apply(document, patch);
        expect(result).to.eql(expected);
      });

      test('Removing an item from a service characteristic string array inside supporting services', () => {
        const document = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          supportingService: [
            {
              id: 'ed7ce908-9e89-11e8-98d0-529269fb1459',
              href: 'activationAndConfiguration/v2/service/voicemail/ed7ce908-9e89-11e8-98d0-529269fb1459',
              serviceCharacteristic: [
                {
                  name: 'multicastFrameDelivery',
                  value: 'unconditional',
                },
                {
                  name: 'callRestriction',
                  value: ['barPremium', 'barTotal'],
                },
              ],
            },
          ],
        };
        const patch: Operation[] = [
          {
            op: 'remove',
            path: 'supportingService[?(@.id=="ed7ce908-9e89-11e8-98d0-529269fb1459")].serviceCharacteristic[?(@.name=="callRestriction")].value[?(@ =="barTotal")]',
          },
        ];
        const expected = {
          id: 'e26205f4-e144-4ded-9e64-82ede0b26e33',
          href: 'activationAndConfiguration/v2/service/Eline/e26205f4-e144-4ded-9e64-82ede0b26e33',
          name: 'Eline Service TMF Instance',
          supportingService: [
            {
              id: 'ed7ce908-9e89-11e8-98d0-529269fb1459',
              href: 'activationAndConfiguration/v2/service/voicemail/ed7ce908-9e89-11e8-98d0-529269fb1459',
              serviceCharacteristic: [
                {
                  name: 'multicastFrameDelivery',
                  value: 'unconditional',
                },
                {
                  name: 'callRestriction',
                  value: ['barPremium'],
                },
              ],

            },
          ],
        };
        const result = JSONPatchQuery.apply(document, patch);
        expect(result).to.eql(expected);
      });
    });
  });
});
