import type { Schema, Struct } from '@strapi/strapi';

export interface ProductSizeOption extends Struct.ComponentSchema {
  collectionName: 'components_product_size_options';
  info: {
    displayName: 'Size Option';
    icon: 'hashtag';
  };
  attributes: {
    available: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    priceModifier: Schema.Attribute.Decimal;
    size: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'product.size-option': ProductSizeOption;
    }
  }
}
