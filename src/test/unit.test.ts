import { suite, test } from 'mocha';
import { expect } from 'chai';
import JSONPatchQuery, { Operation } from '../JSONPatchQuery';

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
          path: 'serviceCharacteristic[?(@.name=="suspensionReason")].value[?(@=="fraudHeavy")]',
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
          path: 'supportingService[?(@.id=="ed7ce908-9e89-11e8-98d0-529269fb1459")].serviceCharacteristic[?(@.name=="callRestriction")].value[?(@=="barTotal")]',
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
