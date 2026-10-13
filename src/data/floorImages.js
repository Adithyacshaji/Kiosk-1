import { LOCKED_INDOOR_BOUNDS_RAW } from "../shared/utils/indoorGrid";

// This calibration box is deliberately independent of PNG dimensions. Keep
// node coordinates stable when an image asset is upgraded or replaced.
export const ST_MARYS_BOUNDS = LOCKED_INDOOR_BOUNDS_RAW;

export const CHAVARA_BOUNDS = [[10.355871, 76.212315], [10.356011, 76.212513]];

export const FLOOR_IMAGES = {
  B2: { url: "/floors/b2.png", bounds: ST_MARYS_BOUNDS },
  B1: { url: "/floors/b1.png", bounds: ST_MARYS_BOUNDS },
  G: { url: "/floors/g.png", bounds: ST_MARYS_BOUNDS },
  1: { url: "/floors/f1.png", bounds: ST_MARYS_BOUNDS },
  2: { url: "/floors/f2.png", bounds: ST_MARYS_BOUNDS },
};
export const CHAVARA_FLOOR_IMAGES = {
  G: {
    url: "/floors/chavara/g.png",
    bounds: CHAVARA_BOUNDS
  },

  1: {
    url: "/floors/chavara/1.png",
    bounds: CHAVARA_BOUNDS
  },

  2: {
    url: "/floors/chavara/2.png",
    bounds: CHAVARA_BOUNDS
  },

  3: {
    url: "/floors/chavara/3.png",
    bounds: CHAVARA_BOUNDS
  },

  4: {
    url: "/floors/chavara/4.png",
    bounds: CHAVARA_BOUNDS
  },

  5: {
    url: "/floors/chavara/5.png",
    bounds: CHAVARA_BOUNDS
  },

  6: {
    url: "/floors/chavara/6.png",
    bounds: CHAVARA_BOUNDS
  },
};