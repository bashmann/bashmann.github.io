
float logoHeight = 0.413; // @param
float logoWidth = 0.283; // @param
float lineWeight = 0.035; // @param
float gapSize = 0.018; // @param

#include "SDF2D"

float2 fitToCanvas(float2 uv){
    if(iResolution == iResolution) {return uv;}
    if(iResolution.x > iResolution.y){
        return float2(uv.x * iResolution.x / iResolution.y, uv.y);
    }
    return  float2(uv.x, uv.y * iResolution.y / iResolution.x);
}


float4 mainPS(float2 uv) {
    float2 domain = uv - 0.5;
    domain = fitToCanvas(domain);
    domain.y *= iResolution.y / iResolution.x;
    float2 domainA = float2(domain.x, abs(domain.y) - logoHeight);
    float shape = sdBox(domainA, float2(logoWidth,lineWeight));
    float diagOff = (gapSize / 2.0) + lineWeight;
    float rotA = atan2(logoHeight, -logoWidth);
    float2 diagDomain = opRotate(float2(domain.x,abs(domain.y)), rotA) + float2(0.5, 0.0);
    diagDomain = float2(diagDomain.x, abs(diagDomain.y - diagOff) - diagOff);
    float2 logoExtents = float2(logoHeight, logoWidth) + lineWeight;
    float diagonalLines = sdBox(diagDomain - float2(0.5,0.0), float2( ( ( logoHeight + lineWeight ) - lineWeight * cos(rotA) ) / sin(rotA) , lineWeight));
    shape = opUnion(shape, diagonalLines);
    float boundsBox = abs(domain.y) - logoExtents.x;
    shape = opIntersection(boundsBox, shape);
    return float4(smoothstep(0.001, 0.0, shape));
}

// right click any variable and select "preview variable" to visualize that variable at that point in the code
// right click any variable and select "parameterize" to expose the parameter at the bottom of the page, these variables automatically get type assigned
// includes are supported between any files found on the right
// download and load available at the bottom right