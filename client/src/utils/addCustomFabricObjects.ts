import { fabric } from 'fabric';
import getUUID from './id-generator';

export enum ShapesWithID {
  object = 'objectWithID',
  line = 'lineWithID',
  circle = 'circleWithID',
  rect = 'rectWithID',
  path = 'pathWithID',
  pencilBrush = 'pencilBrushWithID'
}

/**
 * Add the RectWithID class to the global fabric object
 */
function createRectWithID(): void {
  fabric.RectWithID = fabric.util.createClass(fabric.Rect, {
    type: ShapesWithID.rect,
    initialize(options: fabric.IRectWithIDOptions) {
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

  fabric.RectWithID.fromObject = function (object: any, callback: any) {
  // eslint-disable-next-line no-underscore-dangle
    return fabric.Object._fromObject('RectWithID', object, callback);
  // WHY DOES RECT WITH ID HAVE TO BE CAPS?
  };
}

/**
 * Add the RectWithID class to the global fabric object
 */
function createLineWithID(): void {
  fabric.LineWithID = fabric.util.createClass(fabric.Line, {
    type: ShapesWithID.line,
    initialize(points: number[], objOptions: fabric.ILineWithIDOptions) {
      this.callSuper('initialize', points, objOptions);
      // Set ID after calling superclass. If ID parameter is not given in IObjectOptions,
      // generate one at random.
      this.set('id', objOptions.id || getUUID());
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

  fabric.LineWithID.fromObject = function (object: fabric.LineWithID, callback: any) {
    /**
     * For fabric to correctly initialize a Line, the extra constructor parameter
     * "points" (number[]) must be created from the coordinate pair describing the
     * line and then added to the canvas.
     */
    const reformattedLine: any = {
      points: [object.x1, object.y1, object.x2, object.y2],
      ...object,
    };

    // eslint-disable-next-line no-underscore-dangle
    return <fabric.LineWithID>fabric.Object._fromObject(
      'LineWithID',
      reformattedLine,
      callback,
      'points',
    );
  };
}

/**
 * Add the CircleWithID class to the global fabric object
 */
function createCircleWithID(): void {
  fabric.CircleWithID = fabric.util.createClass(fabric.Circle, {
    type: ShapesWithID.circle,
    initialize(options: any) {
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

  fabric.CircleWithID.fromObject = function (object: any, callback: any) {
    // eslint-disable-next-line no-underscore-dangle
    return <fabric.CircleWithID>fabric.Object._fromObject('CircleWithID', object, callback);
  };
}

function createPencilBrushWithID(): void {
  fabric.PathWithID = fabric.util.createClass(fabric.Path, {
    type: ShapesWithID.path,
    initialize(path: string | fabric.Point[], options: fabric.IPathWithIDOptions) {
      this.callSuper('initialize', path, options);

      // To prevent paths being filled with a black background by default, set fill to null
      // unless otherwise specified
      if (!options.fill) {
        this.set('fill', null);
      }

      /**
       * Set path ID after calling superclass. If ID parameter is not given in IPathWithIDOptions,
       * generate one at random
       */
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

  fabric.PathWithID.fromObject = function (object: fabric.PathWithID, callback: any) {
    // eslint-disable-next-line no-underscore-dangle
    return <fabric.PathWithID>fabric.Object._fromObject('PathWithID', object, callback, 'path');
  };

  fabric.PencilBrushWithID = fabric.util.createClass(fabric.PencilBrush, {
    type: ShapesWithID.pencilBrush,
    initialize(canvas: fabric.Canvas) {
      this.callSuper('initialize', canvas);
    },
    /**
     * Create a fabric.PathWithID object to add to the canvas
     * @param pathData Path data from brush used to create the path
     * @returns {fabric.PathWithID} The path to be added to the canvas
     */
    createPath(pathData: string | fabric.Point[]): fabric.PathWithID {
      const path = new fabric.PathWithID(pathData, {
        fill: undefined,
        stroke: this.color,
        strokeWidth: this.width,
        strokeLineCap: this.strokeLineCap,
        strokeMiterLimit: this.strokeMiterLimit,
        strokeLineJoin: this.strokeLineJoin,
        strokeDashArray: this.strokeDashArray,
      });

      if (this.shadow) {
        this.shadow.affectStroke = true;
        path.shadow = new fabric.Shadow(this.shadow);
      }

      return path;
    },
  });
}

/**
 * Add all of the custom fabric objects to the global fabric object
 */
export default function addCustomFabricObjects(): void {
  createRectWithID();
  createLineWithID();
  createCircleWithID();
  createPencilBrushWithID();
}
