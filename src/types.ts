export type Line = {
  name: string;
  color: string;
  stations: Station[];
  sections: Segment[];
};

export type Station = {
  name: string;
  x: number;
  y: number;
};

export type Section = Segment & { color: string };

export type Point = { x: number; y: number };

export type Segment = { begin: Point; end: Point };

// vim: set ts=2 sw=2 et:
