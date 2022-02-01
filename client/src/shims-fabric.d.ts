import { Object, BaseBrush } from "fabric/fabric-impl";

export enum ShapesWithID {
  object = 'objectWithID',
  line = 'lineWithID',
  circle = 'circleWithID',
  rect = 'rectWithID',
  path = 'pathWithID',
  pencilBrush = 'pencilBrushWithID',
  image = 'imageWithID',
  text = 'textWithID',
}

declare global {
  namespace fabric {
    export interface IObjectWithIDOptions extends IObjectOptions {
      id?: string;
    }

    export interface ObjectWithID extends IObservable<Object>, IObjectWithIDOptions, IObjectAnimation<Object> {}
    export class ObjectWithID extends Object{}

    // Rectangle With ID Types
    export interface IRectWithIDOptions extends IRectOptions, IObjectWithIDOptions { }

    export interface RectWithID extends IRectWithIDOptions { }

    export class RectWithID extends Rect {
      constructor(options?: IRectWithIDOptions);

      static ATTRIBUTE_NAMES: string[];

      static fromElement(element: SVGElement, options?: IRectWithIDOptions): RectWithID;

      static fromObject(object: any, callback: any): RectWithID;
    }


    // Line with ID Types
    export interface ILineWithIDOptions extends ILineOptions, IObjectWithIDOptions { }

    export interface LineWithID extends Object, ILineWithIDOptions { }

    export class LineWithID extends Line {
      /**
       * Constructor
       * @param [points] Array of points
       * @param [options] Options object
       */
      constructor(points?: number[], objObjects?: ILineWithIDOptions);

      /**
       * Returns fabric.LineWithID instance from an SVG element
       * @static
       * @memberOf fabric.Line
       * @param {SVGElement} element Element to parse
       * @param {Object} [options] Options object
       * @param {Function} [callback] callback function invoked after parsing
       */
      static fromElement(element: SVGElement, callback?: Function, options?: ILineWithIDOptions): LineWithID;

      /**
       * Returns fabric.LineWithID instance from an object representation
       * @param object Object to create an instance from
       */
      static fromObject(object: any, callback: any): LineWithID;
    }


    // Circle with ID Types
    export interface ICircleWithIDOptions extends ICircleOptions, IObjectWithIDOptions { }

    export interface CircleWithID extends ICircleWithIDOptions { }

    export class CircleWithID extends Circle {
      constructor(options?: ICircleWithIDOptions);

      static fromElement(element: SVGElement, options?: ICircleWithIDOptions): CircleWithID;

      static fromObject(object: any, callback: any): CircleWithID;
    }


    // Path with ID types
    export interface IPathWithIDOptions extends IPathOptions, IObjectWithIDOptions { }

    export interface PathWithID extends Object, IPathWithIDOptions { }

    export class PathWithID {
      /**
       * Constructor
       * @param path Path data (sequence of coordinates and corresponding "command" tokens)
       * @param [options] Options object
       */
      constructor(path?: string | Point[], options?: IPathWithIDOptions);

      /**
       * Creates an instance of fabric.Path from an SVG <path> element
       * @param element to parse
       * @param callback Callback to invoke when an fabric.Path instance is created
       * @param [options] Options object
       */
      static fromElement(element: SVGElement, callback: Function, options?: IPathWithIDOptions): PathWithID;
      /**
       * Creates an instance of fabric.Path from an object
       * @param callback Callback to invoke when an fabric.Path instance is created
       */

      static fromObject(object: any, callback: Function): PathWithID;
      /**
       * List of attribute names to account for when parsing SVG element (used by `fabric.Polygon.fromElement`)
       */
    }

    //Text with ID
    export interface ITextWithIDOptions extends ITextOptions, IObjectWithIDOptions { }
    export interface ITextWithID extends Object, ITextWithIDOptions { }
    export class ITextWithID extends IText {

      constructor(text: string, options?: ITextWithIDOptions);
      static fromObject(object: any, callback?: Function): ITextWithID;
      selectAll(): ITextWithID;
      selectLine(selectionStart: number): ITextWithID;
    /**
     * Enters editing state
     * @return {fabric.IText} thisArg
     * @chainable
     */
      enterEditing(e?: MouseEvent): ITextWithID;
      exitEditing(): ITextWithID;
    }


    // Image with ID
    export interface IImageWithIDOptions extends IImageOptions, IObjectWithIDOptions { }
    export interface ImageWithID extends Object, IImageWithIDOptions { }
    // Image with ID
    export interface IImageWithIDOptions extends IImageOptions, IObjectWithIDOptions {
      src?: string
    }
    export interface ImageWithID extends Image, IImageWithIDOptions { }
    export class ImageWithID extends Image {

    constructor(element: string | HTMLImageElement | HTMLVideoElement, options?: IImageWithIDOptions);

    setElement(element: HTMLImageElement | HTMLVideoElement, options?: IImageWithIDOptions): ImageWithID;

    setSrc(src: string, callback?: Function, options?: IImageWithIDOptions): ImageWithID;

    applyFilters(filters?: IBaseFilter[]): ImageWithID;

    static fromURL(url: string, callback?: (image: fabric.ImageWithID) => void, imgOptions?: IImageWithIDOptions): void;

    static fromElement(element: SVGElement, callback: Function, options?: IImageWithIDOptions): ImageWithID;

    static fromObject(object: any, callback: any): ImageWithID;
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
      createPath(pathData: string): PathWithID;
    }
  }
}
