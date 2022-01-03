/* eslint-disable no-shadow */
import { fabric } from 'fabric';
import getUUID from './id-generator';

export type IObjectOptionsWithID = fabric.IObjectOptions & {
  id?: string;
}

// export interface IRectWithIDOptions extends fabric.IRectOptions {
//   id: string;
// }

export type ILineOptionsWithID = IObjectOptionsWithID & fabric.ILineOptions;
export type IRectOptionsWithID = IObjectOptionsWithID & fabric.IRectOptions;
export type ICircleOptionsWithID = IObjectOptionsWithID & fabric.ICircleOptions;

export enum ShapesWithID {
  object = 'objectWithID',
  line = 'lineWithID',
  circle = 'circleWithID',
  rect = 'rectWithID',
  pencilBrush = 'pencilBrushWithID'
}

/**
 * Create a subclass for a fabric object with a pregenerated UUID
 */
export const ObjectWithID = fabric.util.createClass(fabric.Object, {
  type: ShapesWithID.object,
  initialize(options: IObjectOptionsWithID) {
    this.callSuper('initialize', options);
    // Set ID after calling superclass. If ID parameter is not given in IObjectOptions,
    // generate one at random.
    this.set('id', options.id || getUUID());
  },
  toObject() {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      id: this.get('id'),
    });
  },
  toString() {
    return `${this.callSuper('toString')} (id: ${this.id})`;
  },
});

/**
 * Create a subclass for a fabric Line with a pregenerated UUID
 */
export const LineWithID = fabric.util.createClass(fabric.Line, {
  type: ShapesWithID.line,
  initialize(points: number[], options: ILineOptionsWithID) {
    this.callSuper('initialize', points, options);
    // Set ID after calling superclass. If ID parameter is not given in IObjectOptions,
    // generate one at random.
    this.set('id', options.id || getUUID());
  },
  toObject() {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      id: this.get('id'),
    });
  },
  toString() {
    return `${this.callSuper('toString')} (id: ${this.id})`;
  },
});

/**
 * Create a subclass for a fabric Circle with a pregenerated UUID
 */
export const CircleWithID = fabric.util.createClass(fabric.Circle, {
  type: ShapesWithID.circle,
  initialize(options: ICircleOptionsWithID) {
    this.callSuper('initialize', options);
    // Set ID after calling superclass. If ID parameter is not given in IObjectOptions,
    // generate one at random.
    this.set('id', options.id || getUUID());
  },
  toObject() {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      id: this.get('id'),
    });
  },
  toString() {
    return `${this.callSuper('toString')} (id: ${this.id})`;
  },
});

/**
 * Create a subclass for a fabric Rectangle with a pregenerated UUID
 */

/**
 * Create a subclass for a fabric Rectangle with a pregenerated UUID
 */
export const PencilBrushWithID = fabric.util.createClass(fabric.PencilBrush, {
  type: ShapesWithID.pencilBrush,
  initialize(canvas: fabric.Canvas, id?: string) {
    this.callSuper('initialize', canvas);
    // Set ID after calling superclass. If ID parameter is not given in IObjectOptions,
    // generate one at random.
    this.set('id', id || getUUID());
  },
  toObject() {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      id: this.get('id'),
    });
  },
  toString() {
    return `${this.callSuper('toString')} (id: ${this.id})`;
  },
});
