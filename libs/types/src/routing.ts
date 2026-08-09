import type { Product, ProductDto } from "./products";

export interface Point {
  x: number;
  y: number;
}

export interface RoutePoint extends Point {
  id?: string;
}

export interface RouteSegment {
  start: RoutePoint;
  path: Point[];
  end: RoutePoint;
}

export interface PathfindResult {
  distance: number;
  sorted: (Product | null)[];
  pathfind: RouteSegment[];
}

export interface PathfindDto {
  distance: number;
  sorted: (ProductDto | null)[];
  pathfind: RouteSegment[];
}
