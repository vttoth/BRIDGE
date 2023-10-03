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
// This version dated 2023/10/03.

var canvas;
var context;
var R = 500;
var model = 1;
var R1 = 0;
var R2 = 0;
var R3 = 0;
var R4 = 0;
var G1 = 50;
var G2 = 50;
var G3 = 50;
var G4 = 50;
var Z0 = 100000;
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
var R0 = 500;
var DX = 1e-4;
var DY = 1e-4;

// To remind myself: Naive calculation of luminosity doesn't work as the
// sizes of pixels/surface elements change as a result of diverging and
// converging light rays, so we'd be comparing apples and oranges.

var l0 = 0;
var L0 = 0;

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
    DY4: DY4
  });

  let blob = new Blob([savedata], {type: "application/json"});
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download=document.title + ".json";
  a.click();
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
  document.getElementById('G1').value = G1;
  document.getElementById('G2').value = G2;
  document.getElementById('R1').value = R1;
  document.getElementById('R2').value = R2;
  document.getElementById('Z1').value = Z1;
  document.getElementById('Z2').value = Z2;
  document.getElementById('I1').value = I1;
  document.getElementById('I2').value = I2;
  document.getElementById('G3').value = G3;
  document.getElementById('G4').value = G4;
  document.getElementById('R3').value = R3;
  document.getElementById('R4').value = R4;
  document.getElementById('Z3').value = Z3;
  document.getElementById('Z4').value = Z4;
  document.getElementById('I3').value = I3;
  document.getElementById('I4').value = I4;
  document.getElementById('DX0').value = DX0;
  document.getElementById('DY0').value = DY0;
  document.getElementById('DX1').value = DX1;
  document.getElementById('DY1').value = DY1;
  document.getElementById('DX2').value = DX2;
  document.getElementById('DY2').value = DY2;
  document.getElementById('DX3').value = DX3;
  document.getElementById('DY3').value = DY3;
  document.getElementById('DX4').value = DX4;
  document.getElementById('DY4').value = DY4;
  document.getElementById('R0').value = R0;
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
  }, 0);
}

function getObject(x, y)
{
  let r = Math.sqrt(x*x + y*y);
  let l = r < R0 ? Math.cos(r*Math.PI/2/R0) * 255 : 0;
  return l;
}

