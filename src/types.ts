export interface Image {
  type: string;
  data: number[];
}

export interface User {
  IdUser: number;
  Name: string;
  Email: string;
  Password: string;
  IdUserServer: number;
}

export interface Group {
  IdGroup: number;
  Description: string;
  Image?: Image | string;
  ParentIdGroup: number | null;
  IdGroupServer: number;
  Code: string;
}

export interface Product {
  IdProduct: number;
  Description: string;
  Type: number;
  SalePrice: number;
  ImageSmall?: Image | string;
  Unit: string;
  IdGroup: number;
  Observations?: string;
  IdProductServer: number;
  IdProductInOrder?: string;
  Quantity?: number;
  Optionals?: Optional[];
}

export interface Order {
  IdPosOrder: number;
  Code: number;
  Description: string;
  Date: string;
  Total: number;
  OrderStatus: number;
  Seller?: string;
  Observations?: string;
  IdPosOrderServer: number;
  Products?: Product[];
  User?: User;
}

export interface Optional {
  IdProductGrill: number;
  Description: string;
  SalePrice: number;
  IdProduct: number;
  IdProductGrillServer: number;
  Quantity?: number;
}

export interface Additional {
  IdAdditional: number;
  Description: string;
  SalePrice: number;
  IdAdditionalServer: number;
  Quantity?: number;
}

export interface OrderGroup {
  id: number;
  children: OrderGroup[] | null;
}
