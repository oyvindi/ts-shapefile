export declare enum CoordType {
    NULL = 0,
    XY = 2,
    XYM = 3,
    XYZM = 4
}
export interface Coordinate {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly m: number;
    readonly hasZ: boolean;
    readonly hasM: boolean;
    toJson(): any;
    toGeoJson(): any;
}
declare abstract class CoordinateBase implements Coordinate {
    abstract x: number;
    abstract y: number;
    abstract z: number;
    abstract m: number;
    abstract hasZ: boolean;
    abstract hasM: boolean;
    toJson(): any;
    toGeoJson(): any;
}
export declare class CoordXY extends CoordinateBase {
    readonly x: number;
    readonly y: number;
    get z(): number;
    get m(): number;
    readonly hasZ: boolean;
    readonly hasM: boolean;
    constructor(x: number, y: number);
}
export declare class CoordXYM extends CoordinateBase {
    readonly x: number;
    readonly y: number;
    readonly m: number;
    get z(): number;
    readonly hasZ: boolean;
    readonly hasM: boolean;
    constructor(x: number, y: number, m: number);
}
export declare class CoordXYZM extends CoordinateBase {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly m: number;
    readonly hasZ: boolean;
    readonly hasM: boolean;
    constructor(x: number, y: number, z: number, m: number);
}
export {};
