export const VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

export const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;

  // Primary controls
  uniform float u_exposure;
  uniform float u_contrast;
  uniform float u_pivot;
  uniform float u_temperature;
  uniform float u_tint;
  uniform float u_saturation;
  uniform float u_hue;
  uniform float u_highlights;
  uniform float u_shadows;
  uniform float u_whites;
  uniform float u_blacks;
  uniform float u_vibrance;
  uniform float u_colorBoost;
  uniform float u_midtoneDetail;

  // Lift/Gamma/Gain per channel
  uniform vec3 u_lift;
  uniform vec3 u_gamma;
  uniform vec3 u_gain;
  uniform vec3 u_offset;

  // Helper: linear <-> sRGB
  float linearToSRGB(float c) {
    if (c <= 0.0031308) return 12.92 * c;
    return 1.055 * pow(c, 1.0/2.4) - 0.055;
  }
  float sRGBToLinear(float c) {
    if (c <= 0.04045) return c / 12.92;
    return pow((c + 0.055) / 1.055, 2.4);
  }
  vec3 linearToSRGBv(vec3 c) {
    return vec3(linearToSRGB(c.r), linearToSRGB(c.g), linearToSRGB(c.b));
  }
  vec3 sRGBToLinearv(vec3 c) {
    return vec3(sRGBToLinear(c.r), sRGBToLinear(c.g), sRGBToLinear(c.b));
  }

  // Luminance (Rec.709)
  float luma(vec3 c) {
    return dot(c, vec3(0.2126, 0.7152, 0.0722));
  }

  // RGB to HSL
  vec3 rgb2hsl(vec3 c) {
    float maxC = max(c.r, max(c.g, c.b));
    float minC = min(c.r, min(c.g, c.b));
    float l = (maxC + minC) / 2.0;
    if (maxC == minC) return vec3(0.0, 0.0, l);
    float d = maxC - minC;
    float s = l > 0.5 ? d / (2.0 - maxC - minC) : d / (maxC + minC);
    float h;
    if (maxC == c.r) h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
    else if (maxC == c.g) h = (c.b - c.r) / d + 2.0;
    else h = (c.r - c.g) / d + 4.0;
    h /= 6.0;
    return vec3(h, s, l);
  }

  float hue2rgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
    if (t < 1.0/2.0) return q;
    if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
    return p;
  }

  vec3 hsl2rgb(vec3 hsl) {
    float h = hsl.x, s = hsl.y, l = hsl.z;
    if (s == 0.0) return vec3(l);
    float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
    float p = 2.0 * l - q;
    return vec3(hue2rgb(p, q, h + 1.0/3.0), hue2rgb(p, q, h), hue2rgb(p, q, h - 1.0/3.0));
  }

  // Soft knee highlight/shadow
  float softKnee(float x, float threshold, float direction) {
    float t = smoothstep(threshold - 0.15, threshold + 0.15, x);
    return direction > 0.0 ? t : 1.0 - t;
  }

  void main() {
    vec2 uv = v_texCoord;
    vec4 texColor = texture2D(u_image, uv);
    vec3 color = texColor.rgb;

    // sRGB → linear
    color = sRGBToLinearv(color);
    color = clamp(color, 0.0, 1.0);

    // --- EXPOSURE ---
    color *= pow(2.0, u_exposure);

    // --- LIFT / GAMMA / GAIN / OFFSET ---
    // Lift: affects shadows
    color = color + u_lift * (1.0 - color);
    // Gamma: power function per channel
    vec3 safeColor = max(color, vec3(0.001));
    vec3 gammaExp = vec3(1.0) / (vec3(1.0) + u_gamma);
    color = pow(safeColor, gammaExp);
    // Gain: affects highlights
    color = color * (vec3(1.0) + u_gain);
    // Offset: global shift
    color = color + u_offset;

    // --- CONTRAST ---
    float pv = u_pivot;
    color = (color - pv) * (1.0 + u_contrast) + pv;

    // --- TEMPERATURE (blue-orange axis) ---
    float tempShift = u_temperature / 10000.0;
    color.r = color.r + tempShift;
    color.b = color.b - tempShift;

    // --- TINT (green-magenta axis) ---
    float tintShift = u_tint / 1000.0;
    color.g = color.g - tintShift;
    color.r = color.r + tintShift * 0.5;
    color.b = color.b + tintShift * 0.5;

    color = clamp(color, 0.0, 1.0);

    // --- HIGHLIGHTS ---
    float lum = luma(color);
    float hlMask = smoothstep(0.5, 0.9, lum);
    color += u_highlights * 0.5 * hlMask;

    // --- SHADOWS ---
    float shMask = 1.0 - smoothstep(0.1, 0.5, lum);
    color += u_shadows * 0.3 * shMask;

    // --- WHITES ---
    float wMask = smoothstep(0.75, 1.0, lum);
    color += u_whites * 0.3 * wMask;

    // --- BLACKS ---
    float bMask = 1.0 - smoothstep(0.0, 0.25, lum);
    color += u_blacks * 0.2 * bMask;

    color = clamp(color, 0.0, 1.0);

    // --- SATURATION ---
    float lumaVal = luma(color);
    vec3 achromatic = vec3(lumaVal);
    color = mix(achromatic, color, 1.0 + u_saturation);

    // --- VIBRANCE ---
    float sat = length(color - achromatic);
    float vibranceMask = 1.0 - smoothstep(0.0, 0.6, sat);
    color = mix(achromatic, color, 1.0 + u_vibrance * vibranceMask * 2.0);

    // --- COLOR BOOST ---
    vec3 hsl = rgb2hsl(color);
    hsl.y = clamp(hsl.y * (1.0 + u_colorBoost * 0.5), 0.0, 1.0);
    color = hsl2rgb(hsl);

    // --- HUE ROTATION ---
    hsl = rgb2hsl(color);
    hsl.x = fract(hsl.x + u_hue / 360.0);
    color = hsl2rgb(hsl);

    // --- MIDTONE DETAIL ---
    float midMask = 1.0 - abs(luma(color) - 0.5) * 2.0;
    vec2 texelSize = vec2(0.001);
    vec3 blurred = texture2D(u_image, uv + texelSize).rgb * 0.25
                 + texture2D(u_image, uv - texelSize).rgb * 0.25
                 + texture2D(u_image, uv + vec2(texelSize.x, -texelSize.y)).rgb * 0.25
                 + texture2D(u_image, uv + vec2(-texelSize.x, texelSize.y)).rgb * 0.25;
    blurred = sRGBToLinearv(blurred);
    vec3 detail = color - blurred;
    color = color + detail * u_midtoneDetail * midMask * 0.5;

    color = clamp(color, 0.0, 1.0);

    // linear → sRGB
    color = linearToSRGBv(color);
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, texColor.a);
  }
`;
