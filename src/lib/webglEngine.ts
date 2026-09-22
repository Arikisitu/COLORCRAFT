import { GradeState } from '../types';
import { VERTEX_SHADER, FRAGMENT_SHADER } from '../shaders/grading.glsl';

export interface WebGLEngine {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  texture: WebGLTexture | null;
  canvas: HTMLCanvasElement;
  destroy: () => void;
  updateTexture: (source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) => void;
  render: (grade: GradeState) => void;
}

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Cannot create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info}`);
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error('Cannot create program');
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${info}`);
  }
  return program;
}

export function initWebGLEngine(canvas: HTMLCanvasElement): WebGLEngine | null {
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, antialias: false });
  if (!gl) return null;

  let program: WebGLProgram;
  try {
    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    program = createProgram(gl, vs, fs);
  } catch (e) {
    console.error('WebGL shader init failed:', e);
    return null;
  }

  // Quad geometry
  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1,  -1, 1,
    -1,  1,  1, -1,   1, 1,
  ]), gl.STATIC_DRAW);

  const texBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 1,  1, 1,  0, 0,
    0, 0,  1, 1,  1, 0,
  ]), gl.STATIC_DRAW);

  gl.useProgram(program);

  const posLoc = gl.getAttribLocation(program, 'a_position');
  const texCoordLoc = gl.getAttribLocation(program, 'a_texCoord');

  let texture: WebGLTexture | null = null;

  const updateTexture = (source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) => {
    if (!texture) {
      texture = gl.createTexture();
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  };

  const render = (grade: GradeState) => {
    if (!texture) return;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // Bind position
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Bind texCoord
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

    // Bind texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);

    // Set uniforms
    const setF = (name: string, val: number) => {
      const loc = gl.getUniformLocation(program, name);
      if (loc) gl.uniform1f(loc, val);
    };
    const setV3 = (name: string, r: number, g: number, b: number) => {
      const loc = gl.getUniformLocation(program, name);
      if (loc) gl.uniform3f(loc, r, g, b);
    };

    setF('u_exposure', grade.exposure);
    setF('u_contrast', grade.contrast);
    setF('u_pivot', grade.pivot);
    setF('u_temperature', grade.temperature);
    setF('u_tint', grade.tint);
    setF('u_saturation', grade.saturation);
    setF('u_vibrance', grade.vibrance);
    setF('u_hue', grade.hue);
    setF('u_highlights', grade.highlights);
    setF('u_shadows', grade.shadows);
    setF('u_whites', grade.whites);
    setF('u_blacks', grade.blacks);
    setF('u_colorBoost', grade.colorBoost);
    setF('u_midtoneDetail', grade.midtoneDetail);

    setV3('u_lift', grade.liftRGB.r, grade.liftRGB.g, grade.liftRGB.b);
    setV3('u_gamma', grade.gammaRGB.r, grade.gammaRGB.g, grade.gammaRGB.b);
    setV3('u_gain', grade.gainRGB.r, grade.gainRGB.g, grade.gainRGB.b);
    setV3('u_offset', grade.offsetRGB.r, grade.offsetRGB.g, grade.offsetRGB.b);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  const destroy = () => {
    if (texture) gl.deleteTexture(texture);
    gl.deleteProgram(program);
  };

  return { gl, program, texture, canvas, destroy, updateTexture, render };
}

// Extract pixel data for scope calculations
export function extractPixelData(gl: WebGLRenderingContext, width: number, height: number): Uint8Array {
  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return pixels;
}
