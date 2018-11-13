export class Sliders {
  H: number;
  S: number;
  V: number;

  constructor() {
    this.H = 0.5;
    this.S = 1;
    this.V = 1;
  }
}

export class Socket {
  value?: number;
  message?: string;
}

const hsl = (slider: Sliders): string => {
  return `hsl(${slider.H}, ${100 * slider.S}%, ${50 * slider.V }%)`;
}

const hexa = (slider: Sliders): string => {
  return `#${percent2hex(slider.H)}${percent2hex(slider.S)}${percent2hex(slider.V)}`;
}

const percent2hex = (number: number): string => {
  return int2hex(Math.round(number * 255));
}

const int2hex = (number: number): string => {
  let s = number.toString(16);
  if (s.length === 1) {
    s = `0${s}`;
  }
  return s;
}
export { hsl, hexa };



