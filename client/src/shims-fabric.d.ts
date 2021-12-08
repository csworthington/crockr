import { Object } from "fabric/fabric-impl";

declare global {
  namespace fabric {
    export interface IObjectWithIDOptions extends IObjectOptions {
      id?: string;
    }

    export interface IRectWithIDOptions extends IObjectOptions {
      id?: string;
    }

    export interface RectWithID extends IRectWithIDOptions {}
    export class RectWithID extends Object {
      constructor(options?: IRectWithIDOptions);

      static ATTRIBUTE_NAMES: string[];

      static fromElement(element: SVGElement, options?: IRectWithIDOptions): RectWithID;

      static fromObject(object: any, callback: any): RectWithID;
    }
  }
}
