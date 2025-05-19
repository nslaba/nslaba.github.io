precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
    
in vec2 v_uv; 
out vec4 outColor;
    
#define SMOOTH_STEP(a,b,t) smoothstep(a,b,t)
#define ROTATION_ANGLE -0.785398
#define SCALE .25
#define SHOOTING_STAR_VELOCITY 2.

// Signed Distance Function for the Mandelbulb
float mandelbulbSDF(vec3 p) {
    const int maxIterations = 4;
    const float power = 9.0;
    vec3 z = p;
    float dr = 1.0;  // Derivative for distance estimation
    float r = 0.0;

    for (int i = 0; i < maxIterations; i++) {
        r = length(z);
        if (r > 3.0) break;

        // Convert to spherical coordinates
        float theta = acos(z.z / r);
        float phi = atan(z.y, z.x);
        dr = pow(r, power - 1.0) * power * dr + 1.0;

        // Scale and rotate
        float zr = pow(r, power);
        theta *= power;
        phi *= power;

        // Convert back to Cartesian coordinates
        z = zr * vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta)) + p;
    }

    // Return the signed distance
    return 0.5 * log(r) * r / dr;
}

// Normal calculation using finite differences
vec3 calculateNormal(vec3 p, float epsilon) {
    vec2 e = vec2(epsilon, 0.0);
    return normalize(vec3(
        mandelbulbSDF(p + e.xyy) - mandelbulbSDF(p - e.xyy), // x-derivative
        mandelbulbSDF(p + e.yxy) - mandelbulbSDF(p - e.yxy), // y-derivative
        mandelbulbSDF(p + e.yyx) - mandelbulbSDF(p - e.yyx)  // z-derivative
    ));
}


