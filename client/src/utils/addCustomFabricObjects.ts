import { fabric } from 'fabric';
import { ShapesWithID } from './fabric-object-extender';
import getUUID from './id-generator';

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
    return fabric.Object._fromObject('CircleWithID', object, callback);
  };
}

function createPencilBrushWithID(): void {
  fabric.PencilBrushWithID = fabric.util.createClass(fabric.PencilBrush, {
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

  // fabric.PencilBrushWithID.fromObject = function (object: any, callback: any) {
  // // eslint-disable-next-line no-underscore-dangle
  //   return fabric.Object._fromObject('PencilBrushWithID', object, callback);
  // };
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
