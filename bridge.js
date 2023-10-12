// bridge.js : Multiple gravitational lens ray tracing simulation
//
// Copyright (c) 2023 Viktor T. Toth
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
// This version dated 2023/10/09.

var canvas;
var context;
var R = 500;
var model = 1;
var R1 = 0;
var R2 = 0;
var R3 = 0;
var R4 = 0;
var G1 = 20;
var G2 = 20;
var G3 = 20;
var G4 = 20;
var Z0 = 10000;
var I0 = 2000;
var Z1 = 2000;
var Z2 = 10000;
var Z3 = 10000;
var Z4 = 10000;
var I1 = 10000;
var I2 = 2000;
var I3 = 2000;
var I4 = 2000;
var DX0 = 0;
var DY0 = 0;
var DX1 = 0;
var DY1 = 0;
var DX2 = 0;
var DY2 = 0;
var DX3 = 0;
var DY3 = 0;
var DX4 = 0;
var DY4 = 0;
var DXV = 0;
var DYV = 0;
var R0 = 500;
var doLum = 0;
var l0 = 0;
var L0 = 0;

function formatFloat(val, prec)
{
  if (val == 0) return '0';
  let power = Math.floor(Math.log10(Math.abs(val)));
  if (power > prec || power < -prec)
  {
    let expStr = val.toExponential(prec);
    let [coef, exp] = expStr.split('e');
    coef = coef.replace(/\.?0+$/, '');
    exp = exp.replace('+', '');
    return `${coef}e${exp}`;
  }
  else
  {
    let strVal = val.toFixed(prec);
    let parts = strVal.split('.');
    let intPart = parts[0];
    let fracPart = parts.length > 1 ? parts[1].replace(/0+$/, '') : '';
    return fracPart.length > 0 ? `${intPart}.${fracPart}` : intPart;
  }
}

function saveAll()
{
  let savedata = JSON.stringify(
  {
    model: model,
    R0: R0,
    R1: R1,
    R2: R2,
    R3: R3,
    R4: R4,
    G1: G1,
    G2: G2,
    G3: G3,
    G4: G4,
    Z0: Z0,
    I0: I0,
    Z1: Z1,
    Z2: Z2,
    Z3: Z3,
    Z4: Z4,
    I1: I1,
    I2: I2,
    I3: I3,
    I4: I4,
    DX0: DX0,
    DY0: DY0,
    DX1: DX1,
    DY1: DY1,
    DX2: DX2,
    DY2: DY2,
    DX3: DX3,
    DY3: DY3,
    DX4: DX4,
    DY4: DY4,
    DXV: DXV,
    DYV: DYV
  });

  let blob = new Blob([savedata], {type: "application/json"});
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download=document.title + ".json";
  a.click();
}

function saveCanvasAsImage()
{
  var canvas = document.querySelector('canvas');
  var image = canvas.toDataURL('image/png');
  var link = document.createElement('a');
  link.download = 'lenses.png';
  link.href = image;
  link.click();
}

function loadAll()
{
  let fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json, application/json";
  fileInput.addEventListener("change", () =>
  {
    let file = fileInput.files[0];
    fileName = file.name.replace(/.json$/,"");
    document.title = fileName;
    document.getElementById('theTitle').innerText = fileName;
    let reader = new FileReader();
    reader.addEventListener("load", () =>
    {
      let data = JSON.parse(reader.result);
      init = data.init;

      model = data.model;
      R0 = data.R0;
      R1 = data.R1;
      R2 = data.R2;
      R3 = data.R3;
      R4 = data.R4;
      G1 = data.G1;
      G2 = data.G2;
      G3 = data.G3;
      G4 = data.G4;
      Z0 = data.Z0;
      I0 = data.I0;
      Z1 = data.Z1;
      Z2 = data.Z2;
      Z3 = data.Z3;
      Z4 = data.Z4;
      I1 = data.I1;
      I2 = data.I2;
      I3 = data.I3;
      I4 = data.I4;
      DX0 = data.DX0;
      DY0 = data.DY0;
      DX1 = data.DX1;
      DY1 = data.DY1;
      DX2 = data.DX2;
      DY2 = data.DY2;
      DX3 = data.DX3;
      DY3 = data.DY3;
      DX4 = data.DX4;
      DY4 = data.DY4;
      if (data.hasOwnProperty('DXV'))
      {
        DXV = data.DXV;
        DYV = data.DYV;
      }

      document.getElementById('type').value = model;
      doUpdate();
      doChange();

      fileInput.remove();
    });
    reader.readAsText(file);
  });
  fileInput.click();
}

