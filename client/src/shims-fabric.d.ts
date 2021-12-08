import { Object } from "fabric/fabric-impl";

declare module 'fabric' {
  export interface IObjectWithIDOptions {
    id?: string;
  }

  export interface IRectWithIDOptions extends IObjectWithIDOptions {}

  export interface RectWithID extends IRectWithIDOptions {}
  export class RectWithID extends Object {
    constructor(options?: IRectWithIDOptions);

    static ATTRIBUTE_NAMES: string[];

    static fromElement(element: SVGElement, options?: IRectWithIDOptions): RectWithID;

    static fromObject(object: any): RectWithID;
  }
}
