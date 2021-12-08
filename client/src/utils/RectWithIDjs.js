// import { fabric } from 'fabric';
// import getUUID from './id-generator';
// import { ShapesWithID } from './fabric-object-extender';

// // eslint-disable-next-line import/prefer-default-export
// export const RectWithID = fabric.util.createClass(fabric.Rect, {
//   type: ShapesWithID.rect,
//   initialize(options) {
//     this.callSuper('initialize', options);
//     // Set ID after calling superclass. If ID parameter is not given in IObjectOptions,
//     // generate one at random.
//     this.set('id', options.id || getUUID());
//   },
//   toObject() {
//     return fabric.util.object.extend(this.callSuper('toObject'), {
//       id: this.get('id'),
//     });
//   },
//   toString() {
//     return `${this.callSuper('toString')} (id: ${this.id})`;
//   },
// });

// // eslint-disable-next-line @typescript-eslint/ban-types
// RectWithID.fromObject = function (object, callback) {
//   // eslint-disable-next-line no-underscore-dangle
//   return fabric.Object._fromObject(ShapesWithID.rect, object, callback, 'id');
// };

// fabric.RectWithID = RectWithID;