function doUpdate()
{
  document.getElementById('G1').value = formatFloat(G1,4);
  document.getElementById('G2').value = formatFloat(G2,4);
  document.getElementById('R1').value = formatFloat(R1,4);
  document.getElementById('R2').value = formatFloat(R2,4);
  document.getElementById('Z1').value = formatFloat(Z1,4);
  document.getElementById('Z2').value = formatFloat(Z2,4);
  document.getElementById('I1').value = formatFloat(I1,4);
  document.getElementById('I2').value = formatFloat(I2,4);
  document.getElementById('G3').value = formatFloat(G3,4);
  document.getElementById('G4').value = formatFloat(G4,4);
  document.getElementById('R3').value = formatFloat(R3,4);
  document.getElementById('R4').value = formatFloat(R4,4);
  document.getElementById('Z3').value = formatFloat(Z3,4);
  document.getElementById('Z4').value = formatFloat(Z4,4);
  document.getElementById('I3').value = formatFloat(I3,4);
  document.getElementById('I4').value = formatFloat(I4,4);
  document.getElementById('DX0').value = formatFloat(DX0,4);
  document.getElementById('DY0').value = formatFloat(DY0,4);
  document.getElementById('DX1').value = formatFloat(DX1,4);
  document.getElementById('DY1').value = formatFloat(DY1,4);
  document.getElementById('DX2').value = formatFloat(DX2,4);
  document.getElementById('DY2').value = formatFloat(DY2,4);
  document.getElementById('DX3').value = formatFloat(DX3,4);
  document.getElementById('DY3').value = formatFloat(DY3,4);
  document.getElementById('DX4').value = formatFloat(DX4,4);
  document.getElementById('DY4').value = formatFloat(DY4,4);
  document.getElementById('DXV').value = formatFloat(DXV,4);
  document.getElementById('DYV').value = formatFloat(DYV,4);
  document.getElementById('R0').value = formatFloat(R0,4);
  document.getElementById('I0').value = formatFloat(I0,4);
  document.getElementById('Z0').value = formatFloat(Z0,4);
}

function doChange()
{
  document.body.classList.add('waiting');
  var elems = document.getElementsByTagName('input');
  var len = elems.length;
  for (var i = 0; i < len; i++) elems[i].disabled = true;

  setTimeout(function ()
  {
    model = document.getElementById('type').value;
    G1 = 1*document.getElementById('G1').value;
    G2 = 1*document.getElementById('G2').value;
    R1 = 1*document.getElementById('R1').value;
    R2 = 1*document.getElementById('R2').value;
    Z0 = 1*document.getElementById('Z0').value;
    I0 = 1*document.getElementById('I0').value;
    Z1 = 1*document.getElementById('Z1').value;
    Z2 = 1*document.getElementById('Z2').value;
    I1 = 1*document.getElementById('I1').value;
    I2 = 1*document.getElementById('I2').value;
    G3 = 1*document.getElementById('G3').value;
    G4 = 1*document.getElementById('G4').value;
    R3 = 1*document.getElementById('R3').value;
    R4 = 1*document.getElementById('R4').value;
    Z3 = 1*document.getElementById('Z3').value;
    Z4 = 1*document.getElementById('Z4').value;
    I3 = 1*document.getElementById('I3').value;
    I4 = 1*document.getElementById('I4').value;
    DX0 = 1*document.getElementById('DX0').value;
    DY0 = 1*document.getElementById('DY0').value;
    DX1 = 1*document.getElementById('DX1').value;
    DY1 = 1*document.getElementById('DY1').value;
    DX2 = 1*document.getElementById('DX2').value;
    DY2 = 1*document.getElementById('DY2').value;
    DX3 = 1*document.getElementById('DX3').value;
    DY3 = 1*document.getElementById('DY3').value;
    DX4 = 1*document.getElementById('DX4').value;
    DY4 = 1*document.getElementById('DY4').value;
    DXV = 1*document.getElementById('DXV').value;
    DYV = 1*document.getElementById('DYV').value;
    R0 = 1*document.getElementById('R0').value;

    let l = drawImagePixelByPixel();

    if (model == 1) { L0 = l.L; l0 = l.l };
    document.getElementById('lum').innerText = (l.l / l0).toPrecision(4);
    document.getElementById('LUM').innerText = (l.L / L0).toPrecision(4);

    document.body.classList.remove('waiting');

    //for (var i = 0; i < len; i++) elems[i].disabled = false;
    document.getElementById('G1').disabled = !(model > 1);
    document.getElementById('R1').disabled = !(model > 1);
    document.getElementById('Z1').disabled = !(model > 1);
    document.getElementById('I1').disabled = !(model == 2);
    document.getElementById('G2').disabled = !(model > 2);
    document.getElementById('R2').disabled = !(model > 2);
    document.getElementById('Z2').disabled = !(model > 2);
    document.getElementById('G3').disabled = !(model > 3);
    document.getElementById('R3').disabled = !(model > 3);
    document.getElementById('Z3').disabled = !(model > 3);
    document.getElementById('G4').disabled = !(model > 4);
    document.getElementById('R4').disabled = !(model > 4);
    document.getElementById('Z4').disabled = !(model > 4);
    document.getElementById('I2').disabled = !(model == 3);
    document.getElementById('I3').disabled = !(model == 4);
    document.getElementById('I4').disabled = !(model == 5);
    document.getElementById('DX0').disabled = false;
    document.getElementById('DY0').disabled = false;
    document.getElementById('DX1').disabled = !(model >= 2);
    document.getElementById('DY1').disabled = !(model >= 2);
    document.getElementById('DX2').disabled = !(model >= 3);
    document.getElementById('DY2').disabled = !(model >= 3);
    document.getElementById('DX3').disabled = !(model >= 4);
    document.getElementById('DY3').disabled = !(model >= 4);
    document.getElementById('DX4').disabled = !(model >= 5);
    document.getElementById('DY4').disabled = !(model >= 5);
    document.getElementById('R0').disabled = false;
    document.getElementById('I0').disabled = false;
    document.getElementById('DXV').disabled = false;
    document.getElementById('DYV').disabled = false;
    document.getElementById('Z0').disabled = !(model < 2);
  }, 0);
}

