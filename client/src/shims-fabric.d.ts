import { Object, BaseBrush } from "fabric/fabric-impl";

declare global {
  namespace fabric {
    export interface IObjectWithIDOptions extends IObjectOptions {
      id?: string;
    }

    // Rectangle With ID Types
    export interface IRectWithIDOptions extends IObjectWithIDOptions { }

    export interface RectWithID extends IRectWithIDOptions { }
    export class RectWithID extends Object {
      constructor(options?: IRectWithIDOptions);

      static ATTRIBUTE_NAMES: string[];

      static fromElement(element: SVGElement, options?: IRectWithIDOptions): RectWithID;

      static fromObject(object: any, callback: any): RectWithID;
    }


    // Line with ID Types
    export interface ILineWithIDOptions extends IObjectWithIDOptions {
      points?: number[]
      id?: string
    }

    export interface LineWithID extends Object, ILineWithIDOptions { }
    export class LineWithID extends Object {
      /**
       * Constructor
       * @param [points] Array of points
       * @param [options] Options object
       */
      constructor(points?: number[], objObjects?: ILineWithIDOptions);

      /**
       * Returns svg representation of an instance
       * @return {Array} an array of strings with the specific svg representation
       * of the instance
       */
      _toSVG(): string;

      /**
       * Returns fabric.Line instance from an SVG element
       * @static
       * @memberOf fabric.Line
       * @param {SVGElement} element Element to parse
       * @param {Object} [options] Options object
       * @param {Function} [callback] callback function invoked after parsing
       */
      static fromElement(element: SVGElement, callback?: Function, options?: ILineWithIDOptions): LineWithID;

      /**
       * Returns fabric.Line instance from an object representation
       * @param object Object to create an instance from
       */
      static fromObject(object: any, callback: any): LineWithID;
      static ATTRIBUTE_NAMES: string[];

      /**
       * Produces a function that calculates distance from canvas edge to Line origin.
       */
      makeEdgeToOriginGetter(
        propertyNames: { origin: number; axis1: any; axis2: any; dimension: any },
        originValues: { nearest: any; center: any; farthest: any },
      ): Function;

      /**
       * Recalculates line points given width and height
       * @private
       */
      calcLinePoints(): { x1: number; x2: number; y1: number; y2: number };
    }


    // Circle with ID Types
    export interface ICircleWithIDOptions extends IObjectWithIDOptions { }

    export interface CircleWithID extends ICircleWithIDOptions { }
    export class CircleWithID extends Object {
      constructor(options?: ICircleWithIDOptions);

      static ATTRIBUTE_NAMES: string[];

      static fromElement(element: SVGElement, options?: ICircleWithIDOptions): CircleWithID;

      static fromObject(object: any, callback: any): CircleWithID;
    }


    // PencilBrush with ID Types
    export class PencilBrushWithID extends BaseBrush {
      /**
       * Constructor
       * @param {Canvas} canvas
       * @param {string} id
       */
      constructor(canvas: Canvas, id?: string): PencilBrushWithID;

      /**
       * Constructor
       * @param {Canvas} canvas
       * @return {PencilBrushWithID} Instance of a pencil brush with id
       */
      initialize(canvas: Canvas): PencilBrushWithID;

      /**
       * Converts points to SVG path
       * @param points Array of points
       */
      convertPointsToSVGPath(points: Array<{ x: number; y: number }>, minX?: number, minY?: number): string[];

      /**
       * Creates fabric.Path object to add on canvas
       * @param pathData Path data
       */
      createPath(pathData: string): Path;
    }
  }
}
