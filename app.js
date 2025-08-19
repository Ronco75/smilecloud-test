let triangleData = null;
let canvas = null;
let ctx = null;

window.onload = function() {
    if (window.location.pathname.includes('display.html')) {
        initializeDisplay();
    } else if (window.location.pathname.includes('input.html')) {
        initializeInput();
    }
};

function initializeDisplay() {
    const storedData = localStorage.getItem('triangleData');
    
    if (!storedData) {
        document.getElementById('errorMessage').style.display = 'block';
        return;
    }

    try {
        triangleData = JSON.parse(storedData);
        canvas = document.getElementById('triangleCanvas');
        ctx = canvas.getContext('2d');
        
        displayTriangle();
        document.getElementById('triangleDisplay').style.display = 'block';
    } catch (error) {
        document.getElementById('errorMessage').style.display = 'block';
        console.error('Error parsing triangle data:', error);
    }
}

function initializeInput() {
    document.getElementById('point1-x').value = 100;
    document.getElementById('point1-y').value = 100;
    document.getElementById('point2-x').value = 400;
    document.getElementById('point2-y').value = 100;
    document.getElementById('point3-x').value = 250;
    document.getElementById('point3-y').value = 350;

    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            createTriangle();
        }
    });
}

function displayTriangle() {
    const points = triangleData.points;
    
    const scaledPoints = scalePointsToCanvas(points);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawTriangle(scaledPoints);
    
    const angles = calculateAngles(points);
    displayAngles(angles, scaledPoints);
    
    updateInfoPanel(points, angles);
}

function scalePointsToCanvas(points) {
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    const padding = 80;
    const availableWidth = canvas.width - 2 * padding;
    const availableHeight = canvas.height - 2 * padding;
    
    const scale = Math.min(availableWidth / Math.max(width, 1), availableHeight / Math.max(height, 1));
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const triangleCenterX = (minX + maxX) / 2;
    const triangleCenterY = (minY + maxY) / 2;
    
    return points.map(point => ({
        x: centerX + (point.x - triangleCenterX) * scale,
        y: centerY + (point.y - triangleCenterY) * scale
    }));
}

function drawTriangle(points) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.closePath();
    
    ctx.strokeStyle = '#495057';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
    ctx.fill();
    
    points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#667eea';
        ctx.fill();
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        const label = ['A', 'B', 'C'][index];
        ctx.fillText(label, point.x, point.y - 15);
    });
}

function calculateAngles(points) {
    const a = distance(points[1], points[2]);
    const b = distance(points[0], points[2]); 
    const c = distance(points[0], points[1]);
    
    const angleA = Math.acos((b * b + c * c - a * a) / (2 * b * c));
    const angleB = Math.acos((a * a + c * c - b * b) / (2 * a * c));
    const angleC = Math.acos((a * a + b * b - c * c) / (2 * a * b));
    
    return [
        angleA * 180 / Math.PI,
        angleB * 180 / Math.PI,
        angleC * 180 / Math.PI
    ];
}

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function displayAngles(angles, scaledPoints) {
    const arcRadius = 30;
    
    drawAngleArc(scaledPoints[0], scaledPoints[1], scaledPoints[2], arcRadius, '#667eea');
    drawAngleLabel(scaledPoints[0], scaledPoints[1], scaledPoints[2], angles[0], arcRadius + 15);
    
    drawAngleArc(scaledPoints[1], scaledPoints[0], scaledPoints[2], arcRadius, '#28a745');
    drawAngleLabel(scaledPoints[1], scaledPoints[0], scaledPoints[2], angles[1], arcRadius + 15);
    
    drawAngleArc(scaledPoints[2], scaledPoints[0], scaledPoints[1], arcRadius, '#dc3545');
    drawAngleLabel(scaledPoints[2], scaledPoints[0], scaledPoints[1], angles[2], arcRadius + 15);
}

function drawAngleArc(vertex, point1, point2, radius, color) {
    const angle1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x);
    const angle2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x);
    
    ctx.beginPath();
    ctx.arc(vertex.x, vertex.y, radius, angle1, angle2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawAngleLabel(vertex, point1, point2, angleValue, labelRadius) {
    const angle1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x);
    const angle2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x);
    let midAngle = (angle1 + angle2) / 2;
    
    if (Math.abs(angle2 - angle1) > Math.PI) {
        midAngle += Math.PI;
    }
    
    const labelX = vertex.x + Math.cos(midAngle) * labelRadius;
    const labelY = vertex.y + Math.sin(midAngle) * labelRadius;
    
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(angleValue.toFixed(1) + '°', labelX, labelY + 5);
}

function updateInfoPanel(points, angles) {
    document.getElementById('pointA-coords').textContent = `(${points[0].x}, ${points[0].y})`;
    document.getElementById('pointB-coords').textContent = `(${points[1].x}, ${points[1].y})`;
    document.getElementById('pointC-coords').textContent = `(${points[2].x}, ${points[2].y})`;
    
    document.getElementById('angleA').textContent = angles[0].toFixed(2) + '°';
    document.getElementById('angleB').textContent = angles[1].toFixed(2) + '°';
    document.getElementById('angleC').textContent = angles[2].toFixed(2) + '°';
}

function goBack() {
    window.location.href = 'input.html';
}

function createTriangle() {
    const point1 = {
        x: parseFloat(document.getElementById('point1-x').value) || 0,
        y: parseFloat(document.getElementById('point1-y').value) || 0
    };
    const point2 = {
        x: parseFloat(document.getElementById('point2-x').value) || 0,
        y: parseFloat(document.getElementById('point2-y').value) || 0
    };
    const point3 = {
        x: parseFloat(document.getElementById('point3-x').value) || 0,
        y: parseFloat(document.getElementById('point3-y').value) || 0
    };

    const triangleData = {
        points: [point1, point2, point3]
    };
    
    localStorage.setItem('triangleData', JSON.stringify(triangleData));
    
    window.location.href = 'display.html';
}