function getObject(x, y)
{
  let r = Math.sqrt(x*x + y*y);
  let l = r < R0 ? Math.cos(r*Math.PI/2/R0) : 0;
  return l;
}

function getColorAtPixel(x, y)
{
  let l = 0;
  let L = 0;
  let theta1, theta2, theta3, theta4;
  let b1, b2, b3, b4;
  let x0, y0;
  let x1, x2, x3, x4;
  let y1, y2, y3, y4;
  let J = 1;

  x = (x-R)*(2*R)/canvas.width;
  y = (y-R)*(2*R)/canvas.height;

  switch (1*model)
  {
  case 1: // Unobstructed object
    x0 = x*Z0/I0;
    y0 = y*Z0/I0;

    l = getObject(x0 - DX0 + DXV, y0 - DY0 + DYV);
    J = (Z0/I0)**2;
    L = l*J;

    break;

  case 2: // Single lens

    // Location in lens plane
    x1 = x * I1/I0;
    y1 = y * I1/I0;

    // Impact parameter
    b1 = Math.sqrt((x1 - DX1 + DXV)**2 + (y1 - DY1 + DYV)**2);
    theta1 = 2*G1/b1;
    if (b1 > R1 && Math.abs(theta1) < Math.PI/4)
    {
      x0 = x1 + x*Z1/I0 - (x1-DX1 + DXV)/b1*Z1*Math.tan(theta1);
      y0 = y1 + y*Z1/I0 - (y1-DY1 + DYV)/b1*Z1*Math.tan(theta1);

      l = getObject(x0 - DX0 + DXV, y0 - DY0 + DYV);

      if (doLum > 0)
      {
/*
  -- Jacobian determinant generated using Maxima:

  x1:x*I1/I0;
  y1:y*I1/I0;
  b1:sqrt((x1-DX1+DXV)^2+(y1-DY1+DYV)^2);
  t1:2*G1/b1;
  x0:x1+x*Z1/I0-(x1-DX1+DXV)/b1*Z1*tan(t1);
  y0:y1+y*Z1/I0-(y1-DY1+DYV)/b1*Z1*tan(t1);
  string(diff(x0,x)*diff(y0,y)-diff(x0,y)*diff(y0,x));

 */
        J = (-((I1*Z1*Math.tan((2*G1)/Math.sqrt(((I1*y)/I0+DYV-DY1)**2+((I1*x)/I0+DXV-DX1)**2))
)/(I0*Math.sqrt(((I1*y)/I0+DYV-DY1)**2+((I1*x)/I0+DXV-DX1)**2)))-(I1*Z1*(-((I1*x)/I0)
-DXV+DX1)*((I1*x)/I0+DXV-DX1)*Math.tan((2*G1)/Math.sqrt(((I1*y)/I0+DYV-DY1)**2+((I1*x)/I0
+DXV-DX1)**2)))/(I0*(((I1*y)/I0+DYV-DY1)**2+((I1*x)/I0+DXV-DX1)**2)**(3/2))-(2*G1*
I1*Z1*(-((I1*x)/I0)-DXV+DX1)*((I1*x)/I0+DXV-DX1)/Math.cos((2*G1)/Math.sqrt(((I1*y)/I0+DYV
-DY1)**2+((I1*x)/I0+DXV-DX1)**2))**2)/(I0*(((I1*y)/I0+DYV-DY1)**2+((I1*x)/I0+DXV-
DX1)**2)**2)+Z1/I0+I1/I0)*(-((I1*Z1*Math.tan((2*G1)/Math.sqrt(((I1*y)/I0+DYV-DY1)**2+((I1*x
)/I0+DXV-DX1)**2)))/(I0*Math.sqrt(((I1*y)/I0+DYV-DY1)**2+((I1*x)/I0+DXV-DX1)**2)))-(I1
*Z1*(-((I1*y)/I0)-DYV+DY1)*((I1*y)/I0+DYV-DY1)*Math.tan((2*G1)/Math.sqrt(((I1*y)/I0+DYV-
DY1)**2+((I1*x)/I0+DXV-DX1)**2)))/(I0*(((I1*y)/I0+DYV-DY1)**2+((I1*x)/I0+DXV-DX1)
**2)**(3/2))-(2*G1*I1*Z1*(-((I1*y)/I0)-DYV+DY1)*((I1*y)/I0+DYV-DY1)/Math.cos((2*G1)/
Math.sqrt(((I1*y)/I0+DYV-DY1)**2+((I1*x)/I0+DXV-DX1)**2))**2)/(I0*(((I1*y)/I0+DYV-DY1)**
2+((I1*x)/I0+DXV-DX1)**2)**2)+Z1/I0+I1/I0)-(-((I1*Z1*((I1*x)/I0+DXV-DX1)*(-((I1*
y)/I0)-DYV+DY1)*Math.tan((2*G1)/Math.sqrt(((I1*y)/I0+DYV-DY1)**2+((I1*x)/I0+DXV-DX1)**2)))
/(I0*(((I1*y)/I0+DYV-DY1)**2+((I1*x)/I0+DXV-DX1)**2)**(3/2)))-(2*G1*I1*Z1*((I1*x)
/I0+DXV-DX1)*(-((I1*y)/I0)-DYV+DY1)/Math.cos((2*G1)/Math.sqrt(((I1*y)/I0+DYV-DY1)**2+((I1
*x)/I0+DXV-DX1)**2))**2)/(I0*(((I1*y)/I0+DYV-DY1)**2+((I1*x)/I0+DXV-DX1)**2)**2))*(
-((I1*Z1*(-((I1*x)/I0)-DXV+DX1)*((I1*y)/I0+DYV-DY1)*Math.tan((2*G1)/Math.sqrt(((I1*y)/I0
+DYV-DY1)**2+((I1*x)/I0+DXV-DX1)**2)))/(I0*(((I1*y)/I0+DYV-DY1)**2+((I1*x)/I0+DXV
-DX1)**2)**(3/2)))-(2*G1*I1*Z1*(-((I1*x)/I0)-DXV+DX1)*((I1*y)/I0+DYV-DY1)/Math.cos((2
*G1)/Math.sqrt(((I1*y)/I0+DYV-DY1)**2+((I1*x)/I0+DXV-DX1)**2))**2)/(I0*(((I1*y)/I0+DYV
-DY1)**2+((I1*x)/I0+DXV-DX1)**2)**2));

        if (J <= 0) J = 0;
      }
      L = l*J;

    }
    break;

  case 3: // Bridge

    x2 = x * I2/I0;
    y2 = y * I2/I0;

    b2 = Math.sqrt((x2 - DX2 + DXV)**2 + (y2 - DY2 + DYV)**2);
    theta2 = 2*G2/b2;
    if (b2 > R2 && Math.abs(theta2) < Math.PI/4)
    {
      x1 = x2 + x*Z2/I0 - (x2-DX2 + DXV)/b2*Z2*Math.tan(theta2);
      y1 = y2 + y*Z2/I0 - (y2-DY2 + DYV)/b2*Z2*Math.tan(theta2);

      b1 = Math.sqrt((x1 - DX1 + DXV)**2 + (y1 - DY1 + DYV)**2);
      theta1 = 2*G1/b1;
      if (b1 > R1 && Math.abs(theta1) < Math.PI/4)
      {
        x0 = x1 + x*Z1/I0 - (x2-DX2+DXV)/b2*Z1*Math.tan(theta2) - (x1-DX1+DXV)/b1*Z1*Math.tan(theta1);
        y0 = y1 + y*Z1/I0 - (y2-DY2+DYV)/b2*Z1*Math.tan(theta2) - (y1-DY1+DYV)/b1*Z1*Math.tan(theta1);

        l = getObject(x0 - DX0 + DXV, y0 - DY0 + DYV);
        if (doLum > 0)
        {
/*
  -- Jacobian determinant generated using Maxima:

  x2:x*I2/I0;
  y2:y*I2/I0;
  b2:sqrt((x2-DX2+DXV)^2+(y2-DY2+DYV)^2);
  theta2:2*G2/b2;
  x1:x2+x*Z2/I0-(x2-DX2+DXV)/b2*Z2*tan(theta2);
  y1:y2+y*Z2/I0-(y2-DY2+DYV)/b2*Z2*tan(theta2);
  b1:sqrt((x1-DX1+DXV)^2+(y1-DY1+DYV)^2);
  theta1:2*G1/b1;
  x0:x1+x*Z1/I0-(x2-DX2+DXV)/b2*Z1*tan(theta2)-(x1-DX1+DXV)/b1*Z1*tan(theta1);
  y0:y1+y*Z1/I0-(y2-DY2+DYV)/b2*Z1*tan(theta2)-(y1-DY1+DYV)/b1*Z1*tan(theta1);
  string(diff(x0,x)*diff(y0,y)-diff(x0,y)*diff(y0,x));
*/

          J = ((Z1*((I2*Z2*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))+(I2*Z2*(-((I2*x)/I0)-
DXV+DX2)*((I2*x)/I0+DXV-DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2))+(2*G2*I2*Z2
*(-((I2*x)/I0)-DXV+DX2)*((I2*x)/I0+DXV-DX2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)
**2)-Z2/I0-I2/I0)*Math.tan((2*G1)/Math.sqrt(((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/
I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2
)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2)))/Math.sqrt(((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt
(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV
-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2)-(Z1*(-((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-
DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))-(Z2*x)/I0-(I2*x)/I0-DXV+DX1)*(2*(-((I2*Z2*((I2*x)/I0+DXV-DX2)*(-((I2*y)/I0)-
DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2)))-(2*G2*I2*Z2*((I2*x)/I0+DXV-DX2
)*(-((I2*y)/I0)-DYV+DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2))*((Z2*(-((I2*y)
/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)+2*(
-((I2*Z2*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))-(I2*Z2*(-((I2*x)/I0)-DXV+DX2)*(
(I2*x)/I0+DXV-DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2))-(2*G2*I2*Z2*(-((I2*x
)/I0)-DXV+DX2)*((I2*x)/I0+DXV-DX2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2)+Z2/I0+
I2/I0)*((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(
I2*x)/I0+DXV-DX1))*Math.tan((2*G1)/Math.sqrt(((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x
)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-
DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2)))/(2*(((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/
Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV
-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2)**(3/2))-(G1*Z1*(-((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2
*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))-(Z2*x)/I0-(I2*x)/I0-DXV+DX1)*(2*(-((I2*Z2*((I2*x)/I0+DXV-DX2)*(-(
(I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2)))-(2*G2*I2*Z2*((I2*x
)/I0+DXV-DX2)*(-((I2*y)/I0)-DYV+DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2))*((Z2
*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV
-DY1)+2*(-((I2*Z2*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))-(I2*Z2*(-((I2*x)/I0)
-DXV+DX2)*((I2*x)/I0+DXV-DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2))-(2*G2*I2*
Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*x)/I0+DXV-DX2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2
)**2)+Z2/I0+I2/I0)*((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+
(Z2*x)/I0+(I2*x)/I0+DXV-DX1))/Math.cos((2*G1)/Math.sqrt(((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2
)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2
*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2))**2)/(((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-
DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((
I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2)**2-(I2*Z2*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)
/I0+DXV-DX2)**2)))/(I0*Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))-(I2*Z1*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*Math.sqrt(((I2*y)
/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))-(I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*x)/I0+DXV-DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((
I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2))-(I2*Z1*(-((I2*x)/I0)-DXV+DX2)*((I2*x)/I0+DXV-DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2
)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2))-(2*G2*I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*x)/I0+DXV-DX2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*
x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2)-(2*G2*I2*Z1*(-((I2*x)/I0)-DXV+DX2)*((I2*x)/I0+DXV-DX2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV
-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2)+Z2/I0+Z1/I0+I2/I0)*((Z1*((I2*Z2*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+
((I2*x)/I0+DXV-DX2)**2)))/(I0*Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))+(I2*Z2*(-((I2*y)/I0)-DYV+DY2)*((I2*y)/I0+DYV-DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV
-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2))+(2*G2*I2*Z2*(-((I2*y)/I0)-DYV+DY2)*((I2*y)/I0+DYV-DY2)/Math.cos((2*G2)/Math.sqrt
(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2)-Z2/I0-I2/I0)*Math.tan((2*G1)/Math.sqrt(((Z2*(-((I2*y)/I0)-DYV+DY2
)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*
x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2
)))/Math.sqrt(((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0
+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)
**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2)-(Z1*(-((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2
+((I2*x)/I0+DXV-DX2)**2))-(Z2*y)/I0-(I2*y)/I0-DYV+DY1)*(2*(-((I2*Z2*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*Math.sqrt(((I2*y)/I0+DYV-DY2)**
2+((I2*x)/I0+DXV-DX2)**2)))-(I2*Z2*(-((I2*y)/I0)-DYV+DY2)*((I2*y)/I0+DYV-DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV
-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2))-(2*G2*I2*Z2*(-((I2*y)/I0)-DYV+DY2)*((I2*y)/I0+DYV-DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(
I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2)+Z2/I0+I2/I0)*((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt
(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)+2*(-((I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*y)/I0+DYV-DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV
-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2)))-(2*G2*I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*y)/I0+DYV-DY2)/Math.cos((2*G2)/
Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2))*((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)
/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1))*Math.tan((2*G1)/Math.sqrt(((Z2*(-((I2*y)/I0)-DYV+
DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2
*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)
**2)))/(2*(((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0
+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2
)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2)**(3/2))-(G1*Z1*(-((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0
+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))-(Z2*y)/I0-(I2*y)/I0-DYV+DY1)*(2*(-((I2*Z2*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*Math.sqrt(((I2*y)/I0
+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))-(I2*Z2*(-((I2*y)/I0)-DYV+DY2)*((I2*y)/I0+DYV-DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2
*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2))-(2*G2*I2*Z2*(-((I2*y)/I0)-DYV+DY2)*((I2*y)/I0+DYV-DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2
)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2)+Z2/I0+I2/I0)*((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2
)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)+2*(-((I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*y)/I0+DYV-DY2)*Math.tan((2*G2)/Math.sqrt((
(I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2)))-(2*G2*I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*y)/I0+DYV-DY2)/
Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2))*((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt
(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1))/Math.cos((2*G1)/Math.sqrt(((Z2*(-((I2*
y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2
+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/
I0+DXV-DX1)**2))**2)/(((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2
)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/
I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2)**2-(I2*Z2*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0
+DXV-DX2)**2))-(I2*Z1*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))-(I2*Z2*(-((I2*y)/I0
)-DYV+DY2)*((I2*y)/I0+DYV-DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2))-(I2*Z1*(
-((I2*y)/I0)-DYV+DY2)*((I2*y)/I0+DYV-DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2
))-(2*G2*I2*Z2*(-((I2*y)/I0)-DYV+DY2)*((I2*y)/I0+DYV-DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0
+DXV-DX2)**2)**2)-(2*G2*I2*Z1*(-((I2*y)/I0)-DYV+DY2)*((I2*y)/I0+DYV-DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2
)**2+((I2*x)/I0+DXV-DX2)**2)**2)+Z2/I0+Z1/I0+I2/I0)-((Z1*((I2*Z2*((I2*x)/I0+DXV-DX2)*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-
DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2))+(2*G2*I2*Z2*((I2*x)/I0+DXV-DX2)*(-((I2*y)/I0)-DYV+DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2
+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2))*Math.tan((2*G1)/Math.sqrt(((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2
)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2
*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2)))/Math.sqrt(((Z2*(-((I2*y)/I0)-DYV+DY2)
*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x)
/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2)-
(Z1*(-((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))-(Z2*y)/I0-(
I2*y)/I0-DYV+DY1)*(2*(-((I2*Z2*((I2*x)/I0+DXV-DX2)*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2
)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2)))-(2*G2*I2*Z2*((I2*x)/I0+DXV-DX2)*(-((I2*y)/I0)-DYV+DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0
*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2))*((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV
-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)+2*(-((I2*Z2*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*Math.sqrt(((I2*y)/I0+DYV
-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))-(I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*x)/I0+DXV-DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)
/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2))-(2*G2*I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*x)/I0+DXV-DX2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2
))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2)+Z2/I0+I2/I0)*((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2
)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1))*Math.tan((2*G1)/Math.sqrt(((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-
DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((
I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2)))/(2*(((Z2*(-((I2*y)/I0)-DYV+DY2
)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x
)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2)
**(3/2))-(G1*Z1*(-((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))-
(Z2*y)/I0-(I2*y)/I0-DYV+DY1)*(2*(-((I2*Z2*((I2*x)/I0+DXV-DX2)*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y
)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2)))-(2*G2*I2*Z2*((I2*x)/I0+DXV-DX2)*(-((I2*y)/I0)-DYV+DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)
**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2))*((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt((
(I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)+2*(-((I2*Z2*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*Math.sqrt(((
I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))-(I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*x)/I0+DXV-DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(
I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2))-(2*G2*I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*x)/I0+DXV-DX2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0
+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2)+Z2/I0+I2/I0)*((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0
+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1))/Math.cos((2*G1)/Math.sqrt(((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2
*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*
G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2))**2)/(((Z2*(-((I2*y)/I0
)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2
*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV
-DX1)**2)**2-(I2*Z2*((I2*x)/I0+DXV-DX2)*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x
)/I0+DXV-DX2)**2)**(3/2))-(I2*Z1*((I2*x)/I0+DXV-DX2)*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2
)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2))-(2*G2*I2*Z2*((I2*x)/I0+DXV-DX2)*(-((I2*y)/I0)-DYV+DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*
(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2)-(2*G2*I2*Z1*((I2*x)/I0+DXV-DX2)*(-((I2*y)/I0)-DYV+DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2
)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2))*((Z1*((I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*y)/I0+DYV-DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+(
(I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2))+(2*G2*I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*y)/I0+DYV-DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)
/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2))*Math.tan((2*G1)/Math.sqrt(((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2
*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2
*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2)))/Math.sqrt(((Z2*(-((I2*y
)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+
((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0
+DXV-DX1)**2)-(Z1*(-((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2
))-(Z2*x)/I0-(I2*x)/I0-DXV+DX1)*(2*(-((I2*Z2*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**
2)))-(I2*Z2*(-((I2*y)/I0)-DYV+DY2)*((I2*y)/I0+DYV-DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV
-DX2)**2)**(3/2))-(2*G2*I2*Z2*(-((I2*y)/I0)-DYV+DY2)*((I2*y)/I0+DYV-DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2
)**2+((I2*x)/I0+DXV-DX2)**2)**2)+Z2/I0+I2/I0)*((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**
2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)+2*(-((I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*y)/I0+DYV-DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV
-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2)))-(2*G2*I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*y)/I0+DYV-DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2
)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2))*((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)
/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1))*Math.tan((2*G1)/Math.sqrt(((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt((
(I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan(
(2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2)))/(2*(((Z2*(-((I2*
y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2
+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/
I0+DXV-DX1)**2)**(3/2))-(G1*Z1*(-((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0
+DXV-DX2)**2))-(Z2*x)/I0-(I2*x)/I0-DXV+DX1)*(2*(-((I2*Z2*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0
+DXV-DX2)**2)))-(I2*Z2*(-((I2*y)/I0)-DYV+DY2)*((I2*y)/I0+DYV-DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2
*x)/I0+DXV-DX2)**2)**(3/2))-(2*G2*I2*Z2*(-((I2*y)/I0)-DYV+DY2)*((I2*y)/I0+DYV-DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)
/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2)+Z2/I0+I2/I0)*((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0
+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)+2*(-((I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*y)/I0+DYV-DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+(
(I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2)))-(2*G2*I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*y)/I0+DYV-DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y
)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2))*((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2
)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1))/Math.cos((2*G1)/Math.sqrt(((Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2
*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+DYV-DY1)**2+((Z2*(-((I2*x)/I0)-DXV
+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/I0+(I2*x)/I0+DXV-DX1)**2))**2)/(((
Z2*(-((I2*y)/I0)-DYV+DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*y)/I0+(I2*y)/I0+
DYV-DY1)**2+((Z2*(-((I2*x)/I0)-DXV+DX2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)+(Z2*x)/
I0+(I2*x)/I0+DXV-DX1)**2)**2-(I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*y)/I0+DYV-DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2*y)/I0+DYV
-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2))-(I2*Z1*(-((I2*x)/I0)-DXV+DX2)*((I2*y)/I0+DYV-DY2)*Math.tan((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)))/(I0*(((I2
*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**(3/2))-(2*G2*I2*Z2*(-((I2*x)/I0)-DXV+DX2)*((I2*y)/I0+DYV-DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2
)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2)-(2*G2*I2*Z1*(-((I2*x)/I0)-DXV+DX2)*((I2*y)/I0+DYV-DY2)/Math.cos((2*G2)/Math.sqrt(((I2*y)/I0+DYV-DY2)**2+((I2
*x)/I0+DXV-DX2)**2))**2)/(I0*(((I2*y)/I0+DYV-DY2)**2+((I2*x)/I0+DXV-DX2)**2)**2));

          if (J <= 0) J = 0;
        }
        L = l*J;
      }
    }
    break;

  case 4: // Triple lens

    x3 = x * I3/I0;
    y3 = y * I3/I0;

    b3 = Math.sqrt((x3 - DX3 + DXV)**2 + (y3 - DY3 + DYV)**2);
    theta3 = 2*G3/b3;
    if (b3 > R3 && Math.abs(theta3) < Math.PI/4)
    {
      x2 = x3 + x*Z3/I0 - (x3-DX3 + DXV)/b3*Z3*Math.tan(theta3);
      y2 = y3 + y*Z3/I0 - (y3-DY3 + DYV)/b3*Z3*Math.tan(theta3);

      b2 = Math.sqrt((x2 - DX2 + DXV)**2 + (y2 - DY2 + DYV)**2);
      theta2 = 2*G2/b2;
      if (b2 > R2 && Math.abs(theta2) < Math.PI/4)
      {
        x1 = x2 + x*Z2/I0  - (x3-DX3+DXV)/b3*Z2*Math.tan(theta3) - (x2-DX2 + DXV)/b2*Z2*Math.tan(theta2);
        y1 = y2 + y*Z2/I0  - (y3-DY3+DYV)/b3*Z2*Math.tan(theta3) - (y2-DY2 + DYV)/b2*Z2*Math.tan(theta2);

        b1 = Math.sqrt((x1 - DX1 + DXV)**2 + (y1 - DY1 + DYV)**2);
        theta1 = 2*G1/b1;
        if (b1 > R1 && Math.abs(theta1) < Math.PI/4)
        {
          x0 = x1 + x*Z1/I0 - (x3-DX3+DXV)/b3*Z1*Math.tan(theta3) - (x2-DX2+DXV)/b2*Z3*Math.tan(theta2) - (x1-DX1 + DXV)/b1*Z1*Math.tan(theta1);
          y0 = y1 + y*Z1/I0 - (y3-DY3+DYV)/b3*Z1*Math.tan(theta3) - (y2-DY2+DYV)/b2*Z3*Math.tan(theta2) - (y1-DY1 + DYV)/b1*Z1*Math.tan(theta1);

          l = getObject(x0 - DX0 + DXV, y0 - DY0 + DYV);
          L = l;
        }
      }
    }
    break;

  case 5: // Quadruple lens

    x4 = x * I4/I0;
    y4 = y * I4/I0;

    b4 = Math.sqrt((x4 - DX4 + DXV)**2 + (y4 - DY4 + DYV)**2);
    theta4 = 2 * G4/b4;
    if (b4 > R4 && Math.abs(theta4) < Math.PI/4)
    {
      x3 = x4 + x*Z4/I0 - (x4-DX4 + DXV)/b4*Z4*Math.tan(theta4);
      y3 = y4 + y*Z4/I0 - (y4-DY4 + DYV)/b4*Z4*Math.tan(theta4);

      b3 = Math.sqrt((x3 - DX3 + DXV)**2 + (y3 - DY3 + DYV)**2);
      theta3 = 2*G3/b3;
      if (b3 > R3 && Math.abs(theta3) < Math.PI/4)
      {
        x2 = x3 + x*Z3/I0  - (x4-DX4+DXV)/b4*Z3*Math.tan(theta4) - (x3-DX3 + DXV)/b3*Z3*Math.tan(theta3);
        y2 = y3 + y*Z3/I0  - (y4-DY4+DYV)/b4*Z3*Math.tan(theta4) - (y3-DY3 + DYV)/b3*Z3*Math.tan(theta3);

        b2 = Math.sqrt((x2 - DX2 + DXV)**2 + (y2 - DY2 + DYV)**2);
        theta2 = 2*G2/b2;
        if (b2 > R2 && Math.abs(theta2) < Math.PI/4)
        {
          x1 = x2 + x*Z2/I0 - (x4-DX4+DXV)/b4*Z2*Math.tan(theta4) - (x3-DX3+DXV)/b3*Z2*Math.tan(theta3) - (x2-DX2+DXV)/b2*Z2*Math.tan(theta2);
          y1 = y2 + y*Z2/I0 - (y4-DY4+DYV)/b4*Z2*Math.tan(theta4) - (y3-DY3+DYV)/b3*Z2*Math.tan(theta3) - (y2-DY2+DYV)/b2*Z2*Math.tan(theta2);

          b1 = Math.sqrt((x1 - DX1 + DXV)**2 + (y1 - DY1 + DYV)**2);
          theta1 = 2*G1/b1;
          if (b1 > R1 && Math.abs(theta1) < Math.PI/4)
          {
            x0 = x1 + x*Z1/I0 - (x4-DX4+DXV)/b4*Z1*Math.tan(theta4) - (x3-DX3+DXV)/b3*Z1*Math.tan(theta3) - (x2-DX2+DXV)/b2*Z1*Math.tan(theta2) - (x1-DX1+DXV)/b1*Z1*Math.tan(theta1);
            y0 = y1 + y*Z1/I0 - (y4-DY4+DYV)/b4*Z1*Math.tan(theta4) - (y3-DY3+DYV)/b3*Z1*Math.tan(theta3) - (y2-DY2+DYV)/b2*Z1*Math.tan(theta2) - (y1-DY1+DYV)/b1*Z1*Math.tan(theta1);

            l = getObject(x0 - DX0 + DXV, y0 - DY0 + DYV);
          L = l;
          }
        }
      }
    }
    break;

  }

  return {L:L, l:l};
}

var data = null;

function drawImagePixelByPixel()
{
  let l = 0;
  let L = 0;
  let max = 1;

  if (data == null) data = new Array(canvas.width * canvas.height);

  for (var x = 0; x < canvas.width; x++)
  {
    for (var y = 0; y < canvas.height; y++)
    {
      let lum = getColorAtPixel(x, y);
      data[y * canvas.width + x] = lum.L;
      if (max < lum.L) max = lum.L;
      l += lum.l;
      L += lum.L;
    }
  }

//  console.log("Scaling by " + (Z0/I0)**2/max);

  let imageData = context.createImageData(canvas.width, canvas.height);
  let image = imageData.data;

  for (var x = 0; x < canvas.width; x++)
  {
    for (var y = 0; y < canvas.height; y++)
    {
      let i = (y*canvas.width + x);
      let l = data[i] * 255 / max;
      i *= 4;
      image[i] = image[i+1] = image[i+2] = l;
      image[i+3] = 255;
    }
  }
  context.putImageData(imageData, 0, 0);

  return {'l':l, 'L':L};
}

window.onload = function()
{
  const params = new URLSearchParams(window.location.search);

  canvas = document.getElementById('imageCanvas');
  context = canvas.getContext('2d');
  R = canvas.width / 2;

  if (params.get('lum'))
  {
    doLum = params.get('lum') * 1;
    if (doLum > 0)
    {
      document.getElementById('lumtr1').style.display = "";
      document.getElementById('lumtr2').style.display = "";
    }
  }

  doUpdate();
  doChange();
}