function getColorAtPixel(x, y)
{
  let l = 0;
  let L = 0;
  let theta;
  let b, b1, b2, b3;
  let x0, y0;
  let dx, dy;

  x = (x-R)*1000/canvas.width;
  y = (y-R)*1000/canvas.height;

  switch (1*model)
  {
  case 1: // Unobstructed object
    x = x*Z0/I0 - DX0;
    y = y*Z0/I0 - DY0;
    l = getObject(x, y);
    L = l * Z0*Z0/I0/I0;
    break;

  case 2: // Single lens

    // Initial scaling for viewing distance
    x0 = x * I1/I0;
    y0 = y * I1/I0;

    // Impact parameter
    b = Math.sqrt((x0 - DX1)**2 + (y0 - DY1)**2);
    theta = G1/b;
    if (b > R1 && Math.abs(theta) < Math.PI/4)
    {
      x0 = x + x0*(Z1+I1)/I1 - (x0-DX1)/b*Z1*Math.tan(theta);
      y0 = y + y0*(Z1+I1)/I1 - (y0-DY1)/b*Z1*Math.tan(theta);

      l = getObject(x0 - DX0, y0 - DY0);
      L = l;
    }
    break;

  case 3: // Bridge

    // Initial scaling for viewing distance
    x0 = x * I2/I0;
    y0 = y * I2/I0;

    // Impact parameter
    b = Math.sqrt((x0 - DX2)**2 + (y0 - DY2)**2);
    theta = G2/b;
    if (b > R2 && Math.abs(theta) < Math.PI/4)
    {
      x0 = x + x0*(Z2+I2)/I2 - (x0-DX2)/b*Z2*Math.tan(theta);
      y0 = y + y0*(Z2+I2)/I2 - (y0-DY2)/b*Z2*Math.tan(theta);

      b = Math.sqrt((x0 - DX1)**2 + (y0 - DY1)**2);
      theta = G1/b;
      if (b > R1 && Math.abs(theta) < Math.PI/4)
      {
        x0 = x + x0*(Z1+Z2+I2)/(Z2+I2)  - (x0-DX1)/b*Z1*Math.tan(theta);
        y0 = y + y0*(Z1+Z2+I2)/(Z2+I2)  - (y0-DY1)/b*Z1*Math.tan(theta);

        l = getObject(x0 - DX0, y0 - DY0);
        L = l;
      }
    }
    break;

  case 4: // Triple lens

    // Initial scaling for viewing distance
    x0 = x * I3/I0;
    y0 = y * I3/I0;

    // Impact parameter
    b = Math.sqrt((x0 - DX3)**2 + (y0 - DY3)**2);
    theta = G3/b;
    if (b > R3 && Math.abs(theta) < Math.PI/4)
    {
      x0 = x + x0*(Z3+I3)/I3 - (x0-DX3)/b*Z3*Math.tan(theta);
      y0 = y + y0*(Z3+I3)/I3 - (y0-DY3)/b*Z3*Math.tan(theta);

      b = Math.sqrt((x0 - DX2)**2 + (y0 - DY2)**2);
      theta = G2/b;
      if (b > R2 && Math.abs(theta) < Math.PI/4)
      {
        x0 = x + x0*(Z2+Z3+I3)/(Z3+I3)  - (x0-DX2)/b*Z2*Math.tan(theta);
        y0 = y + y0*(Z2+Z3+I3)/(Z3+I3)  - (y0-DY2)/b*Z2*Math.tan(theta);

        b = Math.sqrt((x0 - DX1)**2 + (y0 - DY1)**2);
        theta = G1/b;
        if (b > R1 && Math.abs(theta) < Math.PI/4)
        {
          x0 = x + x0*(Z1+Z2+Z3+I3)/(Z2+Z3+I3) - (x0-DX1)/b*Z1*Math.tan(theta);
          y0 = y + y0*(Z1+Z2+Z3+I3)/(Z2+Z3+I3) - (y0-DY1)/b*Z1*Math.tan(theta);

          l = getObject(x0 - DX0, y0 - DY0);
          L = l;
        }
      }
    }
    break;

  case 5: // Quadruple lens

    // Initial scaling for viewing distance
    x0 = x * I4/I0;
    y0 = y * I4/I0;

    // Impact parameter
    b = Math.sqrt((x0 - DX4)**2 + (y0 - DY4)**2);
    theta = G4/b;
    if (b > R4 && Math.abs(theta) < Math.PI/4)
    {
      x0 = x + x0*(Z4+I4)/I4 - (x0-DX4)/b*Z4*Math.tan(theta);
      y0 = y + y0*(Z4+I4)/I4 - (y0-DY4)/b*Z4*Math.tan(theta);

      b = Math.sqrt((x0 - DX3)**2 + (y0 - DY3)**2);
      theta = G3/b;
      if (b > R3 && Math.abs(theta) < Math.PI/4)
      {
        x0 = x + x0*(Z3+Z4+I4)/(Z4+I4)  - (x0-DX3)/b*Z3*Math.tan(theta);
        y0 = y + y0*(Z3+Z4+I4)/(Z4+I4)  - (y0-DY3)/b*Z3*Math.tan(theta);

        b = Math.sqrt((x0 - DX2)**2 + (y0 - DY2)**2);
        theta = G2/b;
        if (b > R2 && Math.abs(theta) < Math.PI/4)
        {
          x0 = x + x0*(Z2+Z3+Z4+I4)/(Z3+Z4+I4) - (x0-DX2)/b*Z2*Math.tan(theta);
          y0 = y + y0*(Z2+Z3+Z4+I4)/(Z3+Z4+I4) - (y0-DY2)/b*Z2*Math.tan(theta);

          b = Math.sqrt((x0 - DX1)**2 + (y0 - DY1)**2);
          theta = G1/b;
          if (b > R1 && Math.abs(theta) < Math.PI/4)
          {
            x0 = x + x0*(Z1+Z2+Z3+Z4+I4)/(Z2+Z3+Z4+I4) - (x0-DX1)/b*Z1*Math.tan(theta);
            y0 = y + y0*(Z1+Z2+Z3+Z4+I4)/(Z2+Z3+Z4+I4) - (y0-DY1)/b*Z1*Math.tan(theta);

            l = getObject(x0 - DX0, y0 - DY0);
            L = l;
          }
        }
      }
    }
    break;

  }

  return {'l':l, 'L':L};
}

function drawImagePixelByPixel()
{
  let l = 0;
  let L = 0;
  for (var x = 0; x < canvas.width; x++)
  {
    for (var y = 0; y < canvas.height; y++)
    {
      let lum = getColorAtPixel(x, y);
      l += lum.l;
      L += lum.L;
      context.fillStyle = 'rgb(' + lum.l + ',' + lum.l + ',' + lum.l + ')';
      context.fillRect(x, y, 1, 1);
    }
  }
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
    let lum = params.get('lum');
    if (lum*1 > 0)
    {
      document.getElementById('lumtr1').style.display = "";
      document.getElementById('lumtr2').style.display = "";
    }
  }

  doUpdate();
  doChange();
}
