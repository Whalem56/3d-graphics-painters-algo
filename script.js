function setup() {
    "use strict";

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var m4 = twgl.m4;

    var slider1 = document.getElementById('slider1');
    slider1.value = 40;
    var slider2 = document.getElementById('slider2');
    slider2.value = 150;
    var slider3 = document.getElementById('slider3');
    slider3.value = 5;
    var slider4 = document.getElementById('slider4');
    slider4.value = 0;
    var slider5 = document.getElementById('slider5');
    slider5.value = 8;

    slider1.addEventListener('input', draw);
    slider2.addEventListener('input', draw);
    slider3.addEventListener('input', draw);
    slider4.addEventListener('input', draw);
    slider5.addEventListener('input', draw);

    draw();

    function draw() {

        var angle1 = slider1.value * 0.01 * Math.PI;
        var height = slider2.value;
        var angle2 = slider3.value * 0.01 * Math.PI;
        var angle3 = slider4.value * 0.01 * Math.PI;
        var zoomFactor = Math.PI / slider5.value;
        var axis = [1, 1, 1];

        var Tmodel = m4.multiply(m4.scaling([0.6, 0.6, 0.6]), m4.multiply(m4.translation([40, 40, 40]), m4.axisRotation(axis, angle3)));

        var eye = [600 * Math.cos(angle1), height, 600 * Math.sin(angle1)];
        var target = [0, 0, 0];
        var up = [0, 1, 0];

        var Tcamera = m4.inverse(m4.lookAt(eye, target, up));
        var Tprojection = m4.perspective(zoomFactor, 1, 5, 400);
        var Tviewport = m4.multiply(m4.scaling([200, -200, 200]), m4.translation([canvas.width / 2.0, canvas.width / 2.0, 0]));

        var Tmc = m4.multiply(Tmodel, Tcamera);
        var Tcpv = m4.multiply(m4.multiply(Tcamera, Tprojection), Tviewport);
        var Tmcpv = m4.multiply(Tmodel, Tcpv);

        var triangles = getRectangularPrismTriangles();
        insertLeftArmTriangles(-angle2, triangles);
        insertRightArmTriangles(angle2, triangles);
        insertLeftLegTriangles(triangles);
        insertRightLegTriangles(triangles);

        paintersAlgorithm(Tmcpv, triangles);

        // Clear canvas.
        canvas.width = canvas.width;

        drawAxes(Tcpv);
        drawScene(Tmcpv, triangles);
    }

    function moveToTx(x, y, z, Tx) {
        var pos = [x, y, z];
        var posTx = m4.transformPoint(Tx, pos);
        context.moveTo(posTx[0], posTx[1]);
    }

    function lineToTx(x, y, z, Tx) {
        var pos = [x, y, z];
        var posTx = m4.transformPoint(Tx, pos);
        context.lineTo(posTx[0], posTx[1]);
    }

    function drawAxes(Tx) {
        context.lineWidth = 3;
        // Draw x-axis.
        context.beginPath();
        context.strokeStyle = 'red';
        moveToTx(0, 0, 0, Tx);
        lineToTx(100, 0, 0, Tx);
        context.stroke();
        context.closePath();

        // Draw y-axis.
        context.beginPath();
        context.strokeStyle = 'green';
        moveToTx(0, 0, 0, Tx);
        lineToTx(0, 100, 0, Tx);
        context.stroke();
        context.closePath();

        // Draw z-axis.
        context.beginPath();
        context.strokeStyle = 'blue';
        moveToTx(0, 0, 0, Tx);
        lineToTx(0, 0, 100, Tx);
        context.stroke();
        context.closePath();
    }

    function drawScene(Tx, triangles) {
        var i;
        for (i = triangles.length - 1; i >= 0; --i) {
            drawTriangle(triangles[i], Tx);
        }
    }

    function drawTriangle(triangle, Tx) {
        context.beginPath();
        context.fillStyle = triangle[3];
        moveToTx(triangle[0][0], triangle[0][1], triangle[0][2], Tx);
        lineToTx(triangle[1][0], triangle[1][1], triangle[1][2], Tx);
        lineToTx(triangle[2][0], triangle[2][1], triangle[2][2], Tx);
        context.closePath();
        context.fill();
    }

    function getRectangularPrismTriangles() {
        var recPrismTriangles = [
            // Bottom of prism.
            [[0, 0, 0], [50, 0, 37], [50, 0, 0], 'gray', 0],
            [[0, 0, 0], [50, 0, 37], [0, 0, 37], 'black', 0],

            // Sides of prism.
            [[0, 0, 0], [50, 100, 0], [0, 100, 0], 'gray', 0],
            [[0, 0, 0], [50, 100, 0], [50, 0, 0], 'black', 0],

            [[50, 0, 0], [50, 100, 37], [50, 100, 0], 'gray', 0],
            [[50, 0, 0], [50, 100, 37], [50, 0, 37], 'black', 0],

            [[50, 0, 37], [0, 100, 37], [50, 100, 37], 'gray', 0],
            [[50, 0, 37], [0, 100, 37], [0, 0, 37], 'black', 0],

            [[0, 0, 37], [0, 100, 0], [0, 100, 37], 'gray', 0],
            [[0, 0, 37], [0, 100, 0], [0, 0, 0], 'black', 0],

            // Top of prism.
            [[0, 100, 0], [50, 100, 37], [50, 100, 0], 'black', 0],
            [[0, 100, 0], [50, 100, 37], [0, 100, 37], 'black', 0]
        ];

        return recPrismTriangles;
    }

    function insertLeftArmTriangles(angle, triangles) {
        var leftArmTriangles = getRectangularPrismTriangles();
        var TleftArm = m4.multiply(m4.translation([-50, -100, 0]), m4.multiply(m4.scaling([0.4, 0.6, 0.4]), m4.multiply(m4.rotationZ(angle), m4.translation([0, 80, 9]))));
        var i = 0;
        for (i = 0; i < leftArmTriangles.length; ++i) {
            leftArmTriangles[i][0] = m4.transformPoint(TleftArm, leftArmTriangles[i][0]);
            leftArmTriangles[i][1] = m4.transformPoint(TleftArm, leftArmTriangles[i][1]);
            leftArmTriangles[i][2] = m4.transformPoint(TleftArm, leftArmTriangles[i][2]);
        }

        leftArmTriangles.forEach(function (triangle) {
            triangles.push(triangle);
        });
    }

    function insertRightArmTriangles(angle, triangles) {
        var rightArmTriangles = getRectangularPrismTriangles();
        var TrightArm = m4.multiply(m4.translation([0, -100, 0]), m4.multiply(m4.scaling([0.4, 0.6, 0.4]), m4.multiply(m4.rotationZ(angle), m4.translation([50, 80, 9]))));
        var i = 0;
        for (i = 0; i < rightArmTriangles.length; ++i) {
            rightArmTriangles[i][0] = m4.transformPoint(TrightArm, rightArmTriangles[i][0]);
            rightArmTriangles[i][1] = m4.transformPoint(TrightArm, rightArmTriangles[i][1]);
            rightArmTriangles[i][2] = m4.transformPoint(TrightArm, rightArmTriangles[i][2]);
        }

        rightArmTriangles.forEach(function (triangle) {
            triangles.push(triangle);
        });
    }

    function insertLeftLegTriangles(triangles) {
        var leftLegTriangles = getRectangularPrismTriangles();
        var TleftLeg = m4.multiply(m4.multiply(m4.translation([0, -100, 0]), 
        m4.scaling([0.4, 0.6, 0.6])), m4.translation([0, 0, 9]));
        var i = 0;
        for (i = 0; i < leftLegTriangles.length; ++i) {
            leftLegTriangles[i][0] = m4.transformPoint(TleftLeg, leftLegTriangles[i][0]);
            leftLegTriangles[i][1] = m4.transformPoint(TleftLeg, leftLegTriangles[i][1]);
            leftLegTriangles[i][2] = m4.transformPoint(TleftLeg, leftLegTriangles[i][2]);
        }

        leftLegTriangles.forEach(function (triangle) {
            triangles.push(triangle);
        });
    }

    function insertRightLegTriangles(triangles) {
        var rightLegTriangles = getRectangularPrismTriangles();
        var TrightLeg = m4.multiply(m4.multiply(m4.translation([0, -100, 0]), 
        m4.scaling([0.4, 0.6, 0.6])), m4.translation([25, 0, 9]));
        var i = 0;
        for (i = 0; i < rightLegTriangles.length; ++i) {
            rightLegTriangles[i][0] = m4.transformPoint(TrightLeg, rightLegTriangles[i][0]);
            rightLegTriangles[i][1] = m4.transformPoint(TrightLeg, rightLegTriangles[i][1]);
            rightLegTriangles[i][2] = m4.transformPoint(TrightLeg, rightLegTriangles[i][2]);
        }

        rightLegTriangles.forEach(function (triangle) {
            triangles.push(triangle);
        });
    }

    function paintersAlgorithm(Tx, triangles) {
        var i;
        // Calculate and store depth (averaged z-component) of each triangle.
        for (i = 0; i < triangles.length; ++i) {
            var point1Tx = m4.transformPoint(Tx, triangles[i][0]);
            var point2Tx = m4.transformPoint(Tx, triangles[i][1]);
            var point3Tx = m4.transformPoint(Tx, triangles[i][2]);
            var depth = (point1Tx[2] + point2Tx[2] + point3Tx[2]) / 3;
            triangles[i][4] = depth;
        }
        // Sort collection of triangles based on depth. If a's depth is less than b's depth,
        // a will come before b in the sorted array.
        triangles.sort(function (a, b) {
            return a[4] - b[4];
        });
    }
}

window.onload = setup;