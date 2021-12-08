import { fabric } from 'fabric';

export type IRectOptionsWithID = IObjectOptionsWithID & fabric.IRectOptions;

declare class RectWithID extends fabric.Rect { }