void main() {
    // programmer side
            if (v_uv.x < 0.5) {
                float i, d, z = 0.0;
                outColor *= i;

                for (i = 0.0; i < 90.0; i++) {
                    vec3 dir = normalize(vec3(v_uv * 2.0 - 1.0, -1.0));
                    vec3 p = vec3(0.0, 0.0, 2.5) + z * dir;
                
                    // Grid spacing and snapping
                    vec2 gridSize = vec2(0.3);
                    vec2 snapped = mod(p.xy + 0.5 * gridSize, gridSize) - 0.5 * gridSize;
                
                    // Determine the actual grid cell center (discrete coords)
                    vec2 cell = floor((p.xy + 0.5 * gridSize) / gridSize) * gridSize;
                
                    // Use mouse.x to set visibility threshold (left to right)
                    // u_mouse.x from 0.5 (center) → 0.0 (full left)
                    float visibleRightEdge = mix(-1.0, 1.0, 2.0 * u_mouse.x);
                
                    // Only render if the cell is to the left of threshold
                    if (cell.x > visibleRightEdge) {
                        z += 0.2; // fast skip
                        continue;
                    }
                
                    // Square SDF
                    vec2 boxSize = vec2(0.1);
                    vec2 q = abs(snapped) - boxSize;
                    float boxDist = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
                
                    d = boxDist;
                
                    if (d < 0.005) {
                        vec3 col = vec3(0.2, 0.6, 1.0);
                        outColor += vec4(col, 1.0);
                        break;
                    }
                
                    z += d;
                    if (z > 8.0) break;
            }
            }

             vec2 p = v_uv;
                vec3 col = vec3(0.0);

                vec2 origin = vec2(0.5, 0.5); // Start in center

                float angleSpread = 0.4; // radians between branches
                float initialLength = 0.15;
                int maxDepth = int(mix(1.0, 9.0, 1.0 - u_mouse.x * 2.0)); // more branches to the right

                // Stack-like manual recursion
                const int MAX = 64;
                vec2 starts[MAX];
                vec2 dirs[MAX];
                float lens[MAX];

                int count = 0;
                starts[count] = origin;
                dirs[count] = vec2(-1.0, 0.0); // Initial direction: to the left
                lens[count] = initialLength;
                count++;

                for (int i = 0; i < MAX; i++) {
                    if (i >= count || i >= maxDepth) break;
                
                    vec2 a = starts[i];
                    vec2 dir = dirs[i];
                    float len = lens[i];
                    vec2 b = a + dir * len;
                
                    float dist = sdSegment(p, a, b);
                    if (dist < 0.001) col = vec3(1.0); // White lines
                
                    // Add two new branches
                    if (count + 2 < MAX) {
                        float ang = angleSpread;
                        vec2 left = vec2(cos(ang), sin(ang));
                        vec2 right = vec2(cos(ang), sin(ang));
                    
                        starts[count] = b;
                        dirs[count] = mat2(0, -1, 1, 0) * dir * mat2(cos(ang), -sin(ang), sin(ang), cos(ang)); // rotate left
                        lens[count] = len * 0.7;
                        count++;
                    
                        starts[count] = b;
                        dirs[count] = mat2(0, -1, 1, 0) * dir * mat2(cos(-ang), -sin(-ang), sin(-ang), cos(-ang)); // rotate right
                        lens[count] = len * 0.7;
                        count++;
                    }
                }
            
                outColor = vec4(col, 1.0);

    // vec4 outColor = vec4(0.0);
    // //Raymarch iterator, step distance, depth and reflection
    // float i, d, z, r = 0.0;
    // //Clear fragcolor and raymarch 90 steps
    // for(outColor*= i; i++<9e1;
    // //Pick color and attenuate
    // outColor += (cos(z*.5+u_time+vec4(0,2,4,3))+1.3)/d/z)
    // {
    //     //Raymarch sample point
    //     vec3 p = z * normalize(vec3(v_uv+v_uv,0) - u_resolution.xyy);
    //     //Shift camera and get reflection coordinates
    //     r = max(-++p, 0.).y;
    //     //Mirror
    //     p.y += r+r;
    //     //Music test
    //     //-4.*texture(iChannel0, vec2(p.x,-10)/2e1+.5,2.).r
        
    //     //Sine waves
    //     for(d=1.; d<3e1; d+=d)
    //         p.y += cos(p*d+2.*u_time*cos(d)+z).x/d;
            
    //     //Step forward (reflections are softer)
    //     z += d = (.1*r+abs(p.y-1.)/ (1.+r+r+r*r) + max(d=p.z+3.,-d*.1))/8.;
    // }
    // //Tanh tonemapping
    // outColor = tanh(outColor/9e2);
    

    // outColor = outColor;

    // Normalize screen coordinates
    vec2 uv = v_uv.xy / u_resolution.xy * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    // Camera setup
    vec3 camPos = vec3(0.0, 0.0, 2.0);
    vec3 lookAt = vec3(0.0, 0.0, 0.0);
    vec3 forward = normalize(lookAt - camPos);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = cross(forward, right);
    vec3 rayDir = normalize(forward + uv.x * right + uv.y * up);

    // Ray marching parameters
    float totalDist = 0.0;
    const int maxSteps = 100;
    const float maxDist = 100.0;
    float surfaceEpsilon = 0.001;
    
    vec3 hitPos;
    bool hit = false;

    for (int i = 0; i < maxSteps; i++) {
        vec3 pos = camPos + totalDist * rayDir;
        float dist = mandelbulbSDF(pos);
        if (dist < surfaceEpsilon) {
            hit = true;
            hitPos = pos;
            break;
        }
        totalDist += dist;
        if (totalDist > maxDist) break;
    }

    // Basic background color
    vec3 color = vec3(0.0);

    if (hit) {
        // Compute the normal at the hit position
        vec3 normal = calculateNormal(hitPos, surfaceEpsilon);

        // Simple lighting: directional light
        vec3 lightDir = normalize(vec3(cos(iTime), cos(iTime), sin(iTime)));
        float diffuse = max(dot(normal, lightDir), 0.0);

        // Shading with a gradient
        color = mix(vec3(0.1, 0.1, 0.4), vec3(0.9, 0.8, 1.0), diffuse);
    }

    outColor = vec4(color, 1.0);
}